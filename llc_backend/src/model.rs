
use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Container{
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id:Option<ObjectId>,
    pub owner:String,
    pub container_name : String,
    pub container_domain:String,
    pub password : String,
    pub status: Status,
    pub remarks: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub aud: String,
    pub exp: usize,
    // Add other fields as necessary
}
#[derive(Debug,Serialize,Deserialize)]
pub struct ContainerDeleteSchema{
    pub owner:String,
    pub container_name :String
}

#[derive(Debug,Serialize,Deserialize)]
pub enum Status {
    #[serde(rename = "PENDING")]
    Pending,
    #[serde(rename = "HEALTHY")]
    Healthy,
    #[serde(rename = "FAILED")]
    Failed,
    #[serde(rename = "TERMINATED")]
    Terminated,
}
impl ToString for Status {
    fn to_string(&self) -> String {
        match self {
            Status::Healthy => "HEALTHY".to_string(),
            Status::Failed => "FAILED".to_string(),
            Status::Pending => "PENDING".to_string(),
            Status::Terminated => "TERMINATED".to_string(),
        }
    }
}

#[derive(Debug,Serialize,Deserialize)]
pub struct Applications{
    pub owner:String,
    pub container_name :String,
    pub application_name:String,
    pub application_port : String,
    pub public_url: String,
    pub status: Status,
    pub remarks: String
}

#[derive(Debug,Serialize,Deserialize)]
pub struct ApplicationsReq{
    pub owner:String,
    pub container_name :String,
    pub application_name:String,
    pub application_port : String,
}

#[derive(Debug,Serialize,Deserialize)]
pub struct ContainerPost{
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id:Option<ObjectId>,
    pub owner:String,
    pub container_name : String,
    pub password:String
}


#[derive(Serialize, Deserialize, Debug)]
pub struct OriginRequest {}

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub ingress: Vec<Ingress>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ConfigRequest {
    pub config: Config,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DnsRecordRequest {
    #[serde(rename = "type")]
    pub(crate) record_type: String,
    pub proxied: bool,
    pub name: String,
    pub content: String,
    pub ttl: i32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Ingress {
    pub service: String,
    pub hostname: String,
    pub originRequest: OriginRequest,
    pub subdomain: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LaunchPayLoad {
    pub owner : String,
    pub container_name : String
}


#[derive(Debug, Deserialize, Clone)]
pub struct UserInfo {
    pub sub: String,
    pub nickname: String,
    pub name: String,
    pub picture: String,
    pub updated_at: String,
    pub email: String,
    pub email_verified: bool,
}


