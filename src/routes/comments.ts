/**
 * Comments routes.
 */

// System imports.
import { randomUUID } from "crypto"

// External imports.
import express, { Request } from "express"

// Database imports.
import { redis } from "@db/redis"
import { assert, object, size, string } from "superstruct"

// The router.
export const comments = express.Router({ mergeParams: true })

/**
 * List comments in a users guestbook.
 */
comments.get("/comments", async (req: Request<{ userId: string }>, res) => {
  // Parse data.
  const userId = req.params.userId
  // Get content from database.
  const response = (await redis.sort(
    `users:${userId}:comments`,
    "BY",
    `users:${userId}:comments:*->published`,
    "GET",
    `users:${userId}:comments:*->content`,
    "GET",
    `users:${userId}:comments:*->published`,
    "GET",
    `users:${userId}:comments:*->authorId`,
    "DESC",
  )) as string[]
  const results: {}[] = []
  const length = response.length
  for (let i = 2; i < length; i += 3) {
    results.push({
      content: response[i - 2],
      published: parseInt(response[i - 1]),
      authorId: response[i],
    })
  }
  // Return a successful response.
  return res.status(200).send(results)
})

/**
 * Post a comment in a users guestbook.
 */
comments.post("/comments", async (req: Request<{ userId: string }>, res) => {
  assert(req.body, object({ content: size(string(), 2, 1000) }))
  // Parse data.
  const authorId = req.actor.id
  const userId = req.params.userId
  const content = req.body.content
  const published = Date.now()
  const commentId = randomUUID()
  // Write data to database.
  await redis.hset(`users:${userId}:comments:${commentId}`, {
    authorId,
    published,
    content,
    commentId,
    userId,
  })
  await redis.sadd(`users:${userId}:comments`, commentId)
  // Return a successful response.
  return res.status(204).send()
})
