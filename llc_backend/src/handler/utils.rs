use core::str;
use std::process::Command;
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

use std::time::Duration;
use regex::Regex;
use tokio::time;

pub async fn get_pub_url(private_ip: String) -> String {
   
    let command = format!(
        "nohup cloudflared tunnel --url http://{}:7681 &",
        private_ip
    );

   
    let _ = Command::new("sh")
    .arg("-c")
    .arg(&command)
    .spawn()
    .expect("Failed to start cloudflared tunnel");

    time::sleep(Duration::from_secs(10)).await;

    let command2 = "cat nohup.out";

    let output = Command::new("sh")
        .arg("-c")
        .arg(command2)
        .output()
        .expect("Failed to execute command2");

        let output_str = str::from_utf8(&output.stdout)
        .unwrap_or_else(|_| "Failed to read output");

    if output_str.is_empty() {
        eprintln!("The output from nohup.out is empty. Please check if the tunnel started correctly.");
    } else {
        eprintln!("Output from nohup.out:\n{}", output_str);
    }

    let public_url = extract_public_url(output_str);

    public_url.unwrap_or_else(|| "No public URL found.".to_string())
}

fn extract_public_url(input: &str) -> Option<String> {

    let re = Regex::new(r"https://.*\.trycloudflare\.com").unwrap();

   
    if let Some(caps) = re.captures(input) {
    
        return Some(caps[0].to_string());
    }
    None
}