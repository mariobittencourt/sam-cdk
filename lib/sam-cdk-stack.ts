import { CfnParameter, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { StateMachine, TaskInput } from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';

export class SamCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const environmentType = new CfnParameter(this, "environmentType", {
      type: "String",
      default: "Prod"
    });

    const queue = new Queue(this, 'Queue', {
    queueName: 'sam-cdk-queue' 
    });

    const router = new NodejsFunction(this, 'Router', {
      functionName: 'sam-cdk-router',
      entry: './src/router.ts',
      handler: 'handler',
      environment: {
        "environmentType": environmentType.valueAsString
      },
    });

    const table = new Table(this, 'Table', {
      tableName: 'sam-cdk-table',
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING
      },
    });

    router.addEventSource(new SqsEventSource(queue));

    const someTaskFunction = new NodejsFunction(this, 'SomeTaskFunction', {
      functionName: 'some-task-function',
      entry: './src/some-task-function.ts',
      handler: 'handler',
      environment: {
      },
    });

    table.grantReadWriteData(someTaskFunction);

    const someTask = new LambdaInvoke(this, 'SomeTask', {
      payload: TaskInput.fromObject({
          message: 'Hello from CDK!'
          }
      ),
      lambdaFunction: someTaskFunction,
    });

    const stateMachine = new StateMachine(this, 'StateMachine', {
      stateMachineName: 'sam-cdk-state-machine',
      definition: someTask
    });

    stateMachine.grantStartExecution(router);
  }
}