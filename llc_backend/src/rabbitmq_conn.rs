use lapin::{options::*, types::FieldTable, Connection, ConnectionProperties};

pub async fn init_mq_conn(url: &String) -> lapin::Channel {
    let addr = &url;
    let connection = Connection::connect(addr, ConnectionProperties::default())
        .await
        .expect("Failed to connect to RabbitMQ");

    let channel = connection
        .create_channel()
        .await
        .expect("Failed to create channel");

    // Declare a queue
    channel
        .queue_declare(
            "container_req",
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await
        .expect("Failed to declare queue");

    return channel;
}
