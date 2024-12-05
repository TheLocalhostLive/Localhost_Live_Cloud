use futures::StreamExt;
use lapin::{options::*, types::FieldTable, Connection, ConnectionProperties};
use tokio;
mod rabbitmq_conn;
use dotenv::dotenv;
use std::env;
mod db;
mod handler;
mod model;
use crate::handler::cloudflared::update_cloudflare_tunnel;
use crate::model::Ingress;
use mongodb::{
    bson::{doc, Bson},
    Database,
};

fn process_message(data: &[u8]) -> Result<Ingress, serde_json::Error> {
    let ingress: Ingress = serde_json::from_slice(data)?;
    Ok(ingress)
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
                    Ok(ingress) => {
                        //println!("Successfully parsed Ingress: {:?}", &ingress);
                        let status;
                        let remarks;

                        if let Err(e) = update_cloudflare_tunnel(&ingress).await {
                            status = model::Status::Failed;
                            remarks = "FAILED IN CF TUNNEL.";

                            dbg!(e);
                        } else {
                            status = model::Status::Healthy;
                            remarks = "ALL STEPS EXECUTED SUCCESSFULLY";
                        }

                        let result = db.collection::<mongodb::bson::Document>("containers")
                            .update_one(
                                doc! {"container_domain": ingress.hostname},
                                doc! { "$set": {
                                    "status": status.to_string(),
                                    "remarks": remarks
                                }},
                            ).await.expect("Update failed");;

                        println!("{}", result.matched_count);
                    }
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
