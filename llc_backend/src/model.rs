
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
    pub application_name : String,
    pub container_name : String,
    pub container_domain:String
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
pub struct HostProjectPost{
    pub owner:String,
    pub container_name :String,
    pub application_port : String
}
#[derive(Debug,Serialize,Deserialize)]
pub struct ContainerPost{
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id:Option<ObjectId>,
    pub owner:String,
    pub application_name : String,
    pub container_name : String,
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



