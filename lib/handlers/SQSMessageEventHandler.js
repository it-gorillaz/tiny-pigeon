'use strict';

const { LogFactory } = require("../logger");

class SQSMessageEventHandler {

  constructor(useCase) {
    this.useCase = useCase;
    this.logger = LogFactory.getLogger(`[${SQSMessageEventHandler.name}]`);
  }

  async handleEvent(event) {
    const { Records: [record] } = event;
    const { body } = record;
    const payload = JSON.parse(body);

    const request = {
      client: payload.client,
      failOnBlacklistedEmail: payload.failOnBlacklistedEmail,
      emailType: payload.emailType,
      from: payload.from,
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      replyTo: payload.replyTo,
      subject: payload.subject,
      subjectParams: payload.subjectParams,
      body: payload.body,
      bodyParams: payload.bodyParams,
      htmlTemplateDir: payload.htmlTemplateDir,
      htmlTemplateFile: payload.htmlTemplateFile,
      attachments: payload.attachments
    };

    this.logger.info({ message: "Executing send email use case", data: request });

    const result = await this.useCase.execute(request);

    this.logger.info({ message: "Use case completed", data: result });
  }

}

module.exports = SQSMessageEventHandler;