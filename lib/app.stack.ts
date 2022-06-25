/**
 * App AWS CDK stack.
 */

// External imports.
import { Stack, StackProps } from "aws-cdk-lib"
import { Construct } from "constructs"
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda"
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway"
import { Secret } from "aws-cdk-lib/aws-secretsmanager"

/**
 * The App stack.
 */
interface AppStackProps extends StackProps {
  codeZipLocation?: string
}
export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: AppStackProps) {
    super(scope, id, props)

    // The configuration secrets.
    const secrets = Secret.fromSecretNameV2(this, "Secrets", "Disque/Config")

    // The AWS Lambda function.
    const handler = new Function(this, "Function", {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset(props?.codeZipLocation ?? "out/function.zip"),
      handler: "handler.handler",
      environment: {
        NODE_ENV: "production",
        REDIS_URL: secrets.secretValueFromJson("redisUrl").toString(),
        BOT_TOKEN: secrets.secretValueFromJson("botToken").toString(),
      },
    })

    // The AWS API Gateway for the function.
    new LambdaRestApi(this, "Endpoint", {
      handler,
    })
  }
}
