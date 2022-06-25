/**
 * HTTP utilities.
 */

// External imports.
import axiosBase from "axios"

// Server ID constant.
const SERVER_ID = process.env.SERVER_ID || "558027628502712330"

// Axios base object.
export const discord = axiosBase.create({
  baseURL: `https://discord.com/api/guilds/${SERVER_ID}`,
  headers: {
    Authorization: `Bot ${process.env.BOT_TOKEN}`,
    "Content-Type": "application/json",
  },
  validateStatus: null,
})
