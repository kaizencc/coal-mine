import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as route53 from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';

export class ReferenceAppStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create two lambda backend functions
    const hello = new lambda.Function(this, 'GreetLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'hello.handler',
    });

    const discussion = new lambda.Function(this, 'DiscussionLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'discussion.handler',
    });

    // Add API gateways for the two lambda backend functions
    new apigw.LambdaRestApi(this, 'Endpoint', {
      description: 'first endpoint',
      handler: hello,
    });

    new apigw.LambdaRestApi(this, 'Endpoint2', {
      description: 'second endpoint',
      handler: discussion,
    });

    // // Use AWS route53 domain name service to simplify endpoints
    // new route53.PublicHostedZone(this, 'HostedZone', {
    //   zoneName: '',
    // });
  }
}
