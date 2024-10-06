use crate::model::User;
use actix_cors::Cors;
use actix_web::http::header;
use actix_web::web::head;
use actix_web::{web, App, HttpMessage, HttpRequest, HttpResponse, HttpServer, Responder,Result};
use dotenv::dotenv;
use futures::stream::TryStreamExt;
use model::Container;
use mongodb::bson::oid::ObjectId;
use mongodb::{bson::doc, Collection};
use std::env;
mod db;
mod handler;
mod model;
use crate::handler::utils::{create_order};
use std::fs::File;
use std::io::{BufReader, Read};
use std::process::Stdio;
use std::sync::{Arc, RwLock};
use std::time::Duration;
use tokio::process::Command;
use tokio::time::sleep;
pub mod middleware;
use crate::middleware::auth::AuthMiddleware;
use reqwest::{Client};
use actix_files::Files;
use actix_files::NamedFile;

// Initialize MongoDB Collection
fn get_user_collection(db: web::Data<mongodb::Database>) -> Collection<User> {
    db.collection::<User>("users")
}

// Create a new user
async fn create_user(db: web::Data<mongodb::Database>, user: web::Json<User>) -> impl Responder {
    let collection = get_user_collection(db);
    let new_user = User {
        id: None,
        name: user.name.clone(),
        email: user.email.clone(),
    };
    let result = collection.insert_one(new_user).await;

    match result {
        Ok(inserted) => HttpResponse::Ok().json(inserted.inserted_id),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// Get all users
async fn get_users(db: web::Data<mongodb::Database>) -> impl Responder {
    let collection = get_user_collection(db);
    let mut cursor = collection.find(doc! {}).await.unwrap();

    let mut users = vec![];

    while let Some(user) = cursor.try_next().await.unwrap() {
        users.push(user);
    }

    HttpResponse::Ok().json(users)
}

// Get user by ID
async fn get_user(db: web::Data<mongodb::Database>, path: web::Path<String>) -> impl Responder {
    let collection = get_user_collection(db);
    let id = ObjectId::parse_str(&path.into_inner()).unwrap();

    let user = collection.find_one(doc! { "_id": id }).await.unwrap();

    match user {
        Some(user) => HttpResponse::Ok().json(user),
        None => HttpResponse::NotFound().finish(),
    }
}

// Update a user by ID
async fn update_user(
    db: web::Data<mongodb::Database>,
    path: web::Path<String>,
    user: web::Json<User>,
) -> impl Responder {
    let collection = get_user_collection(db);
    let id = ObjectId::parse_str(&path.into_inner()).unwrap();

    let result = collection
        .update_one(
            doc! { "_id": id },
            doc! { "$set": { "name": &user.name, "email": &user.email }},
        )
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// Delete a user by ID
async fn delete_user(db: web::Data<mongodb::Database>, path: web::Path<String>) -> impl Responder {
    let collection = get_user_collection(db);
    let id = ObjectId::parse_str(&path.into_inner()).unwrap();

    let result = collection.delete_one(doc! { "_id": id }).await;

    match result {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn test_route(req: HttpRequest) -> impl Responder {
    if let Some(user_info) = req.extensions_mut().get::<serde_json::Value>() {
        // Use the user info as needed
        // For example, return user info in the response
        return HttpResponse::Ok().json(user_info);
    }
    HttpResponse::Unauthorized().finish()
}

// Import AsyncReadExt for reading process output
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    println!("Mongo URI: {}", mongo_uri);
    let db = db::init_db().await;

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://127.0.0.1:5173")
            .allowed_origin("http://localhost:5173")
            .allowed_origin("https://cloud.thelocalhost.live")
            .allowed_origin("http://localhost:5173/check-console")
            .allowed_origin("https://cloud.thelocalhost.live/check-console")
            .allowed_origin("http://localhost:5173/dashboard")
            .allowed_origin("http://127.0.0.1:5173/dashboard")
            .allowed_origin("https://cloud.thelocalhost.live/dashboard")
            .allowed_origin("http://127.0.0.1:5173/vm")
            .allowed_origin("http://localhost:5173/vm")
            .allowed_origin("https://cloud.thelocalhost.live/vm")
            .allowed_origin("http://127.0.0.1:5173/donate")
            .allowed_origin("http://localhost:5173/donate")
            .allowed_origin("https://cloud.thelocalhost.live/donate")
            .allowed_origin("http://localhost:5173/host")
            .allowed_origin("http://127.0.0.1:5173/host")
            .allowed_origin("https://cloud.thelocalhost.live/host")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"]) // Use a Vec for methods
            .allowed_headers(vec![
                header::CONTENT_TYPE,
                header::AUTHORIZATION,
                header::ACCEPT,
                header::ACCESS_CONTROL_ALLOW_HEADERS
            ])
            .max_age(3600); // Optional: Cache for one hour

        App::new()
            .wrap(cors) // Wrap the app with CORS middleware
            .wrap(AuthMiddleware {
                auth0_domain: "dev-jfmhfrg7tmi1fr64.us.auth0.com".to_string(),
                audience: "https://dev-jfmhfrg7tmi1fr64.us.auth0.com/api/v2/".to_string(),
                client: Arc::new(Client::new()),
            })
            .app_data(web::Data::new(db.clone()))
            .route("/api/test", web::get().to(test_route))
            .route("/api/users", web::post().to(create_user))
            .route("/api/users", web::get().to(get_users))
            .route("/api/users/{id}", web::get().to(get_user))
            .route("/api/users/{id}", web::put().to(update_user))
            .route("/api/users/{id}", web::delete().to(delete_user))
            .route("/api/deploy", web::post().to(handler::container::create_container))
            .route(
                "/api/deploy/{owner}",
                web::get().to(handler::container::get_deployed_containers),
            ).route("/api/build-deploy", web::post().to(handler::container::deploy_and_build))
            .route("/api/launch/", web::get().to(handler::container::launch_ttyd_in_browser))
            .route("/api/delete", web::delete().to(handler::container::delecte))
            .route("/api/host-project", web::post().to(handler::cloudflared::host_project))
            .route("/api/create_order", web::post().to(create_order))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
