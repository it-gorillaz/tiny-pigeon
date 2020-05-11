const { expect } = require("chai"),
      { SQSEventAdapter } = require("../../../../lib/handlers");

describe("SQSEventAdapter", () => {
  
  describe("#adapt()", () => {

    it("should parse message body", () => {
      const event = {
        "Records": [
          {
            "messageId": "1234567890",
            "receiptHandle": "abcde",
            "body": "{\"failOnBlacklistedEmail\":true,\"client\":\"my-client-service\",\"emailType\":\"RAW_TEXT\",\"from\":\"any@email.com\",\"to\":[\"any@email.com\"],\"replyTo\":[\"any@email\"],\"subject\":\"title\",\"body\":\"content\"}",
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

      const adapter = new SQSEventAdapter();
      adapter.adapt(event);

      expect(event.Records[0].body).to.be.instanceOf(Object);
    })
      
  })

})