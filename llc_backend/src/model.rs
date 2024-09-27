
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
pub struct Contrainer{
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id:Option<ObjectId>,
    pub owner:String,
    pub container_name : String
}