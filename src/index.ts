import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js"
import { connectRabbitMQ } from "./config/rabbitmq.js";
dotenv.config()
const app = express()
const port = process.env.PORT

connectDB()
connectRabbitMQ()

app.use("api/v1", userRoutes)

export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redisClient.connect().then(() => console.log("connected to redis")).catch((err) => console.log(err))


app.listen(port, () => {
    console.log(`server is listening on port ${port}`)
})