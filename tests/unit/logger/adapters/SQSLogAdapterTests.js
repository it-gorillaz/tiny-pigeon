const { expect } = require("chai"),
      { SQSEventAdapter } = require("../../../../lib/handlers"),
      { SQSLogAdapter } = require("../../../../lib/logger");

describe("SQSLogAdapter", () => {

  describe("#adapt()", () => {

    it("should adapt sqs attributes", () => {
      const event = {
        "Records": [
          {
            "messageId": "1234567890",
            "receiptHandle": "abcde",
            "body": "{\"client\":\"app-client-test\"}",
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

      const { Records: [record] } = event;
      const expected = {
        level: null,
        name: null,
        payload: null,
        client: "app-client-test",
        messageId: record.messageId,
        approximateReceiveCount: record.attributes.ApproximateReceiveCount,
        sentTimestamp: record.attributes.SentTimestamp,
        senderId: record.attributes.SenderId,
        approximateFirstReceiveTimestamp: record.attributes.ApproximateFirstReceiveTimestamp,
        messageAttributes: record.messageAttributes,
        md5OfBody: record.md5OfBody,
        eventSource: record.eventSource,
        eventSourceARN: record.eventSourceARN,
        awsRegion: record.awsRegion,
        time: null
      };

      new SQSEventAdapter().adapt(event);
      const body = new SQSLogAdapter().adapt(event);

      expect(expected).to.deep.include(body);

    })

  })

})