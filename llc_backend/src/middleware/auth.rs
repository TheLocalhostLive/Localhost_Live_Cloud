use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage,
};
use auth0_rs::Auth0;
use futures_util::future::{ok, LocalBoxFuture, Ready};
use reqwest::Client;
use serde_json::json;
use std::sync::Arc;
use std::task::{Context, Poll};

use crate::model::Claims;

// Define the middleware
pub struct AuthMiddleware {
    pub auth0_domain: String,
    pub audience: String,
    pub client: Arc<Client>,
}

impl<S, B> Transform<S, ServiceRequest> for AuthMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = AuthMiddlewareMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(AuthMiddlewareMiddleware {
            service: Arc::new(service),
            auth0_domain: self.auth0_domain.clone(),
            audience: self.audience.clone(),
            client: Arc::clone(&self.client),
        })
    }
}

// Define the middleware service implementation
pub struct AuthMiddlewareMiddleware<S> {
    service: Arc<S>,
    auth0_domain: String,
    audience: String,
    client: Arc<Client>,
}

impl<S, B> Service<ServiceRequest> for AuthMiddlewareMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let headers = req.headers().clone();
        let auth0_domain = self.auth0_domain.clone();
        let audience = self.audience.clone();
        let client = Arc::clone(&self.client);
        let service = Arc::clone(&self.service);

        Box::pin(async move {
            // Allow CORS preflight (OPTIONS) requests to pass without authentication
            if req.method() == Method::OPTIONS {
                return service.call(req).await;
            }

            // Example token validation (simplified for demonstration)
            if let Some(auth_header) = headers.get("Authorization") {
                if let Ok(auth_str) = auth_header.to_str() {
                    if auth_str.starts_with("Bearer ") {
                        let token = &auth_str[7..];

                        // Fetch JWKS from Auth0
                        let jwks_url = format!("https://{}/.well-known/jwks.json", auth0_domain);
                        // println!("JWKS URL: {}", jwks_url);
                        
                        let jwks = client
                            .get(&jwks_url)
                            .send()
                            .await
                            .map_err(|_| {
                                actix_web::error::ErrorUnauthorized("Could not fetch JWKS")
                            })?
                            .json::<serde_json::Value>()
                            .await
                            .map_err(|_| {
                                actix_web::error::ErrorUnauthorized("Invalid JWKS format")
                            })?;
                        
                        // Ensure we have a "keys" array
                        let keys = jwks["keys"].as_array().ok_or_else(|| {
                            actix_web::error::ErrorUnauthorized("Invalid JWKS format: 'keys' array not found")
                        })?;
                        
                        // Create a new JSON object with just the "keys" field
                        let formatted_jwks = json!({ "keys": keys });
                        
                        // Serialize the formatted JWKS to a string
                        let jwks_str = serde_json::to_string(&formatted_jwks).map_err(|_| {
                            actix_web::error::ErrorUnauthorized("Failed to serialize JWKS")
                        })?;
                        
                        let auth0 = Auth0::new(&jwks_str).map_err(|e| {
                            actix_web::error::ErrorUnauthorized(format!("Failed to initialize Auth0: {:?}", e))
                        })?;
                        
                        let res = auth0.validate_token(token);
                        assert_eq!(res.is_ok(), true);
                        let  claims = res.unwrap();
                        dbg!(claims);
                        
                        //println!("{}", claims["aud"][1]);
                        // assert_eq!(
                        //     claims.as_object().unwrap().get("aud").unwrap(),
                        //     "https://dev-jfhfrg7tmi1fr64.us.auth0.com/api/v2/"
                        // );
                        //req.extensions_mut().insert(claims.clone());
                        return service.call(req).await;
                    }
                }
            }

            // If no valid token, return unauthorized
            Err(actix_web::error::ErrorUnauthorized(
                "No valid authorization token",
            ))
        })
    }

    fn poll_ready(&self, _: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }
}
