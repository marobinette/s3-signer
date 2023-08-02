import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';

export class S3SignerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const signer = new NodejsFunction(this, 'signerHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
			entry: path.join(__dirname, `/../lambdas/signer.js`),
      handler: 'handler',
    });
    const bucketPolicyStatement = new cdk.aws_iam.PolicyStatement({
			actions: [
				's3:AbortMultipartUpload',
				's3:GetBucketLocation',
				's3:GetObject',
				's3:ListBucket',
				's3:ListBucketMultipartUploads',
				's3:PutObject'
			],
			effect: cdk.aws_iam.Effect.ALLOW,
			resources: [
        'arn:aws:s3:::reports-service-dev-riskalyze-storage',
        'arn:aws:s3:::reports-service-dev-riskalyze-storage/*'
        ],
		});

    const queuePolicyStatement = new cdk.aws_iam.PolicyStatement({
      actions: ['sqs:SendMessage'],
      effect: cdk.aws_iam.Effect.ALLOW,
      resources: [
        'arn:aws:sqs:us-east-2:263955829476:html-to-pdf-generator-dev-queue'
      ]
    });

    signer.role?.attachInlinePolicy(
			new cdk.aws_iam.Policy(this, 'bucket-policy', {
				statements: [bucketPolicyStatement],
			}),
		);
    signer.role?.attachInlinePolicy(
      new cdk.aws_iam.Policy(this, 'queue-policy', {
        statements: [queuePolicyStatement]
      }),
    );
  }
}
