/**
 * Express application.
 */

// External imports.
import express from "express"
import cors from "cors"

// Middleware imports.
import { auth } from "@middlewares/auth"
import { error } from "@middlewares/error"
import { member } from "@middlewares/member"

// Route imports.
import { comments } from "@routes/comments"

// Initialize the app.
export const app = express()

// Use the JSON middleware.
app.use(express.json())

// Use the CORS middleware.
app.use(cors())
app.options("*", (_req, res) => res.status(204).send())

// Use the auth middleware.
app.use(auth)

// Use the membership middleware.
app.use(member)

// Use routes.
app.use("/:userId", comments)

// Use the error middleware.
app.use(error)
