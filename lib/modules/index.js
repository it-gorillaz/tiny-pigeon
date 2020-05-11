'use strict';

const AWS = require("aws-sdk"),
      nodemailer = require("nodemailer"),
      { EventType } = require("../model"),      
      { BlacklistEmailUseCase, SendEmailUseCase } = require("../usecase/email"),
      { S3FileStorageGateway, SESEmailGateway } = require("../gateways"),
      { DynamoDBBlacklistedEmailRepository } = require("../repository/dynamodb"),
      { SNSLogAdapter, SQSLogAdapter } = require("../logger"),
      { 
        SNSBounceEventHandler, 
        SQSMessageEventHandler, 
        SNSEventAdapter, 
        SQSEventAdapter 
      } = require("../handlers");

const config = {
  REGION:                   process.env.REGION || "us-east-1",
  DATE_TIME_FORMAT:         process.env.DATE_TIME_FORMAT || "YYYY-MM-DDTHH:mm:ss",
  TIMEZONE:                 process.env.TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone,
  REDACT:                   process.env.REDACT ? process.env.REDACT.split(",") : [],
  BLACKLISTED_EMAILS_TABLE: process.env.BLACKLISTED_EMAILS_TABLE || "blacklisted_emails"
}

module.exports = {

  config: config,

  logAdapters: {
    [EventType.SNS]: new SNSLogAdapter(),
    [EventType.SQS]: new SQSLogAdapter()
  },

  eventAdapters: {
    [EventType.SNS]: new SNSEventAdapter(),
    [EventType.SQS]: new SQSEventAdapter()
  },

  handlers: {

    [EventType.SNS]: () => new SNSBounceEventHandler(
      new BlacklistEmailUseCase(
        new DynamoDBBlacklistedEmailRepository(
          config.BLACKLISTED_EMAILS_TABLE, new AWS.DynamoDB.DocumentClient()
        )
      )
    ),

    [EventType.SQS]: () => new SQSMessageEventHandler(
      new SendEmailUseCase(
        new DynamoDBBlacklistedEmailRepository(config.BLACKLISTED_EMAILS_TABLE, new AWS.DynamoDB.DocumentClient()),
        new SESEmailGateway(new AWS.SES(), nodemailer),
        new S3FileStorageGateway(new AWS.S3())
      )
    )

  }

}