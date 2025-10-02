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
// src/databases/redis.js
const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASS || undefined,
  lazyConnect: false
});

// subscriber separado para Pub/Sub
const subscriber = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASS || undefined
});

redis.on('connect', () => console.log('✅ Redis conectado'));
redis.on('error', (e) => console.error('❌ Redis error', e));
subscriber.on('error', (e) => console.error('❌ Redis sub error', e));

module.exports = { redis, subscriber };
