# tiny-pigeon

Simple Serverless Email Service

# Table of Contents
1. [About](#about)
2. [Architectural Overview](#architectural-overview)
3. [Deployment](#deployment)    
4. [Service Integration](#service-integration)
5. [Email Service](#consuming-the-service)
    1. [Consuming the Service](consuming-the-service)
    2. [Working with Parameterized Attributes](#working-with-parameterized-attributes)
    3. [Working with HTML Template Files](#working-with-html-template-files)
    4. [Working with Attachments](#working-with-attachments)
6. [License](#license)

## About

**tiny-pigeon** is a simple serverless email service that runs on top of the AWS Serverless Stack(AWS Lambda, DynamoDB, S3, SQS, SNS and SES).

It aims to simplify the flow of sending emails ,handling bounces and monitoring.

The service was not designed to handle complex workflows, but rather centralize and offer a simple interface for integration between multiple applications that require sending emails.


## Architectural Overview

![Architecture Diagram](/docs/architecture_diagram.jpg)

## Deployment

This project makes use of the [Serverless Framework](https://www.serverless.com/) to manage the deployment. Before you continue, make sure you have the [serverless framework CLI](https://www.serverless.com/framework/docs/getting-started/) installed.


**Before you begin**: It is recommended to review the **iamRoleStatements** under the **provider** section in the serverless.yml file and adapt accordingly to define fine grained access control to your resources:

```
iamRoleStatements:
  -
    Effect: Allow
    Action:
      - 's3:HeadObject'
      - 's3:GetObject'
    Resource:
      - 'arn:aws:s3:::*/*'
  -
    Effect: Allow
    Action:
      - 'dynamodb:BatchGetItem'
      - 'dynamodb:BatchWriteItem'
    Resource:
      - !GetAtt [BlacklistedEmailsDynamoDBTable, Arn]
  -
    Effect: Allow
    Action:
      - 'ses:SendRawEmail'
    Resource:
      - 'arn:aws:ses:*:*:identity/*'
```

If you want to deploy the artifacts in a specific S3 bucket, first is necessary to create a bucket.


E.g.:
```
aws s3api create-bucket --bucket tiny-pigeon-email-service-deployment-artifacts --region us-east-1
```

Once you have the name of the desired S3 bucket, change the attribute **deploymentBucket** in the serverless.yml file under the **custom** section:
```
custom:
  deploymentBucket: 'tiny-pigeon-email-service-deployment-artifacts
```

If you don't want to specify a deployment bucket, just remove the **deploymentBucket** attribute under the **provider** section:
```
deploymentBucket:
  name: ${self:custom.deploymentBucket}
  blockPublicAccess: true
```

After the initial setup you can run the following command to deploy the service with the default settings:
```
npm install --production
serverless deploy --stage prod
```

You can customize the default settings of the deployment by changing the values of the attributes under the **custom** section in the serverless.yml file:

```
custom:
  deploymentBucket: 'tiny-pigeon-email-service-deployment-artifacts'
  dateTimeFormat: 'YYYY-MM-DDTHH:mm:ss'
  timezone: 'Europe/Berlin'
  redact: 'username,password,credentials,secret'
  blacklistedEmailsTable:
    dev: 'blacklisted_emails_dev'
    prod: 'blacklisted_emails'
  emailQueueName:
    dev: 'email-queue-dev'
    prod: 'email-queue'
  emailBouncesTopicName:
    dev: 'email-bounces-topic-dev'
    prod: 'email-bounces-topic'
```

#### deploymentBucket
A specific S3 bucket name to deploy the artifacts.

#### dateTimeFormat
The date and time format to be used by the application(Logs and Items saved to the database).

#### redact
A string separated by commas of all the attributes that should be redacted in the logs

#### blacklistedEmailsTable
The name of table to save bounces/blacklisted emails.

#### emailQueueName
The name of the SQS queue.

#### emailBouncesTopicName
The name of the SNS topic.

## Service Integration

The service will process SQS messages with the following JSON body:

```
{
  "client": "my-application-client-name",
  "emailType": "RAW_TEXT|HTML_BODY|HTML_TEMPLATE_FILE",
  "failOnBlacklistedEmail": true|false,
  "from": "email@email.com",
  "to": ["email1@email.com", "email2@email.com"],
  "cc": ["email1@email.com", "email2@email.com"],
  "bcc": ["email1@email.com", "email2@email.com"],
  "replyTo": "email@email.com",
  "subject": "my subject",
  "subjectParams": {
    "foo": "bar"
  },
  "body": "my email body",
  "bodyParams": {
    "foo": "bar"
  },
  "htmlTemplateDir": "/my/template/dir/",
  "htmlTemplateFile": "my-template.html",
  "attachments": [
    {
      "attachmentDir": "/my/attachment/dir/",
      "attachmentFile": "attachment.jpg",
      "attachAsFileName": "image.jpg"
    }
  ]
}

```

#### client ```string``` (Required) 

The application name that is requesting to send an email.

#### emailType ```string``` (Required) 
Supported types: ```RAW_TEXT```, ```HTML_BODY``` and ```HTML_TEMPLATE_FILE```.

#### failOnBlacklistedEmail ```boolean``` (Required)
Indicates if the operation should fail if at least one email is blacklisted.

By default, the service removes any email found in the blacklist before sending.

Note that the operation will fail if the recipient(**to** attribute) is blacklisted.

#### from ```string``` (Required)
Email address of the sender.

#### to ```[string]``` (Required)
One or more email address of the recipient(s).

#### cc ```[string]```
One or more email address for the carbon copy.

#### bcc ```[string]```
One or more email address for the blind carbon copy.

#### replyTo ```string``` (Required)
Email address to reply the message.

#### subject ```string``` (Required)
The email subject.

#### subjectParams ```object```
An object containing the attributes to be replaced in the subject text.

#### body ```string``` (Required if **emailType** is ```RAW_TEXT``` or ```HTML_BODY```)
The content of the email

#### bodyParams ```object```
An object containing the attributes to be replaced in the email body.

#### htmlTemplateDir ```string``` (Required if **emailType** is ```HTML_TEMPLATE_FILE```)
The directory of the html template file.

#### htmlTemplateFile ```string``` (Required if **emailType** is ```HTML_TEMPLATE_FILE```)
The name of the html template file.

#### attachments ```[object]```
An array of objects specifying the files that should be attached to the email.

#### attachments[index].attachmentDir ```string``` (Required)
The directory of the file.

#### attachments[index].attachmentFile ```string``` (Required)
The name of the file.

#### attachments[index].attachAsFileName ```string```
The name of the attachment on the email.

## Consuming the Service

Example of how to send an email(Node.js):

```
const AWS = require('aws-sdk'),
      bluebird = require('bluebird');

AWS.config.setPromisesDependency(bluebird);
AWS.config.update({region: 'eu-central-1'});

const SQS_URL = 'https://sqs.us-east-1.amazonaws.com/1234/email-queue';
const sqs = new AWS.SQS();

const sendEmail = async(body) => {
  const params = {
    MessageBody: JSON.stringify(body),
    QueueUrl: SQS_URL
  };
  return await sqs
    .sendMessage(params)
    .promise();
}

const email = {
  client: "my-awesome-service",
  emailType: "RAW_TEXT",
  failOnBlacklistedEmail: true,
  from: "email@email.com",
  to: ["email@email.com"],
  replyTo: "no-reply@email.com",
  subject: "Awesome Email",
  body: "This is an awesome email!"
};

sendEmail(email)
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
```

## Working with Parameterized Attributes

The service will transform the content of the **subject** and the **body** based on the attributes **subjectParams** and **bodyParams**:
```
{
  ...
  "subject": "Invoice ID: ${model.invoiceId}",
  "subjectParams": {
    "model": {
      "invoiceId": "1234"
    }
  },
  "body": "Hello, Mr. ${model.lastName}",
  "bodyParams": {
    "model": {
      "lastName": "Doe"
    }
  }
}
```

## Working with HTML Template Files

The current version of the service supports working with HTML template files stored on S3.
The content of the html file will be transformed using the **bodyParams** attributes and it will be sent as email body.

```
{
  ...
  "emailType": "HTML_TEMPLATE_FILE",
  "htmlTemplateDir": "my-bucket-name",
  "htmlTemplateFile": "path/to/file.html"
}
```

## Working with Attachments

The current version of the service supports attaching files stored on S3.

```
{
  ...
  "attachments": [
    {
      "attachmentDir": "my-bucket-name",
      "attachmentFile": "attachment.jpg",
      "attachAsFileName": "image.jpg"
    }
  ]
}

```

## License

This service is licensed under the [MIT License](./LICENSE.txt).

All files located in the node_modules and external directories are externally maintained libraries used by this software which have their own licenses; we recommend you read them, as their terms may differ from the terms in the MIT License.