use actix_web::{web::{self, put}, HttpResponse, Responder};
use mongodb::bson::doc;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use dotenv::dotenv;
use std::{env, f32::consts::E};


use crate::model::{Applications, ApplicationsReq, DnsRecordRequest, Ingress, OriginRequest};

use super::{container::get_container_collection, utils::get_ip};

pub async fn update_cloudflare_tunnel(config: Ingress) -> Result<(String), Box<dyn std::error::Error>> {

    dotenv().ok();
    
    let account_id = env::var("account_id").expect("account_id must be set");
    let tunnel_id = env::var("tunnel_id").expect("tunned_id must be set");
    let api_token = env::var("api_token").expect("api_token must be set");
    let zone_id = env::var("zone_id").expect("zone_id must be set");
    //let dns_api_token = env::var("dns_api_token").expect("dns_api_token must be set");
    dbg!(account_id.clone());
    dbg!(api_token.clone());
    dbg!(api_token.clone());
    dbg!(zone_id.clone());
    dbg!(config.hostname.clone());
    dbg!(config.service.clone());
    dbg!(config.subdomain.clone());

    let base_url = format!(
        "https://api.cloudflare.com/client/v4/accounts/{}/cfd_tunnel/{}",
        account_id.clone(), tunnel_id.clone()
    );

    let client = Client::new();

    let get_response = client
        .get(format!("{}/configurations", base_url.clone()))
        .header("Authorization", api_token.clone())
        .send()
        .await?;

    let mut get_response_json: serde_json::Value = get_response.json().await?;
    dbg!(get_response_json.clone());

    let ingress_config = get_response_json["result"]["config"]["ingress"]
        .as_array_mut()
        .unwrap();

    dbg!(ingress_config.clone());

    let http_status_404 = ingress_config
        .iter()
        .position(|entry| entry["service"] == "http_status:404")
        .map(|pos| ingress_config.remove(pos)); 


    ingress_config.push(serde_json::json!({
        "service": config.service,
        "hostname": config.hostname,
        "originRequest": config.originRequest
    }));

    if let Some(status_entry) = http_status_404 {
        ingress_config.push(status_entry);
    }

  
    let put_body = json!({
        "config": {
            "ingress": ingress_config
        }
    });
    println!("{}", json!(put_body.clone()));
    let put_response = client
        .put(format!("{}/configurations", base_url.clone()))
        .header("Authorization", api_token.clone())
        .json(&put_body)
        .send()
        .await?;
   // dbg!()

    if !put_response.status().is_success() {
        println!("Failed to update tunnel configuration.");
        return Err(Box::from("Failed to create DNS record"))
    }

    let dns_record = DnsRecordRequest {
        record_type: "CNAME".to_string(),
        proxied: true,
        name: config.subdomain.clone(),
        content: format!("{}.cfargotunnel.com", tunnel_id.clone()),
        ttl: 3600
    };
    
    println!("{}", json!(dns_record));


    
    let dns_response = client
        .post(format!(
            "https://api.cloudflare.com/client/v4/zones/{}/dns_records",
            zone_id
        ))
        .header("Authorization", api_token)
        .json(&dns_record)
        .send()
        .await?;

    println!("{:#?}", dns_response);
    if dns_response.status().is_success() {
        println!("DNS record created successfully.");
        return Ok((config.subdomain.clone()));
    } else {
        println!("Failed to create DNS record.");
    }

    return Err(Box::from("Failed to create DNS record"))

    
}




pub async fn host_project(db: web::Data<mongodb::Database>,hosting_details: web::Json<ApplicationsReq>) -> impl Responder {

    dbg!("Host Project");
    let collection = get_container_collection(&db);
    let container_exist = collection.find_one(
        doc! { "owner": hosting_details.owner.clone(), "container_name": hosting_details.container_name.clone() }
    ).await;

    if let Ok(None) = container_exist {
        return HttpResponse::Conflict()
            .json("Either Container Does not exist or you are not Permitted to do this operation");
    }

    let sdomain = format!("{}-{}",hosting_details.owner.clone(),hosting_details.application_name.clone());
    let container_ip = get_ip(hosting_details.container_name.clone());
    let service = format!("http://{}:{}", container_ip, hosting_details.application_port.clone());
    let hostname = format!("{}.thelocalhost.live", sdomain.clone());
   
    dbg!(sdomain.clone());
    dbg!(hosting_details.application_name.clone());
    dbg!(hosting_details.container_name.clone());
    dbg!(hosting_details.owner.clone());
    dbg!(hosting_details.application_port.clone());


    let config = Ingress {
        service,
        hostname:hostname.clone(),
        originRequest: OriginRequest {},
        subdomain:sdomain,
    };
    

    match update_cloudflare_tunnel(config).await {
        Ok(name) => {
            let new_app = Applications{
                owner: hosting_details.owner.clone(),
                application_port: hosting_details.application_port.clone(),
                application_name: hosting_details.application_name.clone(),
                container_name: hosting_details.container_name.clone(),
                public_url: hostname.clone(),
            };
            let app_collections = db.collection::<Applications>("applications");
    
            // Return the response from this match block
            match app_collections.insert_one(new_app).await {
                Ok(_) => {
                    return HttpResponse::Ok().json(json!({
                        "status": "success",
                        "message": hostname.to_string()
                    }))
                }
                Err(err) => {
                    eprintln!("Failed to insert application: {:?}", err);
                    return HttpResponse::InternalServerError().json(json!({
                        "status": "error",
                        "message": "Failed to insert application."
                    }))
                }
            }
        }
        Err(e) => {
            eprintln!("Error: {}", e);
            // Return the error response directly
            return HttpResponse::InternalServerError().json(json!({
                "status": "error",
                "message": format!("Failed to host project: {}", e)
            }))
        }
    }
}


// #[tokio::main]
// async fn main() {
//     let config = Ingress {
//         service: "http://localhost:5005".to_string(),
//         hostname: "joydeep.thelocalhost.live".to_string(),
//         originRequest: OriginRequest {},
//         subdomain: "joydeep".to_string()
//     };

//     if let Err(e) = update_cloudflare_tunnel(config).await {
//         eprintln!("Error: {}", e);
//     }
// }