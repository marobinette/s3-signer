#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { S3SignerStack } from '../lib/s3-signer-stack';

const app = new cdk.App();
new S3SignerStack(app, 'S3SignerStack');
