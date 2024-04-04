"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCorsOptions = exports.KellerlisteStack = void 0;
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const path_1 = require("path");
class KellerlisteStack extends aws_cdk_lib_1.Stack {
    constructor(app, id) {
        super(app, id);
        const dynamoTable = new aws_dynamodb_1.Table(this, 'kellerliste-hebo', {
            partitionKey: {
                name: 'itemId',
                type: aws_dynamodb_1.AttributeType.STRING
            },
            tableName: 'kellerliste-hebo',
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
                PRIMARY_KEY: 'itemId',
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
exports.KellerlisteStack = KellerlisteStack;
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
new KellerlisteStack(app, 'KellerlisteStack');
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFBeUg7QUFDekgsMkRBQWdFO0FBQ2hFLHVEQUFpRDtBQUNqRCw2Q0FBd0Q7QUFDeEQscUVBQW9GO0FBQ3BGLCtCQUEyQjtBQUUzQixNQUFhLGdCQUFpQixTQUFRLG1CQUFLO0lBQ3pDLFlBQVksR0FBUSxFQUFFLEVBQVU7UUFDOUIsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVmLE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQUssQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDdEQsWUFBWSxFQUFFO2dCQUNaLElBQUksRUFBRSxRQUFRO2dCQUNkLElBQUksRUFBRSw0QkFBYSxDQUFDLE1BQU07YUFDM0I7WUFDRCxTQUFTLEVBQUUsa0JBQWtCO1lBRTdCOzs7O2VBSUc7WUFDSCxhQUFhLEVBQUUsMkJBQWEsQ0FBQyxPQUFPLEVBQUUsc0NBQXNDO1NBQzdFLENBQUMsQ0FBQztRQUVILE1BQU0sbUJBQW1CLEdBQXdCO1lBQy9DLFFBQVEsRUFBRTtnQkFDUixlQUFlLEVBQUU7b0JBQ2YsU0FBUyxFQUFFLG9EQUFvRDtpQkFDaEU7YUFDRjtZQUNELGdCQUFnQixFQUFFLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLENBQUM7WUFDakUsV0FBVyxFQUFFO2dCQUNYLFdBQVcsRUFBRSxRQUFRO2dCQUNyQixVQUFVLEVBQUUsV0FBVyxDQUFDLFNBQVM7YUFDbEM7WUFDRCxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO1NBQzdCLENBQUE7UUFFRCwyREFBMkQ7UUFDM0QsTUFBTSxZQUFZLEdBQUcsSUFBSSxrQ0FBYyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUNsRSxLQUFLLEVBQUUsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUM7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QjtJQUNuRCxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLGdDQUFlLENBQUM7UUFDbkQsMkVBQTJFO1FBQzNFLG9EQUFvRDtRQUNwRCxvQkFBb0IsRUFBRSxDQUFDO2dCQUNyQixVQUFVLEVBQUUsS0FBSztnQkFDakIsa0JBQWtCLEVBQUU7b0JBQ2xCLHFEQUFxRCxFQUFFLHlGQUF5RjtvQkFDaEosb0RBQW9ELEVBQUUsS0FBSztvQkFDM0QseURBQXlELEVBQUUsU0FBUztvQkFDcEUscURBQXFELEVBQUUsK0JBQStCO2lCQUN2RjthQUNGLENBQUM7UUFDRiw2RUFBNkU7UUFDN0UsbUJBQW1CLEVBQUUsb0NBQW1CLENBQUMsS0FBSztRQUM5QyxnQkFBZ0IsRUFBRTtZQUNoQixrQkFBa0IsRUFBRSx1QkFBdUI7U0FDNUM7S0FDRixDQUFDLEVBQUU7UUFDRixlQUFlLEVBQUUsQ0FBQztnQkFDaEIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLGtCQUFrQixFQUFFO29CQUNsQixxREFBcUQsRUFBRSxJQUFJO29CQUMzRCxxREFBcUQsRUFBRSxJQUFJO29CQUMzRCx5REFBeUQsRUFBRSxJQUFJO29CQUMvRCxvREFBb0QsRUFBRSxJQUFJO2lCQUMzRDthQUNGLENBQUM7S0FDSCxDQUFDLENBQUE7QUFDSixDQUFDO0FBN0JELHdDQTZCQztBQUVELE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQUcsRUFBRSxDQUFDO0FBQ3RCLElBQUksZ0JBQWdCLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDOUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSVJlc291cmNlLCBMYW1iZGFJbnRlZ3JhdGlvbiwgTW9ja0ludGVncmF0aW9uLCBQYXNzdGhyb3VnaEJlaGF2aW9yLCBSZXN0QXBpIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0IHsgQXR0cmlidXRlVHlwZSwgVGFibGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0IHsgUnVudGltZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgQXBwLCBTdGFjaywgUmVtb3ZhbFBvbGljeSB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IE5vZGVqc0Z1bmN0aW9uLCBOb2RlanNGdW5jdGlvblByb3BzIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ub2RlanMnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBjbGFzcyBLZWxsZXJsaXN0ZVN0YWNrIGV4dGVuZHMgU3RhY2sge1xuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgaWQ6IHN0cmluZykge1xuICAgIHN1cGVyKGFwcCwgaWQpO1xuXG4gICAgY29uc3QgZHluYW1vVGFibGUgPSBuZXcgVGFibGUodGhpcywgJ2tlbGxlcmxpc3RlLWhlYm8nLCB7XG4gICAgICBwYXJ0aXRpb25LZXk6IHtcbiAgICAgICAgbmFtZTogJ2l0ZW1JZCcsXG4gICAgICAgIHR5cGU6IEF0dHJpYnV0ZVR5cGUuU1RSSU5HXG4gICAgICB9LFxuICAgICAgdGFibGVOYW1lOiAna2VsbGVybGlzdGUtaGVibycsXG5cbiAgICAgIC8qKlxuICAgICAgICogIFRoZSBkZWZhdWx0IHJlbW92YWwgcG9saWN5IGlzIFJFVEFJTiwgd2hpY2ggbWVhbnMgdGhhdCBjZGsgZGVzdHJveSB3aWxsIG5vdCBhdHRlbXB0IHRvIGRlbGV0ZVxuICAgICAgICogdGhlIG5ldyB0YWJsZSwgYW5kIGl0IHdpbGwgcmVtYWluIGluIHlvdXIgYWNjb3VudCB1bnRpbCBtYW51YWxseSBkZWxldGVkLiBCeSBzZXR0aW5nIHRoZSBwb2xpY3kgdG9cbiAgICAgICAqIERFU1RST1ksIGNkayBkZXN0cm95IHdpbGwgZGVsZXRlIHRoZSB0YWJsZSAoZXZlbiBpZiBpdCBoYXMgZGF0YSBpbiBpdClcbiAgICAgICAqL1xuICAgICAgcmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvLyBOT1QgcmVjb21tZW5kZWQgZm9yIHByb2R1Y3Rpb24gY29kZVxuICAgIH0pO1xuXG4gICAgY29uc3Qgbm9kZUpzRnVuY3Rpb25Qcm9wczogTm9kZWpzRnVuY3Rpb25Qcm9wcyA9IHtcbiAgICAgIGJ1bmRsaW5nOiB7XG4gICAgICAgIGV4dGVybmFsTW9kdWxlczogW1xuICAgICAgICAgICdhd3Mtc2RrJywgLy8gVXNlIHRoZSAnYXdzLXNkaycgYXZhaWxhYmxlIGluIHRoZSBMYW1iZGEgcnVudGltZVxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIGRlcHNMb2NrRmlsZVBhdGg6IGpvaW4oX19kaXJuYW1lLCAnbGFtYmRhcycsICdwYWNrYWdlLWxvY2suanNvbicpLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgUFJJTUFSWV9LRVk6ICdpdGVtSWQnLFxuICAgICAgICBUQUJMRV9OQU1FOiBkeW5hbW9UYWJsZS50YWJsZU5hbWUsXG4gICAgICB9LFxuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMjBfWCxcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSBMYW1iZGEgZnVuY3Rpb24gZm9yIGVhY2ggb2YgdGhlIENSVUQgb3BlcmF0aW9uc1xuICAgIGNvbnN0IGdldE9uZUxhbWJkYSA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCAnZ2V0T25lSXRlbUZ1bmN0aW9uJywge1xuICAgICAgZW50cnk6IGpvaW4oX19kaXJuYW1lLCAnbGFtYmRhcycsICdnZXQtb25lLnRzJyksXG4gICAgICAuLi5ub2RlSnNGdW5jdGlvblByb3BzLFxuICAgIH0pO1xuICAgIGNvbnN0IGdldEFsbExhbWJkYSA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCAnZ2V0QWxsSXRlbXNGdW5jdGlvbicsIHtcbiAgICAgIGVudHJ5OiBqb2luKF9fZGlybmFtZSwgJ2xhbWJkYXMnLCAnZ2V0LWFsbC50cycpLFxuICAgICAgLi4ubm9kZUpzRnVuY3Rpb25Qcm9wcyxcbiAgICB9KTtcbiAgICBjb25zdCBjcmVhdGVPbmVMYW1iZGEgPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ2NyZWF0ZUl0ZW1GdW5jdGlvbicsIHtcbiAgICAgIGVudHJ5OiBqb2luKF9fZGlybmFtZSwgJ2xhbWJkYXMnLCAnY3JlYXRlLnRzJyksXG4gICAgICAuLi5ub2RlSnNGdW5jdGlvblByb3BzLFxuICAgIH0pO1xuICAgIGNvbnN0IHVwZGF0ZU9uZUxhbWJkYSA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCAndXBkYXRlSXRlbUZ1bmN0aW9uJywge1xuICAgICAgZW50cnk6IGpvaW4oX19kaXJuYW1lLCAnbGFtYmRhcycsICd1cGRhdGUtb25lLnRzJyksXG4gICAgICAuLi5ub2RlSnNGdW5jdGlvblByb3BzLFxuICAgIH0pO1xuICAgIGNvbnN0IGRlbGV0ZU9uZUxhbWJkYSA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCAnZGVsZXRlSXRlbUZ1bmN0aW9uJywge1xuICAgICAgZW50cnk6IGpvaW4oX19kaXJuYW1lLCAnbGFtYmRhcycsICdkZWxldGUtb25lLnRzJyksXG4gICAgICAuLi5ub2RlSnNGdW5jdGlvblByb3BzLFxuICAgIH0pO1xuXG4gICAgLy8gR3JhbnQgdGhlIExhbWJkYSBmdW5jdGlvbiByZWFkIGFjY2VzcyB0byB0aGUgRHluYW1vREIgdGFibGVcbiAgICBkeW5hbW9UYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZ2V0QWxsTGFtYmRhKTtcbiAgICBkeW5hbW9UYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZ2V0T25lTGFtYmRhKTtcbiAgICBkeW5hbW9UYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoY3JlYXRlT25lTGFtYmRhKTtcbiAgICBkeW5hbW9UYWJsZS5ncmFudFJlYWRXcml0ZURhdGEodXBkYXRlT25lTGFtYmRhKTtcbiAgICBkeW5hbW9UYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZGVsZXRlT25lTGFtYmRhKTtcblxuICAgIC8vIEludGVncmF0ZSB0aGUgTGFtYmRhIGZ1bmN0aW9ucyB3aXRoIHRoZSBBUEkgR2F0ZXdheSByZXNvdXJjZVxuICAgIGNvbnN0IGdldEFsbEludGVncmF0aW9uID0gbmV3IExhbWJkYUludGVncmF0aW9uKGdldEFsbExhbWJkYSk7XG4gICAgY29uc3QgY3JlYXRlT25lSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24oY3JlYXRlT25lTGFtYmRhKTtcbiAgICBjb25zdCBnZXRPbmVJbnRlZ3JhdGlvbiA9IG5ldyBMYW1iZGFJbnRlZ3JhdGlvbihnZXRPbmVMYW1iZGEpO1xuICAgIGNvbnN0IHVwZGF0ZU9uZUludGVncmF0aW9uID0gbmV3IExhbWJkYUludGVncmF0aW9uKHVwZGF0ZU9uZUxhbWJkYSk7XG4gICAgY29uc3QgZGVsZXRlT25lSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24oZGVsZXRlT25lTGFtYmRhKTtcblxuXG4gICAgLy8gQ3JlYXRlIGFuIEFQSSBHYXRld2F5IHJlc291cmNlIGZvciBlYWNoIG9mIHRoZSBDUlVEIG9wZXJhdGlvbnNcbiAgICBjb25zdCBhcGkgPSBuZXcgUmVzdEFwaSh0aGlzLCAna2VsbGVybGlzdGVBcGknLCB7XG4gICAgICByZXN0QXBpTmFtZTogJ2tlbGxlcmxpc3RlIHNlcnZpY2UnXG4gICAgICAvLyBJbiBjYXNlIHlvdSB3YW50IHRvIG1hbmFnZSBiaW5hcnkgdHlwZXMsIHVuY29tbWVudCB0aGUgZm9sbG93aW5nXG4gICAgICAvLyBiaW5hcnlNZWRpYVR5cGVzOiBbXCIqLypcIl0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBpdGVtcyA9IGFwaS5yb290LmFkZFJlc291cmNlKCdpdGVtcycpO1xuICAgIGl0ZW1zLmFkZE1ldGhvZCgnR0VUJywgZ2V0QWxsSW50ZWdyYXRpb24pO1xuICAgIGl0ZW1zLmFkZE1ldGhvZCgnUE9TVCcsIGNyZWF0ZU9uZUludGVncmF0aW9uKTtcbiAgICBhZGRDb3JzT3B0aW9ucyhpdGVtcyk7XG5cbiAgICBjb25zdCBzaW5nbGVJdGVtID0gaXRlbXMuYWRkUmVzb3VyY2UoJ3tpZH0nKTtcbiAgICBzaW5nbGVJdGVtLmFkZE1ldGhvZCgnR0VUJywgZ2V0T25lSW50ZWdyYXRpb24pO1xuICAgIHNpbmdsZUl0ZW0uYWRkTWV0aG9kKCdQQVRDSCcsIHVwZGF0ZU9uZUludGVncmF0aW9uKTtcbiAgICBzaW5nbGVJdGVtLmFkZE1ldGhvZCgnREVMRVRFJywgZGVsZXRlT25lSW50ZWdyYXRpb24pO1xuICAgIGFkZENvcnNPcHRpb25zKHNpbmdsZUl0ZW0pO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRDb3JzT3B0aW9ucyhhcGlSZXNvdXJjZTogSVJlc291cmNlKSB7XG4gIGFwaVJlc291cmNlLmFkZE1ldGhvZCgnT1BUSU9OUycsIG5ldyBNb2NrSW50ZWdyYXRpb24oe1xuICAgIC8vIEluIGNhc2UgeW91IHdhbnQgdG8gdXNlIGJpbmFyeSBtZWRpYSB0eXBlcywgdW5jb21tZW50IHRoZSBmb2xsb3dpbmcgbGluZVxuICAgIC8vIGNvbnRlbnRIYW5kbGluZzogQ29udGVudEhhbmRsaW5nLkNPTlZFUlRfVE9fVEVYVCxcbiAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW3tcbiAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiBcIidDb250ZW50LVR5cGUsWC1BbXotRGF0ZSxBdXRob3JpemF0aW9uLFgtQXBpLUtleSxYLUFtei1TZWN1cml0eS1Ub2tlbixYLUFtei1Vc2VyLUFnZW50J1wiLFxuICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiBcIicqJ1wiLFxuICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyc6IFwiJ2ZhbHNlJ1wiLFxuICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogXCInT1BUSU9OUyxHRVQsUFVULFBPU1QsREVMRVRFJ1wiLFxuICAgICAgfSxcbiAgICB9XSxcbiAgICAvLyBJbiBjYXNlIHlvdSB3YW50IHRvIHVzZSBiaW5hcnkgbWVkaWEgdHlwZXMsIGNvbW1lbnQgb3V0IHRoZSBmb2xsb3dpbmcgbGluZVxuICAgIHBhc3N0aHJvdWdoQmVoYXZpb3I6IFBhc3N0aHJvdWdoQmVoYXZpb3IuTkVWRVIsXG4gICAgcmVxdWVzdFRlbXBsYXRlczoge1xuICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IFwie1xcXCJzdGF0dXNDb2RlXFxcIjogMjAwfVwiXG4gICAgfSxcbiAgfSksIHtcbiAgICBtZXRob2RSZXNwb25zZXM6IFt7XG4gICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogdHJ1ZSxcbiAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6IHRydWUsXG4gICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogdHJ1ZSxcbiAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfV1cbiAgfSlcbn1cblxuY29uc3QgYXBwID0gbmV3IEFwcCgpO1xubmV3IEtlbGxlcmxpc3RlU3RhY2soYXBwLCAnS2VsbGVybGlzdGVTdGFjaycpO1xuYXBwLnN5bnRoKCk7XG4iXX0=