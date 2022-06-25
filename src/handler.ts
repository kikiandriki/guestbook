/**
 * AWS Lambda handler for the application.
 */

// External imports.
import { Handler, APIGatewayEvent } from "aws-lambda"
import serverless from "serverless-http"

// Application imports.
import { app } from "@app"

const appHandler = serverless(app)

/**
 * The AWS Lambda handler.
 */
export const handler: Handler<APIGatewayEvent> = async (event, context) => {
  // Return the result of the handler.
  return await appHandler(event, context)
}
