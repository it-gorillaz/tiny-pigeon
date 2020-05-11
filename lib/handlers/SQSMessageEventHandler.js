'use strict';

const { LogFactory } = require("../logger");

class SQSMessageEventHandler {

  constructor(useCase) {
    this.useCase = useCase;
    this.logger = LogFactory.getLogger(`[${SQSMessageEventHandler.name}]`);
  }

  async handleEvent(event) {
    const { Records: [{ body }] } = event;
    
    const request = {
      client: body.client,
      failOnBlacklistedEmail: body.failOnBlacklistedEmail,
      emailType: body.emailType,
      from: body.from,
      to: body.to,
      cc: body.cc,
      bcc: body.bcc,
      replyTo: body.replyTo,
      subject: body.subject,
      subjectParams: body.subjectParams,
      body: body.body,
      bodyParams: body.bodyParams,
      template: body.template,
      attachments: body.attachments
    };

    this.logger.info({ message: "Executing send email use case", data: request });

    return await this.useCase.execute(request);
  }

}

module.exports = SQSMessageEventHandler;