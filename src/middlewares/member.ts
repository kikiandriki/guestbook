/**
 * Member of server middleware.
 */

// External imports.
import { NextFunction, Request, Response } from "express"

// Utility imports.
import { cache } from "@utils/cache"
import { discord } from "@utils/http"
import { ServerError, ForbiddenError } from "@utils/exceptions"

async function checkMember(id: string): Promise<boolean> {
  const cached = await cache.get<{ member: boolean }>(`membership:${id}`)
  if (!cached?.member) {
    const response = await discord.get(`/members/${id}`)
    if (response.status === 404) {
      await cache.set(`membership:${id}`, { member: false })
      return false
    } else if (response.status !== 200) {
      console.log(response)
      throw new ServerError("Failed to fetch user from Discord.")
    }
    await cache.set(`membership:${id}`, { member: true })
    return true
  }
  return cached.member
}

/**
 * Express member handler.
 */
export const member = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Skip if the user is a system user.
  const system = req.actor.system
  if (system) return next()
  // Check if the user is a member of the server.
  const userId = req.actor.id
  const user = await checkMember(userId)
  if (!user) {
    throw new ForbiddenError("You are not a member of the server.")
  }
  return next()
}
