use core::str;
use std::process::Command;
use std::time::Duration;
use regex::Regex;
use tokio::time;
use reqwest::Client;
use serde::Deserialize;
use actix_web::{web, App, HttpServer, HttpResponse};
use serde_json::json;

pub fn get_ip(container_name: String) -> String {
    let command = format!(
        "lxc exec {} -- ip -4 addr show eth0 | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){{3}}'",
        container_name
    );

    let output = Command::new("sh")
        .arg("-c")
        .arg(&command)
        .output()
        .expect("Failed to execute command");


    if output.status.success() {
        let ip_address = String::from_utf8_lossy(&output.stdout);
        ip_address.trim().to_string()
    } else {
        eprintln!("Command failed: {:?}", String::from_utf8_lossy(&output.stderr));
        String::new() 
    }
}



// pub async fn get_pub_url(db,private_ip: String , owner:String) -> String {
//    // let collection = get_container_collection(db);
  
// }

fn extract_public_url(input: &str) -> Option<String> {

    let re = Regex::new(r"https://.*\.trycloudflare\.com").unwrap();

   
    if let Some(caps) = re.captures(input) {
    
        return Some(caps[0].to_string());
    }
    None
}


#[derive(Deserialize)]
pub struct CreateOrderRequest {
    amount: u32, 
}

pub async fn create_order(req: web::Json<CreateOrderRequest>) -> HttpResponse {
    let client = Client::new();
    let razorpay_api_key = "rzp_test_prB6bb3aMwxOFB";
    let razorpay_api_secret = "sghXkPwcIu4umME81feqxMid";
    let order_url = "https://api.razorpay.com/v1/orders";

    let order_data = json!({
        "amount": req.amount,
        "currency": "INR",
        "receipt": "receipt#1",
    });

    let response = client
        .post(order_url)
        .basic_auth(razorpay_api_key, Some(razorpay_api_secret))
        .json(&order_data)
        .send()
        .await;

    match response {
        Ok(res) => {
            let order_json = res.json::<serde_json::Value>().await.unwrap();
            HttpResponse::Ok().json(order_json)
        }
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}