import dotenv from "dotenv";
dotenv.config();
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URI
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("ready", () => {
  console.log("✅ Redis is ready to use");
});
await redisClient.connect();

export default redisClient;