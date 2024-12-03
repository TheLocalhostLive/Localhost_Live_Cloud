mod db;
mod migrations;
mod model;
use migrations::run_all;



#[actix_web::main]
async fn main() {
    let db = db::init_db().await;
    run_all(&db).await;
    println!("Migration successful!!!");
}
