use futures::StreamExt;
use lapin::{options::*, types::FieldTable, Connection, ConnectionProperties};
use std::process::{ Output, Stdio};
use tokio;
use tokio::process::Command;
mod rabbitmq_conn;
use dotenv::dotenv;
use std::env;
mod db;
mod handler;
mod model;
use crate::handler::cloudflared::update_cloudflare_tunnel;
use crate::model::{Container, Ingress, OriginRequest, ContainerPost};
use mongodb::{
    bson::{doc, Bson},
    Database,
};
use crate::handler::utils::get_ip;

fn process_message(data: &[u8]) -> Result<Container, serde_json::Error> {
    let container: Container = serde_json::from_slice(data)?;
    Ok(container)
}

async fn create_incus_container(container: &Container) -> Output {
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

async fn queue_processor(db: &Database, container: &Container) {
    let output1 = create_incus_container(&container).await;


    if !output1.status.success() {
        let stderr = String::from_utf8_lossy(&output1.stderr);
        dbg!(stderr);
        db
        .collection::<mongodb::bson::Document>("containers")
        .update_one(
            doc! {"_id": container.id},
            doc! { "$set": {
                "status": "FAILED",
                "remarks": "FAILED WHILE CREATING INCUS CONTAINER"
            }},
        )
        .await
        .expect("Update failed");

        return;
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
    
    let status;
    let remarks;
    if let Err(e) = update_cloudflare_tunnel(&config).await {
        status = model::Status::Failed;
        remarks = "FAILED IN CF TUNNEL.";

        dbg!(e);
    } else {
        status = model::Status::Healthy;
        remarks = "ALL STEPS EXECUTED SUCCESSFULLY";
    }

    let result = db
        .collection::<mongodb::bson::Document>("containers")
        .update_one(
            doc! {"container_domain": config.hostname},
            doc! { "$set": {
                "status": status.to_string(),
                "remarks": remarks
            }},
        )
        .await
        .expect("Update failed");

    println!("{}", result.matched_count);
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    println!("Mongo URI: {}", mongo_uri);
    let db = db::init_db().await;

    let rabbitmq_uri = env::var("RABBITMQ_URI").expect("RABBITMQ_URI must be set!");
    // Initialize RabbitMQ connection
    let channel = rabbitmq_conn::init_mq_conn(&rabbitmq_uri).await;

    // Consume messages
    let mut consumer = channel
        .basic_consume(
            "container_req",
            "cloudflare_consumer",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await
        .expect("Failed to start consuming");

    println!("Waiting for messages...");

    while let Some(delivery) = consumer.next().await {
        match delivery {
            Ok(delivery) => {
                println!(
                    "Received message: {}",
                    String::from_utf8_lossy(&delivery.data)
                );

                match process_message(&delivery.data) {
                    Ok(container) => queue_processor(&db, &container).await,
                    Err(err) => {
                        eprintln!("Failed to parse Ingress: {:?}", err);
                    }
                };

                // Acknowledge the message
                delivery
                    .ack(BasicAckOptions::default())
                    .await
                    .expect("Failed to acknowledge message");
            }
            Err(err) => {
                eprintln!("Error receiving message: {:?}", err);
            }
        }
    }
}
