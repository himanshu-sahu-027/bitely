import Redis from "ioredis";
import { config } from "./env.js";

let hasLoggedRedisError = false;

const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: null,
});

redis.on("connect", () => {
  hasLoggedRedisError = false;
  console.log("Redis connected");
});

redis.on("error", (error) => {
  if (hasLoggedRedisError) return;
  hasLoggedRedisError = true;
  console.error(
    `Redis unavailable at ${config.REDIS_HOST}:${config.REDIS_PORT} - ${error.message}`
  );
});

export const ensureRedis = async () => {
  if (redis.status === "ready" || redis.status === "connect") {
    return redis;
  }

  try {
    await redis.connect();
    return redis;
  } catch (error) {
    throw new Error("Redis is not available. OTP service is temporarily unavailable.");
  }
};

export default redis;
