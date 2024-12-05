use std::clone;
use std::fmt::format;
use std::process::{self, Output, Stdio};

use crate::handler::container;
use crate::handler::utils::get_ip;
use crate::model::{
    UserInfo, Applications, Claims, Container, ContainerDeleteSchema, ContainerPost, Ingress, LaunchPayLoad, OriginRequest
};
use actix_web::{web, HttpMessage, HttpRequest, HttpResponse, Responder};
use futures::TryStreamExt;
use mongodb::{bson::doc, Collection};
use serde::Deserialize;
use serde_json::json;
use tokio::process::Command;

use std::fs::File;
use tokio::time::sleep;

use std::io::{BufReader, Read};
use std::string::String;
use std::time::Duration;
use crate::model::Status;

use super::cloudflared::update_cloudflare_tunnel;
use lapin::{options::*, types::FieldTable, BasicProperties, Connection, ConnectionProperties};
use tokio;

pub fn get_container_collection(db: &web::Data<mongodb::Database>) -> Collection<Container> {
    db.collection::<Container>("containers")
}
async fn create_incus_container(container: &web::Json<ContainerPost>) -> Output{
    let script_path1 = "scripts/ceate_lxc.sh";
    let output1 = Command::new("sh")
        .arg(script_path1)
        .arg(&container.container_name)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output() // This runs the command and waits for it to finish
        .await // Await the result of the command
        .expect("Failed to start process");

        return output1;

}
pub async fn create_container(
    req: HttpRequest,
    db: web::Data<mongodb::Database>,
    mq_channel: web::Data<lapin::Channel>,
    container: web::Json<ContainerPost>,
) -> impl Responder {
    dbg!("Create Contaienr");
    let collection = get_container_collection(&db);

    let container_exist = collection.find_one(
        doc! { "owner": container.owner.clone(), "container_name": container.container_name.clone() }
    ).await;

    if let Ok(Some(_)) = container_exist {
        return HttpResponse::Conflict()
            .json("Container exists with the same name. Try a different name.");
    }

    let output1 = create_incus_container(&container).await;

    if !output1.status.success() {
        let stderr = String::from_utf8_lossy(&output1.stderr);
        return HttpResponse::InternalServerError().body(format!("Script failed: {}", stderr));
    }
    let container_ip = get_ip(container.container_name.clone());
    let service = format!("http://{}:7681", container_ip,);
    let hostname = format!("{}.thelocalhost.live", container.container_name.clone());
    let subdomain = container.container_name.clone();

    let config = Ingress {
        service,
        hostname: hostname.clone(),
        originRequest: OriginRequest {},
        subdomain,
    };
    let config_json = serde_json::to_string(&config).expect("Failed to serialize Ingress object");
    mq_channel.basic_publish(
        "",
        "container_req",
        BasicPublishOptions::default(),
        config_json.as_bytes(),
        BasicProperties::default(),
    )
    .await
    .expect("Failed to publish message");    


    let new_container = Container {
        id: None,
        owner: container.owner.clone(),
        container_name: container.container_name.clone(),
        container_domain: hostname.clone(),
        password: container.password.clone(),
        status: Status::Pending,
        remarks: String::from("Processing the request")
    };

    match collection.insert_one(&new_container).await {
        Ok(inserted) => {
            if let Some(_id) = inserted.inserted_id.as_object_id() {
                HttpResponse::Ok().json(new_container)
            } else {
                HttpResponse::InternalServerError().json("Failed to retrieve inserted ObjectId.")
            }
        }
        Err(err) => {
            eprintln!("Failed to insert new containerlication: {}", err);
            HttpResponse::InternalServerError().json("Error inserting new containerlication.")
        }
    }
}

pub async fn get_deployed_containers(
    db: web::Data<mongodb::Database>,
    req: HttpRequest,
    owner: web::Path<String>,
) -> impl Responder {
    if let Some(claims) = req.extensions().get::<Claims>() {
        println!("Claims: {:?}", claims);
        return HttpResponse::Ok().json(claims);
    }

    HttpResponse::Unauthorized().finish();

    let collection = get_container_collection(&db);

    let mut cursor = match collection.find(doc! {"owner": owner.into_inner()}).await {
        Ok(cursor) => cursor,
        Err(err) => {
            eprintln!("Failed to fetch containers: {}", err);
            return HttpResponse::InternalServerError().json("Failed to fetch containers.");
        }
    };

    let mut containers = vec![];

    while let Some(container) = match cursor.try_next().await {
        Ok(Some(container)) => Some(container),
        Ok(None) => None,
        Err(err) => {
            eprintln!("Error while retrieving containers: {}", err);
            return HttpResponse::InternalServerError().json("Error retrieving containers.");
        }
    } {
        containers.push(container);
    }

    HttpResponse::Ok().json(containers)
}

#[derive(Deserialize)]
pub struct PasswordChangeRequest {
    container_name: String,
    new_password: String,
}

pub async fn change_container_password(
    path: web::Path<(String)>, // Path containing (user_id, container_name)
    payload: web::Json<PasswordChangeRequest>,
    db: web::Data<mongodb::Database>,
) -> impl Responder {
    let (owner) = path.into_inner();
    let container_name = &payload.container_name;

    // Define filter based on user_id and container_name
    let filter = doc! { "container_name": &container_name, "owner": &owner };
    let update = doc! { "$set": { "password": &payload.new_password } };
    let collection = get_container_collection(&db);
    // Attempt to update the password field
    match collection.update_one(filter, update).await {
        Ok(update_result) => {
            if update_result.matched_count == 1 {
                HttpResponse::Ok().json("Password updated successfully")
            } else {
                HttpResponse::NotFound().json("Container not found or user not authorized")
            }
        }
        Err(e) => {
            eprintln!("Failed to update password: {:?}", e);
            HttpResponse::InternalServerError().json("Error updating password")
        }
    }
}

#[derive(Deserialize)]
pub struct DeployRequest {
    container_name: String,
    application_name: String,
}

pub async fn deploy_and_build(req: HttpRequest, json: web::Json<DeployRequest>) -> impl Responder {
    dbg!("Deploy Build route hit");
    let script_path = "scripts/build_redeploy.sh";

    let container_name_str = &json.container_name;
    let application_name_str = &json.application_name;
    dbg!("container Name: {}", container_name_str);
    dbg!("Application Name: {}", application_name_str);

    let process = Command::new("sh")
        .arg(script_path)
        .arg(container_name_str)
        .arg(application_name_str)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Failed to execute script");

    let output = process
        .wait_with_output()
        .await
        .expect("Failed to wait for process");

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return HttpResponse::InternalServerError().body(format!("Script failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    HttpResponse::Ok().body(format!("Script succeeded: {}", stdout))
}

pub async fn launch_ttyd_in_browser(
    req: HttpRequest,
    db: web::Data<mongodb::Database>,
    launch_payload: web::Query<LaunchPayLoad>,
) -> impl Responder {
    let collection = get_container_collection(&db);
    let machine_name = launch_payload.container_name.clone();
    let owner = launch_payload.owner.clone();
    dbg!(machine_name.clone());
    dbg!(owner.clone());

    println!("Request received for container: {}", machine_name.clone());

    match collection
        .find_one(doc! { "owner": owner, "container_name": machine_name.clone() })
        .await
    {
        Ok(Some(container)) => {
            let username = container.owner;
            let password = container.password;
            let script_path2 = "scripts/launch_ttyd.sh";
            let _ = Command::new("sh")
                .arg(script_path2)
                .arg(machine_name.clone())
                .arg(username)
                .arg(password)
                .spawn()
                .expect("Failed to execute script");
            let public_url = container.container_domain;
            HttpResponse::Ok().json(json!({
                "public_url": public_url
            }))
        }
        Ok(None) => HttpResponse::NotFound().json(json!({
            "status": "error",
            "message": "Container not found"
        })),
        Err(e) => {
            eprintln!("Error querying database: {:?}", e);
            HttpResponse::InternalServerError().json(json!({
                "status": "error",
                "message": "Internal Server Error"
            }))
        }
    }
}

pub async fn delecte(
    req: HttpRequest,
    db: web::Data<mongodb::Database>,
    container: web::Json<ContainerDeleteSchema>,
) -> impl Responder {
    let collection = get_container_collection(&db);

    let container_exist = collection.find_one(
        doc! { "owner": container.owner.clone(), "container_name": container.container_name.clone() }
    ).await;

    if let Ok(None) = container_exist {
        return HttpResponse::Conflict()
            .json("Either Container Does not exist or you are not Permitted to do this operation");
    }
    let delete_result = collection
        .delete_one(doc! {
            "owner": &container.owner,
            "container_name": &container.container_name
        })
        .await;

    // Handle the potential error in deletion
    if let Err(err) = delete_result {
        return HttpResponse::InternalServerError()
            .json(format!("Error deleting container: {}", err));
    }
    let command = format!("sudo incus delete {} --force", container.container_name.clone());
    let process = Command::new("sh").arg("-c").arg(&command).output().await;

    match process {
        Ok(output) if output.status.success() => HttpResponse::Ok()
            .json(serde_json::json!({"message": "Virtual Machine Terminated Successfully!"})),
        Ok(output) => HttpResponse::InternalServerError().json(serde_json::json!({
            "message": "Failed to terminate Virtual Machine",
            "error": String::from_utf8_lossy(&output.stderr)
        })),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "message": "Failed to execute command",
            "error": e.to_string()
        })),
    }
}
pub async fn get_applications(
    db: web::Data<mongodb::Database>,
    req: HttpRequest,
    path: web::Path<String>, // container_id from the URL path
) -> impl Responder {
    // Extract container_id from the path
    let container_id = path.into_inner();

    // Store the extensions in a variable
    let extensions = req.extensions();

    // Extract user_info from request extensions
    let user_info = match extensions.get::<UserInfo>() {
        Some(info) => info,
        None => return HttpResponse::Unauthorized().json("Unauthorized: missing user info"),
    };

    let owner = &user_info.nickname;

    // Filter to match both container_id and owner
    let filter = doc! { "container_name": &container_id, "owner": owner };
    let collection = db.collection::<Applications>("applications");

    // Execute query
    let mut cursor = match collection.find(filter).await {
        Ok(cursor) => cursor,
        Err(err) => {
            eprintln!("Failed to fetch applications: {:?}", err);
            return HttpResponse::InternalServerError().json("Failed to fetch applications.");
        }
    };

    // Collect applications
    let mut applications = Vec::new();
    while let Some(app) = cursor.try_next().await.unwrap_or(None) {
        applications.push(app);
    }

    HttpResponse::Ok().json(applications)
}
