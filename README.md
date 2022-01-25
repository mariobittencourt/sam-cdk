# Project

This is a smaple project that represents a simple flow that is commonly used in real ones.

SQS serving as a event source for a lambda that does some processing and triggers a step function.

Ideally we are looking for ways to make the developer experience better for local and remote deployments.

# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## Demo Steps:
 * Synthesize the CDK Application using this command `npm install && cdk synth --no-staging`
 * Run the following commands to simulate the lambda functions
 ```
 cd cdk.out
  sam build -t SamCdkStack.template.json 
  sam local start-lambda --parameter-overrides 'ParameterKey=environmentType,ParameterValue=Dev'
  ```
 * Use this [documentation](https://docs.aws.amazon.com/step-functions/latest/dg/sfn-local.html) to download the StepFunction local simulator.
 * Run the following command to start the StepFunction simulator.
```
java -jar StepFunctionsLocal.jar --lambda-endpoint http://localhost:3001 --aws-account 012345678912 step-functions-endpoint http://localhost:8083
```
* Run the following command to create the State Machine. 
```
aws stepfunctions --endpoint http://localhost:8083 create-state-machine --definition "{\
\"StartAt\":\"SomeTask\",\
\"States\":{\
    \"SomeTask\":{\
        \"End\":true,\
        \"Retry\":[\
        {\
            \"ErrorEquals\":[ \"Lambda.ServiceException\", \"Lambda.AWSLambdaException\", \"Lambda.SdkClientException\" ],\
            \"IntervalSeconds\":2,\
            \"MaxAttempts\":6,\
            \"BackoffRate\":2\
        }\
        ],\
        \"Type\":\"Task\",\
        \"Resource\":\"arn:aws:states:::lambda:invoke\",\
        \"Parameters\":{\
        \"FunctionName\":\"arn:aws:lambda:us-east-1:012345678912:function:some-task-function\",\
        \"Payload\":{\
            \"message\":\"Hello from CDK!\"\
        }\
        }\
    }\
}\
}"  --name "sam-cdk-state-machine" --role-arn "arn:aws:iam::123456789012:role/DummyRole"
```
* Run the following Command to invoke the `Router` Lambda function, which will create a StateMachine instance. Then the create StateMachine instance will invoke `SomeTaskFunction`
* check the `out.txt` to get the created StateMachine instance ARN. It should contain something similar to the following
```
{
    "statusCode":200,
    "body":"{
        \"message\":\"Step Function started. new Execution arn:aws:states:us-east-1:012345678912:execution:sam-cdk-state-machine:0c371858-8013-46c7-917e-7731f08dee89\"
    }"
}
```
* Run the following command, to describe the created StateMachine instance
```
aws stepfunctions --endpoint http://localhost:8083 describe-execution --execution-arn arn:aws:states:us-east-1:012345678912:execution:sam-cdk-state-machine:0c371858-8013-46c7-917e-7731f08dee89
```