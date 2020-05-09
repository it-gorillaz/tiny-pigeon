'use strict';

class SESEmailGateway {

  constructor(ses, transporter) {
    this.mailer = transporter.createTransport({SES: ses});
  }

  async sendEmail(email) {
    const { messageId } = await this.mailer.sendMail(email);
    return { messageId: messageId };
  }

}

module.exports = SESEmailGateway;