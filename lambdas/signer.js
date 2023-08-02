const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const AWS = require("aws-sdk");
AWS.config.update({region: "us-east-2"});

  const createPresignedUrlWithClientGET = async () => {
    const region = "us-east-2";
    const bucket = "reports-service-dev-riskalyze-storage";
    const key = "tmp/11a1d3e93aba92fcf7dfe5c64ed87275ed034ee8/489613895/statsOverviewReport/html-pdf.json";
    const client = new S3Client({ region });
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 360000 });
  };


  const createPresignedUrlWithClientPost = () => {
    const region = "us-east-2";
    const bucket = "reports-service-dev-riskalyze-storage";
    const key = "11a1d3e93aba92fcf7dfe5c64ed87275ed034ee8/489613895/statsOverviewReport/html-to-pdf.pdf";
    const client = new S3Client({ region });
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: "application/pdf"});
    return getSignedUrl(client, command, { expiresIn: 3600 });
  };

exports.handler = async function(event) {
    try {
        const sqs = new AWS.SQS({apiVersion: "2012-11-05"});

        const htmlURL = await createPresignedUrlWithClientGET();
        const pdfURL = await createPresignedUrlWithClientPost();
        console.log(htmlURL);
        console.log(pdfURL);

        // construct message to be sent to html-to-pdf-queue
        const message = {
          url: {
            jsonFile: htmlURL,
            pdfDestination: pdfURL,
          },
          reply: {
            sqsTopic: "https://sqs.us-east-2.amazonaws.com/263955829476/reports-service-attachments-handler",
            payload: {
              reportId: 9475,
              content: "https://reports-service-dev-riskalyze-storage.s3-us-east-2.amazonaws.com/11a1d3e93aba92fcf7dfe5c64ed87275ed034ee8/489613895/statsOverviewReport/Portfolio-Stats-Overview-test-July-27-2023-19:26:13.pdf",
              tmpFileUrl: "https://reports-service-dev-riskalyze-storage.s3-us-east-2.amazonaws.com/tmp/11a1d3e93aba92fcf7dfe5c64ed87275ed034ee8/489613895/statsOverviewReport/Portfolio-Stats-Overview-July-27-2023-19:26:13.json",
              options: {
                coreApiUrl: "https://mrobinette-api.dev.n7.run",
                pusherChannelName: "mrobinetteprivate-printing-932251521"
              }
            },
          },
        }
        const params = {
          // Remove DelaySeconds parameter and value for FIFO queues
          DelaySeconds: 10,
          MessageAttributes: {},
          MessageBody: JSON.stringify(message),
          QueueUrl: "https://sqs.us-east-2.amazonaws.com/263955829476/html-to-pdf-generator-dev-queue"
        };
        console.log(params);
        await sqs.sendMessage(params, function(err, data) {
          console.log("sending message")
          if (err) {
            console.log("Error", err);
          } else {
            console.log("Success", data.MessageId);
          }
        }).promise();

      } catch (err) {
        console.error(err);
      }
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: "Success"
    };
  };