/**
 * Sync development database.
 *
 * Run after making changes to the schema.
 */

// External imports.
import "dotenv/config"

// Database imports.
import { BaseTable } from "@db/dynamodb"

// Utility imports.
import { logger } from "@utils/logger"

/**
 * Main runner function.
 */
async function run() {
  logger.info("Syncing...")
  await BaseTable.sync()
  logger.info("Done.")
}

// Run the application.
run().catch(logger.error)
