use crate::model::User;
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use dotenv::dotenv;
use futures::stream::TryStreamExt;
use mongodb::bson::oid::ObjectId;
use mongodb::{bson::doc, Collection};
use tokio::time::sleep;
use std::env;
use std::fs::File;
use std::io::{ BufReader, Read};
use std::process::Stdio;

use std::time::Duration;
use tokio::process::Command;
mod db;
mod model;

mod handler;

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

 // Import AsyncReadExt for reading process output

 
 async fn get_console_by_process_name(process_name: web::Path<String>) -> impl Responder {
    let pname = process_name.into_inner();
    println!("Request received for process: {}", pname);
    let script_path = "scripts/pm2.sh"; // Adjust the path as necessary

    // Spawn the process to execute the script
    let mut process = Command::new("sh")
        .arg(script_path)
        .arg(&pname) // Pass the process name received in the request
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Failed to execute script");

    // Wait for a specified time (e.g., 3 seconds) to allow the script to capture logs
    let wait_time = Duration::from_secs(3);
    sleep(wait_time).await;

    // Wait for the process to finish
    let exit_status = process.wait().await.expect("Failed to wait for process");

    // Prepare to read the log file
    let log_file_path = format!("pm2_logs_{}.txt", pname); // Path to your log file
    let file = File::open(&log_file_path);

    match file {
        Ok(file) => {
            let mut reader = BufReader::new(file);
            let mut contents = String::new();
            
            // Read the file contents
            match reader.read_to_string(&mut contents) {
                Ok(_) => {
                    if exit_status.success() {
                        HttpResponse::Ok().body(contents) // Return the logs if the process was successful
                    } else {
                        HttpResponse::InternalServerError().body(format!("Script failed. Logs:\n{}", contents))
                    }
                },
                Err(_) => HttpResponse::InternalServerError().body("Failed to read log file."),
            }
        },
        Err(_) => HttpResponse::NotFound().body("Log file not found."),
    }
}
 


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    println!("Mongo URI: {}", mongo_uri);
    let db = db::init_db().await;

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(db.clone()))
            .route("/users", web::post().to(create_user))
            .route("/users", web::get().to(get_users))
            .route("/users/{id}", web::get().to(get_user))
            .route("/users/{id}", web::put().to(update_user))
            .route("/users/{id}", web::delete().to(delete_user))
            .route(
                "/process/{process_name}",
                web::get().to(get_console_by_process_name),
            )
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
