use std::fmt::format;
use std::process::{self, Stdio};

use serde::Deserialize;
use serde_json::json;
use tokio::process::Command;
use actix_web::{web, HttpMessage, HttpRequest, HttpResponse, Responder};
use futures::TryStreamExt;
use mongodb::{bson::doc, Collection};
use crate::handler::utils::{get_ip, get_pub_url};
use crate:: model::{Claims, Container, ContainerDeleteSchema};

use tokio::time::sleep;
use std::fs::File;

use std::time::Duration;
use std::io::{ BufReader, Read};
use std::string::String;
fn get_container_collection(db: web::Data<mongodb::Database>) -> Collection<Container> {
    db.collection::<Container>("containers")
}

pub async fn deploy_and_create_container(db: web::Data<mongodb::Database>, container: web::Json<Container>) -> impl Responder {
    let collection = get_container_collection(db);

   
    let container_exist = collection.find_one(
        doc! { "owner": container.owner.clone(), "container_name": container.container_name.clone() }
    ).await;

    if let Ok(Some(_)) = container_exist {
      
        return HttpResponse::Conflict().json("Container exists with the same name. Try a different name.");
    } 

    let script_path = "scripts/ceate_lxc.sh";
    let process = Command::new("sh")
        .arg(script_path)
        .arg(&container.container_name) 
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Failed to execute script");

    let output = process.wait_with_output().await.expect("Failed to wait for process");

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return HttpResponse::InternalServerError().body(format!("Script failed: {}", stderr));
    }
    let script_path = "scripts/launch_ttyd.sh";
    let process = Command::new("sh")
        .arg(script_path)
        .arg(&container.container_name)
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
    };

   
    match collection.insert_one(new_container).await {
        Ok(inserted) => {
            if let Some(id) = inserted.inserted_id.as_object_id() {
             
                HttpResponse::Ok().json(id)
            } else {
              
                HttpResponse::InternalServerError().json("Failed to retrieve inserted ObjectId.")
            }
        },
        Err(err) => {

            eprintln!("Failed to insert new containerlication: {}", err);
            HttpResponse::InternalServerError().json("Error inserting new containerlication.")
        }
    }
}



pub async fn get_deployed_containers(db: web::Data<mongodb::Database>,req: HttpRequest ,owner: web::Path<String>) -> impl Responder {

    if let Some(claims) = req.extensions().get::<Claims>() {
        println!("Claims: {:?}", claims);
        return HttpResponse::Ok().json(claims);
    }

    HttpResponse::Unauthorized().finish();
   
    let collection = get_container_collection(db);

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

pub async fn get_console_by_process_name(process_name: web::Path<String>) -> impl Responder {

    let pname = process_name.into_inner();
    println!("Request received for process: {}", pname);
    let script_path = "scripts/pm2.sh"; 

    let mut process = Command::new("sh")
        .arg(script_path)
        .arg(&pname) 
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
                        HttpResponse::Ok().body(contents) 
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

#[derive(Deserialize)]
pub struct DeployRequest {
    container_name: String,
    application_name: String,
}

pub async fn deploy_and_build(
    json: web::Json<DeployRequest>,
) -> impl Responder {
    dbg!("Deploy Build route hit");
    let script_path = "scripts/build_redeploy.sh";


    let container_name_str = &json.container_name;
    let application_name_str = &json.application_name;
    dbg!("container Name: {}",container_name_str);
    dbg!("Application Name: {}",application_name_str);

    let  process = Command::new("sh")
        .arg(script_path)
        .arg(container_name_str) 
        .arg(application_name_str) 
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Failed to execute script");

    let output = process.wait_with_output().await.expect("Failed to wait for process");

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return HttpResponse::InternalServerError().body(format!("Script failed: {}", stderr));
    }

   
    let stdout = String::from_utf8_lossy(&output.stdout);
    HttpResponse::Ok().body(format!("Script succeeded: {}", stdout))
}



pub async fn launch_ttyd_in_browser(container_name: web::Path<String>) -> impl Responder {
    dbg!("launch_ttyd_in_browser");

    


    let machine_name = container_name.into_inner();
   


    let ip_addr = get_ip(machine_name.clone());
    dbg!(ip_addr.clone());

    println!("Request received for container: {}", machine_name.clone());

    let public_url = get_pub_url(ip_addr.clone()).await;
    HttpResponse::Ok().json(json!({
        "public_url": public_url
    }))
    
}



pub async fn delecte(db: web::Data<mongodb::Database>, container: web::Json<ContainerDeleteSchema>) -> impl Responder {
    let collection = get_container_collection(db);

   
    let container_exist = collection.find_one(
        doc! { "owner": container.owner.clone(), "container_name": container.container_name.clone() }
    ).await;

    if let Ok(None) = container_exist {
      
        return HttpResponse::Conflict().json("Either Container Does not exist or you are not Permitted to do this operation");
    }
    let command = format!("lxc delete {} --force", container.container_name.clone());
    let process = Command::new("sh")
        .arg("-c")
        .arg(&command)
        .output()
        .await;

    
        match process {
            Ok(output) if output.status.success() => {
                HttpResponse::Ok().json(serde_json::json!({"message": "Virtual Machine Terminated Successfully!"}))
            }
            Ok(output) => {
                HttpResponse::InternalServerError().json(serde_json::json!({
                    "message": "Failed to terminate Virtual Machine",
                    "error": String::from_utf8_lossy(&output.stderr)
                }))
            }
            Err(e) => {
                HttpResponse::InternalServerError().json(serde_json::json!({
                    "message": "Failed to execute command",
                    "error": e.to_string()
                }))
            }
        }
    
}

