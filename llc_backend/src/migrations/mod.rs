pub mod add_status_and_remarks;
pub mod container_add_status_and_remarks;

use mongodb::{bson::doc, Database};
use std::future::Future;
use std::pin::Pin;

pub trait Migration {
    fn run(&self, db: &Database) -> Pin<Box<dyn Future<Output = ()> + Send>>;
}

impl<F> Migration for F
where
    F: Fn(&Database) -> Pin<Box<dyn Future<Output = ()> + Send>> + Send + Sync,
{
    fn run(&self, db: &Database) -> Pin<Box<dyn Future<Output = ()> + Send>> {
        (self)(db)
    }
}

pub async fn run_all(db: &Database) {
    let migrations: Vec<(&str, &dyn Migration)> = vec![
        ("add_status_and_remarks", &add_status_and_remarks::run),
        (
            "container_add_status_and_remarks",
            &container_add_status_and_remarks::run,
        ),
    ];
    let migrations_collection = db.collection::<mongodb::bson::Document>("migrations");
    
    for (name, migration) in migrations.iter() {
        // Check if migration has already been applied
        match migrations_collection.find_one(doc! { "name": name }).await {
            Ok(Some(_)) => {
                println!("Migration '{}' has already been applied. Skipping.", name);
                continue;
            }
            Ok(None) => {
                println!("Applying migration: {}", name);
            }
            Err(e) => {
                eprintln!("Error checking migration '{}': {}", name, e);
                continue;
            }
        }
        
        // Apply the migration
        migration.run(db).await;
        
        // Record the migration
        match migrations_collection.insert_one(doc! { "name": name }).await {
            Ok(result) => {
                println!("Migration '{}' completed and recorded.", name);
                dbg!(result);
            }
            Err(e) => {
                eprintln!("Error recording migration '{}': {}", name, e);
            }
        }
    }
}