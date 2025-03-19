import { createClient } from "redis";

async function testRedis() {
  const redis = createClient({
    url: process.env.REDIS_URL,
  });

  redis.on("error", (err) => console.error("Redis Client Error", err));

  try {
    await redis.connect();
    console.log("Successfully connected to Redis");

    // Test set/get operations
    await redis.set("test-key", "Hello from MCP!");
    const value = await redis.get("test-key");
    console.log("Test value retrieved:", value);

    await redis.quit();
  } catch (error) {
    console.error("Error testing Redis:", error);
    process.exit(1);
  }
}

testRedis();
