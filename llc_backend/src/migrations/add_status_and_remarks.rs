use mongodb::{bson::doc, Database};
use std::future::Future;
use std::pin::Pin;




pub fn run(db: &Database) -> Pin<Box<dyn Future<Output = ()> + Send>> {
    let db = db.clone(); // Clone the database handle
    Box::pin(async move {
        let apps_collection = db.collection::<mongodb::bson::Document>("applications");
        let update_result = apps_collection
            .update_many(
                doc! {},
                doc! { "$set": {
                    "status": "HEALTHY",
                    "remarks": "ALL STEPS SUCCESSFULLY EXECUTED"
                }},
            )
            .await
            .expect("Update failed");

        println!(
            "Migration 'add_status_and_remarks' applied successfully. \
             Matched: {}, Modified: {}",
            update_result.matched_count, update_result.modified_count
        );
    })
}