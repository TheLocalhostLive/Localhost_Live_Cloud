use std::process::Stdio;

use tokio::process::Command;
use actix_web::{web, HttpResponse, Responder};
use futures::TryStreamExt;
use mongodb::{bson::doc, Collection};
use crate:: model::Container;

use tokio::time::sleep;
use std::fs::File;

use std::time::Duration;
use std::io::{ BufReader, Read};

fn get_container_collection(db: web::Data<mongodb::Database>) -> Collection<Container> {
    db.collection::<Container>("containers")
}


pub async fn deploy(db: web::Data<mongodb::Database>, container: web::Json<Container>) -> impl Responder {
    let collection = get_container_collection(db);

    // Check if the containerlication container already exists
    let container_exist = collection.find_one(
        doc! { "owner": container.owner.clone(), "container_name": container.container_name.clone() }
    ).await;

    if let Ok(Some(_)) = container_exist {
        // Container with the same name exists, return conflict
        return HttpResponse::Conflict().json("Container exists with the same name. Try a different name.");
    } 

    let script_path = "scripts/ceate_lxc.sh";
    let mut process = Command::new("sh")
        .arg(script_path)
        .arg(&container.container_name) // Pass the unwrcontainered container_name
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Failed to execute script");

    let output = process.wait_with_output().await.expect("Failed to wait for process");

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return HttpResponse::InternalServerError().body(format!("Script failed: {}", stderr));
    }


    let new_container = Container {
        id: None,
        owner: container.owner.clone(),
        application_name: container.application_name.clone(),
        container_name: container.container_name.clone(),
        tech: container.tech.clone(),
    };

   
    match collection.insert_one(new_container).await {
        Ok(inserted) => {
            if let Some(id) = inserted.inserted_id.as_object_id() {
             
                HttpResponse::Ok().json(id)
            } else {
                // Inserted, but no valid ObjectId found
                HttpResponse::InternalServerError().json("Failed to retrieve inserted ObjectId.")
            }
        },
        Err(err) => {

            eprintln!("Failed to insert new containerlication: {}", err);
            HttpResponse::InternalServerError().json("Error inserting new containerlication.")
        }
    }
}


// Get all users
pub async fn get_deployed_containers(db: web::Data<mongodb::Database>) -> impl Responder {
    let collection = get_container_collection(db);
    let mut cursor = collection.find(doc! {}).await.unwrap();

    let mut container = vec![];

    while let Some(containerlication) = cursor.try_next().await.unwrap() {
        container.push(containerlication);
    }

    HttpResponse::Ok().json(container)
}
pub async fn get_console_by_process_name(process_name: web::Path<String>) -> impl Responder {
    let pname = process_name.into_inner();
    println!("Request received for process: {}", pname);
    let script_path = "scripts/pm2.sh"; // Adjust the path as necessary

    let mut process = Command::new("sh")
        .arg(script_path)
        .arg(&pname) // Pass the process name received in the request
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Failed to execute script");

    let wait_time = Duration::from_secs(3);
    sleep(wait_time).await;

    let exit_status = process.wait().await.expect("Failed to wait for process");

   
    let log_file_path = format!("pm2_logs_{}.txt", pname); 
    let file = File::open(&log_file_path);

    match file {
        Ok(file) => {
            let mut reader = BufReader::new(file);
            let mut contents = String::new();
            
           
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