import { v4 as uuidv4 } from 'uuid';

var AWS = require('aws-sdk');

export const handler = (event: any, context, callback) => {
    console.log(event);
    const awsAccountId = context.invokedFunctionArn.split(":")[4];
    var sfnOptions = {};
    
    if (process.env.environmentType == "Dev") {
        sfnOptions["endpoint"] = "http://host.docker.internal:8083";
    }
    var sfnClient = new AWS.StepFunctions(sfnOptions);
    var params = {
        stateMachineArn: `arn:aws:states:${process.env.AWS_REGION}:${awsAccountId}:stateMachine:sam-cdk-state-machine`,
        input: JSON.stringify({}),
        name: uuidv4()
    };
    sfnClient.startExecution(params, (err, data) => {
        if (err) {
            console.log(err);
            const response = {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Step Function failed',
                    error: err
                })
            };
            callback(null, response);
        } else {
            console.log(data);
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: `Step Function started. new Execution ${data['executionArn']}`
                })
            };
            callback(null, response);
        }
    });
}