"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCorsOptions = exports.ApiLambdaCrudDynamoDBStack = void 0;
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const path_1 = require("path");
class ApiLambdaCrudDynamoDBStack extends aws_cdk_lib_1.Stack {
    constructor(app, id) {
        super(app, id);
        const dynamoTable = new aws_dynamodb_1.Table(this, 'kellerliste', {
            partitionKey: {
                name: 'userId',
                type: aws_dynamodb_1.AttributeType.STRING
            },
            tableName: 'kellerliste',
            /**
             *  The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
             * the new table, and it will remain in your account until manually deleted. By setting the policy to
             * DESTROY, cdk destroy will delete the table (even if it has data in it)
             */
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY, // NOT recommended for production code
        });
        const nodeJsFunctionProps = {
            bundling: {
                externalModules: [
                    'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
                ],
            },
            depsLockFilePath: (0, path_1.join)(__dirname, 'lambdas', 'package-lock.json'),
            environment: {
                PRIMARY_KEY: 'userId',
                TABLE_NAME: dynamoTable.tableName,
            },
            runtime: aws_lambda_1.Runtime.NODEJS_20_X,
        };
        // Create a Lambda function for each of the CRUD operations
        const getOneLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'getOneItemFunction', {
            entry: (0, path_1.join)(__dirname, 'lambdas', 'get-one.ts'),
            ...nodeJsFunctionProps,
        });
        const getAllLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'getAllItemsFunction', {
            entry: (0, path_1.join)(__dirname, 'lambdas', 'get-all.ts'),
            ...nodeJsFunctionProps,
        });
        const createOneLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'createItemFunction', {
            entry: (0, path_1.join)(__dirname, 'lambdas', 'create.ts'),
            ...nodeJsFunctionProps,
        });
        const updateOneLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'updateItemFunction', {
            entry: (0, path_1.join)(__dirname, 'lambdas', 'update-one.ts'),
            ...nodeJsFunctionProps,
        });
        const deleteOneLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'deleteItemFunction', {
            entry: (0, path_1.join)(__dirname, 'lambdas', 'delete-one.ts'),
            ...nodeJsFunctionProps,
        });
        // Grant the Lambda function read access to the DynamoDB table
        dynamoTable.grantReadWriteData(getAllLambda);
        dynamoTable.grantReadWriteData(getOneLambda);
        dynamoTable.grantReadWriteData(createOneLambda);
        dynamoTable.grantReadWriteData(updateOneLambda);
        dynamoTable.grantReadWriteData(deleteOneLambda);
        // Integrate the Lambda functions with the API Gateway resource
        const getAllIntegration = new aws_apigateway_1.LambdaIntegration(getAllLambda);
        const createOneIntegration = new aws_apigateway_1.LambdaIntegration(createOneLambda);
        const getOneIntegration = new aws_apigateway_1.LambdaIntegration(getOneLambda);
        const updateOneIntegration = new aws_apigateway_1.LambdaIntegration(updateOneLambda);
        const deleteOneIntegration = new aws_apigateway_1.LambdaIntegration(deleteOneLambda);
        // Create an API Gateway resource for each of the CRUD operations
        const api = new aws_apigateway_1.RestApi(this, 'kellerlisteApi', {
            restApiName: 'kellerliste service'
            // In case you want to manage binary types, uncomment the following
            // binaryMediaTypes: ["*/*"],
        });
        const items = api.root.addResource('items');
        items.addMethod('GET', getAllIntegration);
        items.addMethod('POST', createOneIntegration);
        addCorsOptions(items);
        const singleItem = items.addResource('{id}');
        singleItem.addMethod('GET', getOneIntegration);
        singleItem.addMethod('PATCH', updateOneIntegration);
        singleItem.addMethod('DELETE', deleteOneIntegration);
        addCorsOptions(singleItem);
    }
}
exports.ApiLambdaCrudDynamoDBStack = ApiLambdaCrudDynamoDBStack;
function addCorsOptions(apiResource) {
    apiResource.addMethod('OPTIONS', new aws_apigateway_1.MockIntegration({
        // In case you want to use binary media types, uncomment the following line
        // contentHandling: ContentHandling.CONVERT_TO_TEXT,
        integrationResponses: [{
                statusCode: '200',
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                    'method.response.header.Access-Control-Allow-Origin': "'*'",
                    'method.response.header.Access-Control-Allow-Credentials': "'false'",
                    'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
                },
            }],
        // In case you want to use binary media types, comment out the following line
        passthroughBehavior: aws_apigateway_1.PassthroughBehavior.NEVER,
        requestTemplates: {
            "application/json": "{\"statusCode\": 200}"
        },
    }), {
        methodResponses: [{
                statusCode: '200',
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Headers': true,
                    'method.response.header.Access-Control-Allow-Methods': true,
                    'method.response.header.Access-Control-Allow-Credentials': true,
                    'method.response.header.Access-Control-Allow-Origin': true,
                },
            }]
    });
}
exports.addCorsOptions = addCorsOptions;
const app = new aws_cdk_lib_1.App();
new ApiLambdaCrudDynamoDBStack(app, 'ApiLambdaCrudDynamoDBExample');
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFBeUg7QUFDekgsMkRBQWdFO0FBQ2hFLHVEQUFpRDtBQUNqRCw2Q0FBd0Q7QUFDeEQscUVBQW9GO0FBQ3BGLCtCQUEyQjtBQUUzQixNQUFhLDBCQUEyQixTQUFRLG1CQUFLO0lBQ25ELFlBQVksR0FBUSxFQUFFLEVBQVU7UUFDOUIsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVmLE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQUssQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ2pELFlBQVksRUFBRTtnQkFDWixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsNEJBQWEsQ0FBQyxNQUFNO2FBQzNCO1lBQ0QsU0FBUyxFQUFFLGFBQWE7WUFFeEI7Ozs7ZUFJRztZQUNILGFBQWEsRUFBRSwyQkFBYSxDQUFDLE9BQU8sRUFBRSxzQ0FBc0M7U0FDN0UsQ0FBQyxDQUFDO1FBRUgsTUFBTSxtQkFBbUIsR0FBd0I7WUFDL0MsUUFBUSxFQUFFO2dCQUNSLGVBQWUsRUFBRTtvQkFDZixTQUFTLEVBQUUsb0RBQW9EO2lCQUNoRTthQUNGO1lBQ0QsZ0JBQWdCLEVBQUUsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQztZQUNqRSxXQUFXLEVBQUU7Z0JBQ1gsV0FBVyxFQUFFLFFBQVE7Z0JBQ3JCLFVBQVUsRUFBRSxXQUFXLENBQUMsU0FBUzthQUNsQztZQUNELE9BQU8sRUFBRSxvQkFBTyxDQUFDLFdBQVc7U0FDN0IsQ0FBQTtRQUVELDJEQUEyRDtRQUMzRCxNQUFNLFlBQVksR0FBRyxJQUFJLGtDQUFjLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQ2xFLEtBQUssRUFBRSxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQztZQUMv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Q25ELFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksZ0NBQWUsQ0FBQztRQUNuRCwyRUFBMkU7UUFDM0Usb0RBQW9EO1FBQ3BELG9CQUFvQixFQUFFLENBQUM7Z0JBQ3JCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixrQkFBa0IsRUFBRTtvQkFDbEIscURBQXFELEVBQUUseUZBQXlGO29CQUNoSixvREFBb0QsRUFBRSxLQUFLO29CQUMzRCx5REFBeUQsRUFBRSxTQUFTO29CQUNwRSxxREFBcUQsRUFBRSwrQkFBK0I7aUJBQ3ZGO2FBQ0YsQ0FBQztRQUNGLDZFQUE2RTtRQUM3RSxtQkFBbUIsRUFBRSxvQ0FBbUIsQ0FBQyxLQUFLO1FBQzlDLGdCQUFnQixFQUFFO1lBQ2hCLGtCQUFrQixFQUFFLHVCQUF1QjtTQUM1QztLQUNGLENBQUMsRUFBRTtRQUNGLGVBQWUsRUFBRSxDQUFDO2dCQUNoQixVQUFVLEVBQUUsS0FBSztnQkFDakIsa0JBQWtCLEVBQUU7b0JBQ2xCLHFEQUFxRCxFQUFFLElBQUk7b0JBQzNELHFEQUFxRCxFQUFFLElBQUk7b0JBQzNELHlEQUF5RCxFQUFFLElBQUk7b0JBQy9ELG9EQUFvRCxFQUFFLElBQUk7aUJBQzNEO2FBQ0YsQ0FBQztLQUNILENBQUMsQ0FBQTtBQUNKLENBQUM7QUE3QkQsd0NBNkJDO0FBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxFQUFFLENBQUM7QUFDdEIsSUFBSSwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsOEJBQThCLENBQUMsQ0FBQztBQUNwRSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJUmVzb3VyY2UsIExhbWJkYUludGVncmF0aW9uLCBNb2NrSW50ZWdyYXRpb24sIFBhc3N0aHJvdWdoQmVoYXZpb3IsIFJlc3RBcGkgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgeyBBdHRyaWJ1dGVUeXBlLCBUYWJsZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgeyBSdW50aW1lIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBBcHAsIFN0YWNrLCBSZW1vdmFsUG9saWN5IH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgTm9kZWpzRnVuY3Rpb24sIE5vZGVqc0Z1bmN0aW9uUHJvcHMgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLW5vZGVqcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCdcblxuZXhwb3J0IGNsYXNzIEFwaUxhbWJkYUNydWREeW5hbW9EQlN0YWNrIGV4dGVuZHMgU3RhY2sge1xuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgaWQ6IHN0cmluZykge1xuICAgIHN1cGVyKGFwcCwgaWQpO1xuXG4gICAgY29uc3QgZHluYW1vVGFibGUgPSBuZXcgVGFibGUodGhpcywgJ2tlbGxlcmxpc3RlJywge1xuICAgICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICAgIG5hbWU6ICd1c2VySWQnLFxuICAgICAgICB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklOR1xuICAgICAgfSxcbiAgICAgIHRhYmxlTmFtZTogJ2tlbGxlcmxpc3RlJyxcblxuICAgICAgLyoqXG4gICAgICAgKiAgVGhlIGRlZmF1bHQgcmVtb3ZhbCBwb2xpY3kgaXMgUkVUQUlOLCB3aGljaCBtZWFucyB0aGF0IGNkayBkZXN0cm95IHdpbGwgbm90IGF0dGVtcHQgdG8gZGVsZXRlXG4gICAgICAgKiB0aGUgbmV3IHRhYmxlLCBhbmQgaXQgd2lsbCByZW1haW4gaW4geW91ciBhY2NvdW50IHVudGlsIG1hbnVhbGx5IGRlbGV0ZWQuIEJ5IHNldHRpbmcgdGhlIHBvbGljeSB0b1xuICAgICAgICogREVTVFJPWSwgY2RrIGRlc3Ryb3kgd2lsbCBkZWxldGUgdGhlIHRhYmxlIChldmVuIGlmIGl0IGhhcyBkYXRhIGluIGl0KVxuICAgICAgICovXG4gICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1ksIC8vIE5PVCByZWNvbW1lbmRlZCBmb3IgcHJvZHVjdGlvbiBjb2RlXG4gICAgfSk7XG5cbiAgICBjb25zdCBub2RlSnNGdW5jdGlvblByb3BzOiBOb2RlanNGdW5jdGlvblByb3BzID0ge1xuICAgICAgYnVuZGxpbmc6IHtcbiAgICAgICAgZXh0ZXJuYWxNb2R1bGVzOiBbXG4gICAgICAgICAgJ2F3cy1zZGsnLCAvLyBVc2UgdGhlICdhd3Mtc2RrJyBhdmFpbGFibGUgaW4gdGhlIExhbWJkYSBydW50aW1lXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgZGVwc0xvY2tGaWxlUGF0aDogam9pbihfX2Rpcm5hbWUsICdsYW1iZGFzJywgJ3BhY2thZ2UtbG9jay5qc29uJyksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBQUklNQVJZX0tFWTogJ3VzZXJJZCcsXG4gICAgICAgIFRBQkxFX05BTUU6IGR5bmFtb1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgIH0sXG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18yMF9YLFxuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIExhbWJkYSBmdW5jdGlvbiBmb3IgZWFjaCBvZiB0aGUgQ1JVRCBvcGVyYXRpb25zXG4gICAgY29uc3QgZ2V0T25lTGFtYmRhID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsICdnZXRPbmVJdGVtRnVuY3Rpb24nLCB7XG4gICAgICBlbnRyeTogam9pbihfX2Rpcm5hbWUsICdsYW1iZGFzJywgJ2dldC1vbmUudHMnKSxcbiAgICAgIC4uLm5vZGVKc0Z1bmN0aW9uUHJvcHMsXG4gICAgfSk7XG4gICAgY29uc3QgZ2V0QWxsTGFtYmRhID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsICdnZXRBbGxJdGVtc0Z1bmN0aW9uJywge1xuICAgICAgZW50cnk6IGpvaW4oX19kaXJuYW1lLCAnbGFtYmRhcycsICdnZXQtYWxsLnRzJyksXG4gICAgICAuLi5ub2RlSnNGdW5jdGlvblByb3BzLFxuICAgIH0pO1xuICAgIGNvbnN0IGNyZWF0ZU9uZUxhbWJkYSA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCAnY3JlYXRlSXRlbUZ1bmN0aW9uJywge1xuICAgICAgZW50cnk6IGpvaW4oX19kaXJuYW1lLCAnbGFtYmRhcycsICdjcmVhdGUudHMnKSxcbiAgICAgIC4uLm5vZGVKc0Z1bmN0aW9uUHJvcHMsXG4gICAgfSk7XG4gICAgY29uc3QgdXBkYXRlT25lTGFtYmRhID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsICd1cGRhdGVJdGVtRnVuY3Rpb24nLCB7XG4gICAgICBlbnRyeTogam9pbihfX2Rpcm5hbWUsICdsYW1iZGFzJywgJ3VwZGF0ZS1vbmUudHMnKSxcbiAgICAgIC4uLm5vZGVKc0Z1bmN0aW9uUHJvcHMsXG4gICAgfSk7XG4gICAgY29uc3QgZGVsZXRlT25lTGFtYmRhID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsICdkZWxldGVJdGVtRnVuY3Rpb24nLCB7XG4gICAgICBlbnRyeTogam9pbihfX2Rpcm5hbWUsICdsYW1iZGFzJywgJ2RlbGV0ZS1vbmUudHMnKSxcbiAgICAgIC4uLm5vZGVKc0Z1bmN0aW9uUHJvcHMsXG4gICAgfSk7XG5cbiAgICAvLyBHcmFudCB0aGUgTGFtYmRhIGZ1bmN0aW9uIHJlYWQgYWNjZXNzIHRvIHRoZSBEeW5hbW9EQiB0YWJsZVxuICAgIGR5bmFtb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShnZXRBbGxMYW1iZGEpO1xuICAgIGR5bmFtb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShnZXRPbmVMYW1iZGEpO1xuICAgIGR5bmFtb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShjcmVhdGVPbmVMYW1iZGEpO1xuICAgIGR5bmFtb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YSh1cGRhdGVPbmVMYW1iZGEpO1xuICAgIGR5bmFtb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShkZWxldGVPbmVMYW1iZGEpO1xuXG4gICAgLy8gSW50ZWdyYXRlIHRoZSBMYW1iZGEgZnVuY3Rpb25zIHdpdGggdGhlIEFQSSBHYXRld2F5IHJlc291cmNlXG4gICAgY29uc3QgZ2V0QWxsSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24oZ2V0QWxsTGFtYmRhKTtcbiAgICBjb25zdCBjcmVhdGVPbmVJbnRlZ3JhdGlvbiA9IG5ldyBMYW1iZGFJbnRlZ3JhdGlvbihjcmVhdGVPbmVMYW1iZGEpO1xuICAgIGNvbnN0IGdldE9uZUludGVncmF0aW9uID0gbmV3IExhbWJkYUludGVncmF0aW9uKGdldE9uZUxhbWJkYSk7XG4gICAgY29uc3QgdXBkYXRlT25lSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24odXBkYXRlT25lTGFtYmRhKTtcbiAgICBjb25zdCBkZWxldGVPbmVJbnRlZ3JhdGlvbiA9IG5ldyBMYW1iZGFJbnRlZ3JhdGlvbihkZWxldGVPbmVMYW1iZGEpO1xuXG5cbiAgICAvLyBDcmVhdGUgYW4gQVBJIEdhdGV3YXkgcmVzb3VyY2UgZm9yIGVhY2ggb2YgdGhlIENSVUQgb3BlcmF0aW9uc1xuICAgIGNvbnN0IGFwaSA9IG5ldyBSZXN0QXBpKHRoaXMsICdrZWxsZXJsaXN0ZUFwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAna2VsbGVybGlzdGUgc2VydmljZSdcbiAgICAgIC8vIEluIGNhc2UgeW91IHdhbnQgdG8gbWFuYWdlIGJpbmFyeSB0eXBlcywgdW5jb21tZW50IHRoZSBmb2xsb3dpbmdcbiAgICAgIC8vIGJpbmFyeU1lZGlhVHlwZXM6IFtcIiovKlwiXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGl0ZW1zID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2l0ZW1zJyk7XG4gICAgaXRlbXMuYWRkTWV0aG9kKCdHRVQnLCBnZXRBbGxJbnRlZ3JhdGlvbik7XG4gICAgaXRlbXMuYWRkTWV0aG9kKCdQT1NUJywgY3JlYXRlT25lSW50ZWdyYXRpb24pO1xuICAgIGFkZENvcnNPcHRpb25zKGl0ZW1zKTtcblxuICAgIGNvbnN0IHNpbmdsZUl0ZW0gPSBpdGVtcy5hZGRSZXNvdXJjZSgne2lkfScpO1xuICAgIHNpbmdsZUl0ZW0uYWRkTWV0aG9kKCdHRVQnLCBnZXRPbmVJbnRlZ3JhdGlvbik7XG4gICAgc2luZ2xlSXRlbS5hZGRNZXRob2QoJ1BBVENIJywgdXBkYXRlT25lSW50ZWdyYXRpb24pO1xuICAgIHNpbmdsZUl0ZW0uYWRkTWV0aG9kKCdERUxFVEUnLCBkZWxldGVPbmVJbnRlZ3JhdGlvbik7XG4gICAgYWRkQ29yc09wdGlvbnMoc2luZ2xlSXRlbSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZENvcnNPcHRpb25zKGFwaVJlc291cmNlOiBJUmVzb3VyY2UpIHtcbiAgYXBpUmVzb3VyY2UuYWRkTWV0aG9kKCdPUFRJT05TJywgbmV3IE1vY2tJbnRlZ3JhdGlvbih7XG4gICAgLy8gSW4gY2FzZSB5b3Ugd2FudCB0byB1c2UgYmluYXJ5IG1lZGlhIHR5cGVzLCB1bmNvbW1lbnQgdGhlIGZvbGxvd2luZyBsaW5lXG4gICAgLy8gY29udGVudEhhbmRsaW5nOiBDb250ZW50SGFuZGxpbmcuQ09OVkVSVF9UT19URVhULFxuICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbe1xuICAgICAgc3RhdHVzQ29kZTogJzIwMCcsXG4gICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6IFwiJ0NvbnRlbnQtVHlwZSxYLUFtei1EYXRlLEF1dGhvcml6YXRpb24sWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuLFgtQW16LVVzZXItQWdlbnQnXCIsXG4gICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IFwiJyonXCIsXG4gICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogXCInZmFsc2UnXCIsXG4gICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiBcIidPUFRJT05TLEdFVCxQVVQsUE9TVCxERUxFVEUnXCIsXG4gICAgICB9LFxuICAgIH1dLFxuICAgIC8vIEluIGNhc2UgeW91IHdhbnQgdG8gdXNlIGJpbmFyeSBtZWRpYSB0eXBlcywgY29tbWVudCBvdXQgdGhlIGZvbGxvd2luZyBsaW5lXG4gICAgcGFzc3Rocm91Z2hCZWhhdmlvcjogUGFzc3Rocm91Z2hCZWhhdmlvci5ORVZFUixcbiAgICByZXF1ZXN0VGVtcGxhdGVzOiB7XG4gICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjogXCJ7XFxcInN0YXR1c0NvZGVcXFwiOiAyMDB9XCJcbiAgICB9LFxuICB9KSwge1xuICAgIG1ldGhvZFJlc3BvbnNlczogW3tcbiAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiB0cnVlLFxuICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogdHJ1ZSxcbiAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiB0cnVlLFxuICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiB0cnVlLFxuICAgICAgfSxcbiAgICB9XVxuICB9KVxufVxuXG5jb25zdCBhcHAgPSBuZXcgQXBwKCk7XG5uZXcgQXBpTGFtYmRhQ3J1ZER5bmFtb0RCU3RhY2soYXBwLCAnQXBpTGFtYmRhQ3J1ZER5bmFtb0RCRXhhbXBsZScpO1xuYXBwLnN5bnRoKCk7XG4iXX0=