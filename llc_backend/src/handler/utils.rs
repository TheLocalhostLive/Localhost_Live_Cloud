use core::str;
use std::process::Command;
use std::time::Duration;
use regex::Regex;
use tokio::time;
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