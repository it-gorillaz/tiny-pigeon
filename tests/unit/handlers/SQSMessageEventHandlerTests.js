const sinon = require("sinon"),
      { expect } = require("chai"),
      { SQSMessageEventHandler, SQSEventAdapter } = require("../../../lib/handlers");

describe("SQSMessageEventHandler", () => {

  beforeEach(() => { sinon.stub(console, "log") })

  afterEach(() => { sinon.restore() })

  describe("#handleEvent()", () => {

    it("should execute use case", async() => {
      const executeFake = sinon.fake(() => {});
      const handler = new SQSMessageEventHandler({ execute: executeFake });

      const event = {
        "Records": [
          {
            "messageId": "1234567890",
            "receiptHandle": "abcde",
            "body": "{\"failOnBlacklistedEmail\":true,\"client\":\"my-client-service\",\"emailType\":\"RAW_TEXT\",\"from\":\"any@email.com\",\"to\":[\"any@email.com\"],\"replyTo\":\"any@email\",\"subject\":{\"content\":\"title\"},\"body\":{\"content\":\"content\"}}",
            "attributes": {
              "ApproximateReceiveCount": "1",
              "SentTimestamp": "1568708487072",
              "SenderId": "abcde",
              "ApproximateFirstReceiveTimestamp": "1568708487078"
            },
            "messageAttributes": {},
            "md5OfBody": "abcd",
            "eventSource": "aws:sqs",
            "eventSourceARN": "arn:aws:sqs:eu-central-1:12345:any-queue-name",
            "awsRegion": "eu-central-1"
          }
        ]
      }

      new SQSEventAdapter().adapt(event);
      await handler.handleEvent(event);

      expect(true).to.equal(executeFake.calledOnce);
    })

  })

})