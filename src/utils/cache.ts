/**
 * Cache utilities.
 */

// Database imports.
import { redis } from "@db/redis"

/**
 * Get a value from cache.
 */
async function get<T = Record<string, string>>(
  key: string,
): Promise<T | undefined> {
  const response = await redis.get(key)
  if (!response) return
  return JSON.parse(response)
}

/**
 * Set a value in cache.
 */
async function set(key: string, data: any, ttl = 300) {
  const value = JSON.stringify(data)
  await redis.set(key, value, "EX", ttl)
}

// Export cache object.
export const cache = { get, set }
