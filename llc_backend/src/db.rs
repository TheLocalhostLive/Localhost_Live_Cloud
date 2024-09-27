use mongodb::{Client, Database};
use dotenv::dotenv;
use std::env;

pub async fn init_db() -> Database {
    dotenv().ok();
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    let client = Client::with_uri_str(&mongo_uri)
        .await
        .expect("Failed to connect to MongoDB");
    client.database("myapp")
}
