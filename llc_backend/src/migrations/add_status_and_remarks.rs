use crate::Applications;
use mongodb::{bson::doc, Database};



pub async fn run(db: &Database) {
    let apps_collection = db.collection::<Applications>("applications");
    let update_result = apps_collection
        .update_many(
            doc! {},
            doc! {  "$set": {
                "status": "HEALTHY",
                "remarks": "ALL STEPS SUCCESSFULLY EXECUTED"}
            },
        )
        .await
        .unwrap();

    println!(
        "Matched: {}, Modified: {}",
        update_result.matched_count, update_result.modified_count
    );
}
