const AWS = require('aws-sdk'),
      AWSMock = require('aws-sdk-mock'),
      sinon = require('sinon'),
      { expect } = require('chai'),
      { SESEmailGateway } = require('../../../lib/gateways')

describe("SESEmailGateway", () => {

  beforeEach(() => { AWSMock.setSDKInstance(AWS) });

  afterEach(() => { AWSMock.restore() })

  describe("#sendEmail()", () => {

    it("should return messageId", async() => {
      const messageId = "123456";

      const sendMailFake = sinon.fake(() => { 
        return { messageId: messageId };
      });

      const createTransportFake = sinon.fake(() => { 
        return { sendMail: sendMailFake };
      });

      const emailGateway = new SESEmailGateway(new AWS.SES(), { createTransport: createTransportFake });

      const response = await emailGateway.sendEmail({
        from: "any@email.com",
        to: ["any@email.com"],
        replyTo: "any@email.com",
        sender: "any@email.com",
        subject: "any subject"
      });

      expect(true).to.be.equal(createTransportFake.calledOnce);
      expect(true).to.be.equal(sendMailFake.calledOnce);
      expect(response).to.deep.include({ messageId: messageId });
    })

  })

})