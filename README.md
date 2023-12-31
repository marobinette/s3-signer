# S3 signer and message sender
This is a POC, which creates signed URLs for existing s3 resources, constructs a SQS message containing the signed URLs and throws the message on the queue, which triggers the creation of a PDF.

The POC assumes 2 files already exist in s3, one containing HTML and an empty PDF.

Example of HTML file content:
```
{
  "cover": {
    "template": "<div>Cover</div>",
    "params": {
      "format": "A4",
      "margin": {
        "left": "5mm",
        "top": "5mm",
        "right": "5mm",
        "bottom": "0"
      }
    }
  },
  "content": {
    "template": "<div>content</div>",
    "params": {
      "format": "A4",
      "displayHeaderFooter": true,
      "footerTemplate": "<div>footer</div>",
      "margin": {
        "left": "5mm",
        "top": "5mm",
        "right": "5mm",
        "bottom": "25mm"
      }
    }
  }
}
```

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
