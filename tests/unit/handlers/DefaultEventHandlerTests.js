const sinon = require("sinon"),
      { expect } = require("chai"),
      { DefaultEventHandler } = require("../../../lib/handlers"),
      { EventType } = require("../../../lib/model"),
      AWS = require("aws-sdk"),
      AWSMock = require("aws-sdk-mock");

describe("DefaultEventHandler", () => {                                                                                                                                         [29/1891]

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    sinon.stub(console, "log");
  });

  afterEach(() => {
    AWSMock.restore();
    sinon.restore();
  })

  describe("#handleEvent()", () => {

    it("should delegate event to SQSMessageEventHandler", async() => {
      const handleEventFake = sinon.fake(() => {});

      const modules = {
        config: {
          DATE_TIME_FORMAT: "YYYY-MM-DDTHH:mm:ss",
          REDACT: [],
          REGION: "eu-central-1",
          TIMEZONE: "Europe/Berlin",
          BLACKLISTED_EMAILS_TABLE: "blacklisted_emails"
        },

        logAdapters: {
          [EventType.SQS]: { adapt(event) { return {} } }
        },

        handlers: {
          [EventType.SQS]: () => { return { handleEvent: handleEventFake } }
        }
      };

      const handler = new DefaultEventHandler(EventType.SQS, modules);
      await handler.handleEvent({});

      expect(true).to.equal(handleEventFake.calledOnce);
    });

    it("should delegate event to SNSBounceEventHandler", async() => {
      const handleEventFake = sinon.fake(() => {});

      const modules = {
        config: {
          DATE_TIME_FORMAT: "YYYY-MM-DDTHH:mm:ss",
          REDACT: [],
          REGION: "eu-central-1",
          TIMEZONE: "Europe/Berlin",
          BLACKLISTED_EMAILS_TABLE: "blacklisted_emails"
        },

        logAdapters: {
          [EventType.SNS]: { adapt(event) { return {} } }
        },

        handlers: {
          [EventType.SNS]: () => { return { handleEvent: handleEventFake } }
        }
      };

      const handler = new DefaultEventHandler(EventType.SNS, modules);
      await handler.handleEvent({});

      expect(true).to.equal(handleEventFake.calledOnce);
    });

  })

});