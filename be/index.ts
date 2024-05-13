import { App, Stack } from "aws-cdk-lib";
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
import { DEPLOYMENT_STAGE } from "./types/types";

export class KellerlisteStack extends Stack {
  constructor(app: App, id: string, currentStage: DEPLOYMENT_STAGE) {
    super(app, id);

    // identify stage
    const STAGE = currentStage;

    // create table
    const tableName = STAGE === "prod" ? "kellerliste" : "kellerliste-dev";
    const tableId = STAGE === "prod" ? "kellerliste" : "kellerliste-dev";
    const dynamoTable = new Table(this, tableId, {
      partitionKey: {
        name: "userEmail",
        type: AttributeType.STRING,
      },
      tableName
    });

    // create function props
    const cognitoDomain = (STAGE === "prod" ? process.env.COGNITO_DOMAIN : process.env.COGNITO_DOMAIN_DEV) || "";
    const cognitoClientId = (STAGE === "prod" ? process.env.COGNITO_CLIENT_ID : process.env.COGNITO_CLIENT_ID_DEV) || "";
    const cognitoClientSecret = (STAGE === "prod" ? process.env.COGNITO_CLIENT_SECRET : process.env.COGNITO_CLIENT_SECRET_DEV) || "";
    const cognitoRedirectUri = (STAGE === "prod" ? process.env.COGNITO_REDIRECT_URI : process.env.COGNITO_REDIRECT_URI_DEV) || "";
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
        COGNITO_DOMAIN: cognitoDomain,
        COGNITO_CLIENT_ID: cognitoClientId,
        COGNITO_CLIENT_SECRET: cognitoClientSecret,
        COGNITO_REDIRECT_URI: cognitoRedirectUri,
      },
      runtime: Runtime.NODEJS_20_X,
    };

    // lambdas for inventory CRUD operations
    const initInventoryLambda = new NodejsFunction(this, "initInventoryFunction", {
      entry: join(__dirname, "lambdas", "init-inventory.ts"),
      ...nodeJsFunctionProps,
    });
    const getOneLambda = new NodejsFunction(this, "getOneItemFunction", {
      entry: join(__dirname, "lambdas", "get-one.ts"),
      ...nodeJsFunctionProps,
    });
    const getAllLambda = new NodejsFunction(this, "getAllItemsFunction", {
      entry: join(__dirname, "lambdas", "get-all.ts"),
      ...nodeJsFunctionProps,
    });
    const createOneLambda = new NodejsFunction(this, "createItemFunction", {
      entry: join(__dirname, "lambdas", "create-one.ts"),
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
    
    // lambda for getting auth tokens
    const getAuthTokenLambda = new NodejsFunction(this, "getAuthTokenFunction", {
      entry: join(__dirname, "lambdas", "get-auth-token.ts"),
      ...nodeJsFunctionProps,
    });

    // Grant the Lambda functions read access to the DynamoDB table
    dynamoTable.grantReadWriteData(getAllLambda);
    dynamoTable.grantReadWriteData(getOneLambda);
    dynamoTable.grantReadWriteData(createOneLambda);
    dynamoTable.grantReadWriteData(updateOneLambda);
    dynamoTable.grantReadWriteData(deleteOneLambda);
    dynamoTable.grantReadWriteData(initInventoryLambda);

    // Integrate the Lambda functions with the API Gateway resource
    const getAllIntegration = new LambdaIntegration(getAllLambda);
    const createOneIntegration = new LambdaIntegration(createOneLambda);
    const getOneIntegration = new LambdaIntegration(getOneLambda);
    const updateOneIntegration = new LambdaIntegration(updateOneLambda);
    const deleteOneIntegration = new LambdaIntegration(deleteOneLambda);
    const getAuthTokenIntegration = new LambdaIntegration(getAuthTokenLambda);

    // create api gateway
    const apigatewayId = STAGE === "prod" ? "kellerliste-api" : "kellerliste-api-dev";
    const apigatewayName = STAGE === "prod" ? "kellerliste-api" : "kellerliste-api-dev";
    const kellerlisteApi = new RestApi(this, apigatewayId, {
      restApiName: apigatewayName,
      // In case you want to manage binary types, uncomment the following
      // binaryMediaTypes: ["*/*"],
    });

    // import existing user pools
    const userPoolId = (STAGE === "prod" ? process.env.COGNITO_USER_POOL_ID : process.env.COGNITO_USER_POOL_ID_DEV) || "";
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

    // connect the lambdas as endpoints to the api gateway
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
            "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials": "'false'",
            "method.response.header.Access-Control-Allow-Methods": "'OPTIONS, GET, PUT, PATCH, POST, DELETE'",
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
new KellerlisteStack(app, "kellerlisteStackDev", 'dev');
new KellerlisteStack(app, "kellerlisteStackProd", 'prod');
app.synth();
