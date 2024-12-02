pub mod add_status_and_remarks;

use mongodb::{bson::doc, Database};

pub async fn run_all(db: &Database) {
    // A list of all migration functions
    let migrations = [("add_status_and_remarks", add_status_and_remarks::run)];

    let migrations_collection = db.collection::<mongodb::bson::Document>("migrations");

    for (name, migration) in migrations.iter() {
        // Check if migration has already been applied
        let already_applied = migrations_collection.find_one(doc! { "name": name }).await;

        match already_applied {
            Ok(_) => print!("{} Migration successfully applied.", name),
            Err(_) => print!("{} Migration Failed.", name),
        };

        // Apply the migration
        println!("Applying migration: {}", name);
        migration(db).await;

        // Record the migration
        let result = migrations_collection
            .insert_one(doc! { "name": name })
            .await
            .unwrap();

        dbg!(result);
    }
}
