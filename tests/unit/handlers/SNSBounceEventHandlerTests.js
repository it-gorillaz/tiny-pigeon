const sinon = require("sinon"),
      { expect } = require("chai"),
      { SNSBounceEventHandler, SNSEventAdapter } = require("../../../lib/handlers");

describe("SNSBounceEventHandler", () => {

  beforeEach(() => sinon.stub(console, "log") )

  afterEach(() => sinon.restore())

  describe("#handleEvent()", () => {

    it("should execute use case", async() => {
      const executeFake = sinon.fake(() => {});
      const handler = new SNSBounceEventHandler({ execute: executeFake });

      const event = {
        "Records": [
          {
            "EventSource": "aws:sns",
            "EventVersion": "1.0",
            "EventSubscriptionArn": "arn:aws:sns:eu-central-1:12345:ses-notification-euc1:1234567890",
            "Sns": {
              "Type": "Notification",
              "MessageId": "1234567890",
              "TopicArn": "arn:aws:sns:eu-central-1:12345:ses-notification-euc1",
              "Subject": null,
              "Message": "{\"notificationType\":\"Bounce\",\"bounce\":{\"bounceType\":\"Transient\",\"bounceSubType\":\"General\",\"bouncedRecipients\":[{\"emailAddress\":\"bounce-test$bounce-test-9042a195-20fc-4410-bead-8710ecd0b807.com\",\"action\":\"failed\",\"status\":\"4.4.7\",\"diagnosticCode\":\"smtp; 554 4.4.7 Message expired: unable to deliver in 840 minutes$<421 4.4.0 Unable to lookup DNS for bounce-test-9042a195-20fc-4410-bead-8710ecd0b807.com>\"}],\"timestamp\":\"2019-09-20T02:43:06.930Z\",\"feedbackId\":\"0102016d4c8d39fe-e793f082-625c$41d1-983e-9c67ae52c2c8-000000\",\"reportingMTA\":\"dsn; a4-3.smtp-out.eu-central-1.amazonses.com\"},\"mail\":{\"timestamp\":\"2019-09-19T12:42:33.000Z\",\"source\":\"any@email.com\",\"$ourceArn\":\"arn:aws:ses:eu-central-1:12345:identity/any@email.com\",\"sourceIp\":\"10.15.10.14\",\"sendingAccountId\":\"12345\",\"messageId\":\"1234567890\",\"destination\":[\"bounce-$est@bounce-test-9042a195-20fc-4410-bead-8710ecd0b807.com\"]}}",
              "Timestamp": "2019-09-20T02:43:06.966Z",
              "SignatureVersion": "1",
              "Signature": "test",
              "SigningCertUrl": "https://sns.eu-central-1.amazonaws.com/SimpleNotificationService-12345.pem",
              "UnsubscribeUrl": "https://sns.eu-central-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-central-1:12345:ses-notification-euc1:abcde",
              "MessageAttributes": {}
            }
          }
        ]
      }

      new SNSEventAdapter().adapt(event);
      await handler.handleEvent(event);

      expect(true).to.equal(executeFake.calledOnce);
    })

  })

})