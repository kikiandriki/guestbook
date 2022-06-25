/**
 * Main runner for development.
 */

// External imports.
import "dotenv/config"

// Application imports.
import { app } from "@app"

// Utility imports.
import { logger } from "@utils/logger"

/**
 * Main runner function.
 */
async function run() {
  // Do some pre-run async tasks.

  // Run the server.
  app.listen(3003)
}

// Run the application.
run().catch(logger.error)
