use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error,
};
use futures_util::future::{ok, Ready, LocalBoxFuture};
use reqwest::Client;
use std::sync::Arc;
use std::task::{Context, Poll};

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
            // Example token validation (simplified for demonstration)
            if let Some(auth_header) = headers.get("Authorization") {
                if let Ok(auth_str) = auth_header.to_str() {
                    if auth_str.starts_with("Bearer ") {
                        let token = &auth_str[7..];

                        // Fetch JWKS from Auth0
                        let jwks_url = format!("https://{}/.well-known/jwks.json", auth0_domain);
                        let jwks = client
                            .get(&jwks_url)
                            .send()
                            .await
                            .map_err(|_| actix_web::error::ErrorUnauthorized("Could not fetch JWKS"))?
                            .json::<serde_json::Value>()
                            .await
                            .map_err(|_| actix_web::error::ErrorUnauthorized("Invalid JWKS format"))?;

                        // Simplified token decoding and validation
                        // Proceed if the token is valid
                        return service.call(req).await;
                    }
                }
            }

            // If no valid token, return unauthorized
            Err(actix_web::error::ErrorUnauthorized("No valid authorization token"))
        })
    }

    fn poll_ready(&self, _: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }
}
