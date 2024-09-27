use std::process::Stdio;

use actix_web::{web, HttpResponse, Responder};
use mongodb::bson::doc;
use tokio::process::Command;
use crate::{get_container_collection,  model::Contrainer};

pub async fn create_container(db: web::Data<mongodb::Database>, contrainer: web::Json<Contrainer>) -> impl Responder {
    let collection = get_container_collection(db);
    let new_container = Contrainer {
        id: None,
        owner: contrainer.owner.clone(),
        container_name: contrainer.container_name.clone(),
    };
    let contrainer_name:String = contrainer.container_name.clone();

    let container_exist = collection.find_one(doc! { "owner": contrainer.owner.clone() , "container_name":contrainer.container_name.clone()}).await.unwrap();

    if container_exist.is_some() {
        return HttpResponse::Conflict().json("Container exists with name same name try a different name");
    }


    let script_path = "scripts/ceate_lxc.sh";
    let mut process = Command::new("sh")
        .arg(script_path)
        .arg(&contrainer_name) // Pass the process name received in the request
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Failed to execute script");

    let output = process.wait_with_output().await.expect("Failed to wait for process");

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return HttpResponse::InternalServerError().body(format!("Script failed: {}", stderr));
    }

    let result = collection.insert_one(new_container).await;

    match result {
        Ok(inserted) => HttpResponse::Ok().json(inserted.inserted_id),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}
