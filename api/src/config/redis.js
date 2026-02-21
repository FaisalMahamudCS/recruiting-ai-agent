const IORedis = require("ioredis");

let redisClient = null;
let redisReady = false;

function getRedisClient() {
  return redisClient;
}

function isRedisReady() {
  return redisReady;
}

function initRedis() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  redisClient = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy(times) {
      return Math.min(times * 200, 5000);
    }
  });

  redisClient.on("ready", () => {
    redisReady = true;
    console.log("[redis] connected");
  });

  redisClient.on("error", (error) => {
    redisReady = false;
    console.error("[redis] error:", error.message);
  });

  redisClient.on("end", () => {
    redisReady = false;
    console.warn("[redis] connection closed");
  });

  return redisClient;
}

async function redisGet(key) {
  try {
    if (!redisClient || !redisReady) return null;
    return await redisClient.get(key);
  } catch (error) {
    console.error(`[redis] GET failed for key=${key}:`, error.message);
    return null;
  }
}

async function redisSet(key, value, ttlSeconds) {
  try {
    if (!redisClient || !redisReady) return false;
    if (typeof ttlSeconds === "number") {
      await redisClient.set(key, value, "EX", ttlSeconds);
    } else {
      await redisClient.set(key, value);
    }
    return true;
  } catch (error) {
    console.error(`[redis] SET failed for key=${key}:`, error.message);
    return false;
  }
}

async function redisDel(key) {
  try {
    if (!redisClient || !redisReady) return false;
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error(`[redis] DEL failed for key=${key}:`, error.message);
    return false;
  }
}

function createBullConnection() {
  if (process.env.REDIS_URL) {
    return { url: process.env.REDIS_URL };
  }
  return { host: "127.0.0.1", port: 6379 };
}

module.exports = {
  initRedis,
  getRedisClient,
  isRedisReady,
  redisGet,
  redisSet,
  redisDel,
  createBullConnection
};
