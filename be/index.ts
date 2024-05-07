import { App, Stack, RemovalPolicy } from "aws-cdk-lib";
import {
  IResource,
  LambdaIntegration,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
  CfnAuthorizer,
  AuthorizationType,
} from "aws-cdk-lib/aws-apigateway";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { join } from "path";
import "dotenv/config";

export class ApiLambdaCrudDynamoDBStack extends Stack {
  constructor(app: App, id: string) {
    super(app, id);

    const dynamoTable = new Table(this, "kellerliste", {
      partitionKey: {
        name: "userEmail",
        type: AttributeType.STRING,
      },
      tableName: "kellerliste",

      /**
       *  The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
       * the new table, and it will remain in your account until manually deleted. By setting the policy to
       * DESTROY, cdk destroy will delete the table (even if it has data in it)
       */
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          "aws-sdk", // Use the 'aws-sdk' available in the Lambda runtime
        ],
      },
      depsLockFilePath: join(__dirname, "lambdas", "package-lock.json"),
      environment: {
        PRIMARY_KEY: "userEmail",
        TABLE_NAME: dynamoTable.tableName,
        COGNITO_DOMAIN: process.env.COGNITO_DOMAIN || "",
        COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID || "",
        COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET || "",
        COGNITO_REDIRECT_URI: process.env.COGNITO_REDIRECT_URI || "",
      },
      runtime: Runtime.NODEJS_LATEST,
    };

    // Create a Lambda function for each of the CRUD operations
    const getOneLambda = new NodejsFunction(this, "getOneItemFunction", {
      entry: join(__dirname, "lambdas", "get-one.ts"),
      ...nodeJsFunctionProps,
    });
    const getAllLambda = new NodejsFunction(this, "getAllItemsFunction", {
      entry: join(__dirname, "lambdas", "get-all.ts"),
      ...nodeJsFunctionProps,
    });
    const createOneLambda = new NodejsFunction(this, "createItemFunction", {
      entry: join(__dirname, "lambdas", "create.ts"),
      ...nodeJsFunctionProps,
    });
    const updateOneLambda = new NodejsFunction(this, "updateItemFunction", {
      entry: join(__dirname, "lambdas", "update-one.ts"),
      ...nodeJsFunctionProps,
    });
    const deleteOneLambda = new NodejsFunction(this, "deleteItemFunction", {
      entry: join(__dirname, "lambdas", "delete-one.ts"),
      ...nodeJsFunctionProps,
    });

    // authToken
    const getAuthTokenLambda = new NodejsFunction(this, "getAuthTokenFunction", {
      entry: join(__dirname, "lambdas", "get-auth-token.ts"),
      ...nodeJsFunctionProps,
    });

    // Grant the Lambda function read access to the DynamoDB table
    dynamoTable.grantReadWriteData(getAllLambda);
    dynamoTable.grantReadWriteData(getOneLambda);
    dynamoTable.grantReadWriteData(createOneLambda);
    dynamoTable.grantReadWriteData(updateOneLambda);
    dynamoTable.grantReadWriteData(deleteOneLambda);

    // Integrate the Lambda functions with the API Gateway resource
    const getAllIntegration = new LambdaIntegration(getAllLambda);
    const createOneIntegration = new LambdaIntegration(createOneLambda);
    const getOneIntegration = new LambdaIntegration(getOneLambda);
    const updateOneIntegration = new LambdaIntegration(updateOneLambda);
    const deleteOneIntegration = new LambdaIntegration(deleteOneLambda);
    const getAuthTokenIntegration = new LambdaIntegration(getAuthTokenLambda);

    // Create an API Gateway resource for each of the CRUD operations
    const kellerlisteApi = new RestApi(this, "kellerlisteApi", {
      restApiName: "kellerliste service",
      // In case you want to manage binary types, uncomment the following
      // binaryMediaTypes: ["*/*"],
    });

    // create a user Pool
    const userPoolId = process.env.COGNITO_USER_POOL_ID || "";
    const userPool = UserPool.fromUserPoolId(this, "ImportedUserPool", userPoolId);

    // create an authorizer
    const authorizer = new CfnAuthorizer(this, "cfnAuth", {
      restApiId: kellerlisteApi.restApiId,
      name: "kellerlisteApiAuthorizer",
      type: "COGNITO_USER_POOLS",
      identitySource: "method.request.header.Authorization",
      providerArns: [userPool.userPoolArn],
    });
    // construct auth params for the lambdas
    const authParams = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref,
      },
    };

    const items = kellerlisteApi.root.addResource("items");
    items.addMethod("GET", getAllIntegration, authParams);
    items.addMethod("POST", createOneIntegration, authParams);
    addCorsOptions(items);

    const singleItem = items.addResource("{id}");
    singleItem.addMethod("GET", getOneIntegration, authParams);
    singleItem.addMethod("PATCH", updateOneIntegration, authParams);
    singleItem.addMethod("DELETE", deleteOneIntegration, authParams);
    addCorsOptions(singleItem);

    const authToken = kellerlisteApi.root.addResource("auth");
    authToken.addMethod("GET", getAuthTokenIntegration);
    addCorsOptions(authToken);
  }
}

export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod(
    "OPTIONS",
    new MockIntegration({
      // In case you want to use binary media types, uncomment the following line
      // contentHandling: ContentHandling.CONVERT_TO_TEXT,
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials": "'false'",
            "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,GET,PUT, PATCH, POST,DELETE'",
          },
        },
      ],
      // In case you want to use binary media types, comment out the following line
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{"statusCode": 200}',
      },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}

const app = new App();
new ApiLambdaCrudDynamoDBStack(app, "ApiLambdaCrudDynamoDBExample");
app.synth();
