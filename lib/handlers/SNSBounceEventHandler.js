'use strict';

const { LogFactory } = require("../logger");

class SNSBounceEventHandler {

  constructor(useCase) {
    this.useCase = useCase;
    this.logger = LogFactory.getLogger(`[${SNSBounceEventHandler.name}]`);
  }

  async handleEvent(event) {
    const { Records: [record] } = event;
    const { Sns: { Message } } = record;

    const payload = JSON.parse(Message);
    const { bounce: { bouncedRecipients }} = payload;

    const request = { bounces: [] };
    
    for (let recipient of bouncedRecipients) {
      request.bounces.push({
        email: recipient.emailAddress,
        action: recipient.action,
        statusCode: recipient.status,
        reason: recipient.diagnosticCode
      });
    }

    this.logger.info({ message: "Executing blacklist email use case", data: request });

    const result = await this.useCase.execute(request);

    this.logger.info({ message: "Use case completed", data: result });
  }

}

module.exports = SNSBounceEventHandler;