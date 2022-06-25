/**
 * Redis database client.
 */

// External imports.
import Redis from "ioredis"

// The Redis client.
export const redis = new Redis(process.env.REDIS_URL || "redis://localhost", {
  keyPrefix: "guestbook:",
})
