/**
 * DynamoDB client.
 */

// External imports.
import {
  CreateTableCommand,
  CreateTableCommandInput,
  DeleteTableCommand,
  DynamoDBClient,
  DynamoDBClientConfig,
  ListTablesCommand,
  UpdateTableCommand,
} from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

// Store DynamoDB configuration.
const config: DynamoDBClientConfig = {
  region: process.env.DDB_REGION || "us-east-1",
}

// If working locally, setup config to connect to local DynamoDB instance.
if (process.env.NODE_ENV !== "production") {
  config.region = "localhost"
  config.credentials = {
    accessKeyId: "test",
    secretAccessKey: "test",
  }
  config.endpoint = process.env.DDB_ENDPOINT || "http://localhost:8000"
}

// Export DynamoDB client.
export const DynamoDB = new DynamoDBClient(config)

// Export DynamoDB document client.
export const DocumentDB = DynamoDBDocumentClient.from(DynamoDB, {
  marshallOptions: { removeUndefinedValues: true },
})

/**
 * Pagination key type.
 */
export type PaginationKey = {
  [key: string]: any
}

/**
 * DynamoDB Table options interface.
 */
interface TableOptions extends CreateTableCommandInput {
  TableName: string
}

/**
 * Abstract DynamoDB Table definition class.
 */
abstract class Table {
  // Table creation options.
  abstract options: TableOptions

  /**
   * Check whether or not the table exists.
   */
  private async check(): Promise<boolean> {
    const name = this.options.TableName
    const result = await DynamoDB.send(new ListTablesCommand({}))
    const tables = result.TableNames || []
    if (tables.includes(name)) {
      return true
    }
    return false
  }

  /**
   * Sync DynamoDB Table options in development.
   */
  async sync() {
    // Exit if in production.
    // Never sync in production.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Unsafe sync in production.")
    }
    // Check if the DynamoDB Table exists.
    const exists = await this.check()
    if (exists) {
      // If the DynamoDB Table exists, update it.
      await DynamoDB.send(new UpdateTableCommand(this.options))
    } else {
      // If the DynamoDB Table doesn't exist, create it.
      await DynamoDB.send(new CreateTableCommand(this.options))
    }
  }

  /**
   * Drop the DynamoDB table.
   */
  async drop() {
    // Exit if in production.
    // Never drop in production.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Unsafe drop in production.")
    }
    // Check if the DynamoDB exists.
    const exists = await this.check()
    if (exists) {
      await DynamoDB.send(
        new DeleteTableCommand({
          TableName: this.options.TableName,
        }),
      )
    }
  }
}

/**
 * Base table definition.
 */
class BaseTableClass extends Table {
  options: TableOptions = {
    TableName: process.env.DDB_TABLE_NAME || "BaseTable",
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
      { AttributeName: "commentsGSI", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "CommentsIndex",
        KeySchema: [
          { AttributeName: "pk", KeyType: "HASH" },
          { AttributeName: "commentsGSI", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  }
}

// Exports.
export const BaseTable = new BaseTableClass()
