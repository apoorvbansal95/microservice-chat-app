import ampq from "amqplib"

let channel: ampq.Channel

export const connectRabbitMQ = async () => {
    try {
        const connection = await ampq.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_host,
            port: 5672,
            username: process.env.Rabbitmq_username,
            password: process.env.Rabbitmq_password
        })
        channel = await connection.createChannel()
        console.log("rabbitmq connected")
    }
    catch (err) {
        console.log(err)
    }
}

export const publishToQueue = async (queueName: string, message: any) => {
    if (!channel) {
        console.log("RabbitMq channel not initialised")
        return
    }
    await channel.assertQueue(queueName, { durable: true })
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true
    })

}