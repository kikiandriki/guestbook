/**
 * Comments routes.
 */

// System imports.
import { randomUUID } from "crypto"

// External imports.
import express, { Request } from "express"

// Database imports.
import { assert, object, size, string } from "superstruct"
import { BaseTable, DocumentDB } from "@db/dynamodb"
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"

// The router.
export const comments = express.Router({ mergeParams: true })

/**
 * List comments in a users guestbook.
 */
comments.get("/comments", async (req: Request<{ userId: string }>, res) => {
  // Parse data.
  const userId = req.params.userId
  // Get content from database.
  const response = await DocumentDB.send(
    new QueryCommand({
      TableName: BaseTable.options.TableName,
      IndexName: "CommentsIndex",
      ExpressionAttributeNames: {
        "#pk": "pk",
        "#sk": "commentsGSI",
        "#published": "published",
        "#authorId": "authorId",
        "#content": "content",
      },
      ExpressionAttributeValues: {
        ":pk": userId,
        ":sk": "comments|",
      },
      KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :sk)",
      ProjectionExpression: "#published, #authorId, #content",
      ScanIndexForward: false,
    }),
  )
  // Return a successful response.
  return res.status(200).send(response.Items || [])
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
  await DocumentDB.send(
    new PutCommand({
      TableName: BaseTable.options.TableName,
      Item: {
        pk: userId,
        sk: ["comments", commentId].join("|"),
        commentsGSI: ["comments", published, commentId].join("|"),
        content,
        published,
        commentId,
        userId,
        authorId,
      },
    }),
  )

  // Return a successful response.
  return res.status(204).send()
})
