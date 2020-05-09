'use strict';

const Joi = require("@hapi/joi"),
      UseCaseStatus = require("./UseCaseStatus"),
      { EmailType } = require("../../model"),
      _ = require("lodash");

const VALIDATION_SETTINGS = {
  abortEarly: false,
  convert: true,
  allowUnknown: false
};

const transform = (body, attributes) => {
  const template = _.template(body);
  return template(attributes);
};

class SendEmailUseCase {

  constructor(repository, emailGateway, fileStorageGateway) {
    this.repository = repository;
    this.emailGateway = emailGateway;
    this.fileStorageGateway = fileStorageGateway;
  }

  async execute(request) {

    const { error } = this.rules().validate(request, VALIDATION_SETTINGS);
    if (error) {
      return {
        failed: true,
        status: UseCaseStatus.CONSTRAINTS_VIOLATED,
        error: error.details
      };
    }

    const { to, cc, bcc } = request;
    const emails = _.uniq(_.concat(to, cc || [], bcc || []));
    const blacklist = await this.repository
      .batchFindById(emails)
      .then((bounces) => bounces.map(e => e.id))

    if (request.failOnBlacklistedEmail && blacklist.length > 0) {
      return {
        failed: true,
        status: UseCaseStatus.FAILED_ON_BLACKLISTED_EMAIL,
        error: blacklist
      }
    }

    request.to = _.differenceWith(to, blacklist, _.isEqual);
    request.cc = _.differenceWith(cc, blacklist, _.isEqual);
    request.bcc = _.differenceWith(bcc, blacklist, _.isEqual);

    if (request.to.length === 0) {
      return {
        failed: true,
        status: UseCaseStatus.RECIPIENT_IS_BLACKLISTED,
        error: to
      }
    }

    const attachments = [];
    if (request.attachments) {
      for (let attachment of request.attachments) {
        const { attachmentDir, attachmentFile, attachAsFileName } = attachment;
        const exists = await this.fileStorageGateway.exists(attachmentDir, attachmentFile);
        if (!exists) {
          return {
            failed: true,
            status: UseCaseStatus.ATTACHMENT_NOT_FOUND,
            error: attachment
          }
        }
        const file = await this.fileStorageGateway.getFileContents(attachmentDir, attachmentFile);
        attachments.push({ content: file, filename: attachAsFileName || attachmentFile });
      }
    }

    if (EmailType.HTML_TEMPLATE_FILE === request.emailType) {
      const { htmlTemplateDir, htmlTemplateFile } = request;
      const exists = await this.fileStorageGateway.exists(htmlTemplateDir, htmlTemplateFile);
      if (!exists) {
        return {
          failed: true,
          status: UseCaseStatus.HTML_TEMPLATE_FILE_NOT_FOUND,
          error: { htmlTemplateDir: htmlTemplateDir, htmlTemplateFile: htmlTemplateFile }
        }
      }
      const file = await this.fileStorageGateway.getFileContents(htmlTemplateDir, htmlTemplateFile);
      request.body = new TextDecoder().decode(file);
    }

    const subject = transform(request.subject, request.subjectParams);
    const body = transform(request.body, request.bodyParams);
    const email = _.omitBy({
      from: request.from,
      sender: request.from,
      replyTo: request.replyTo,
      to: request.to,
      cc: request.cc,
      bcc: request.bcc,
      subject: subject,
      attachments: attachments,
      text: EmailType.RAW_TEXT === request.emailType
        ? body
        : null,
      html: EmailType.HTML_BODY === request.emailType || EmailType.HTML_TEMPLATE_FILE === request.emailType
        ? body
        : null
    }, _.isEmpty);

    const result = await this.emailGateway.sendEmail(email);

    return {
      failed: false,
      status: UseCaseStatus.OK,
      data: result
    };

  }

  rules() {
    return Joi.object({
      client:                 Joi.string().required(),
      failOnBlacklistedEmail: Joi.boolean().required(),
      from:                   Joi.string().email().required(),
      to:                     Joi.array().items(Joi.string().email()).required(),
      cc:                     Joi.array().items(Joi.string().email()),
      bcc:                    Joi.array().items(Joi.string().email()),
      replyTo:                Joi.string().email(),
      subject:                Joi.string().required(),
      subjectParams:          Joi.object(),
      bodyParams:             Joi.object(),
      emailType:              Joi.string()
                                .valid(EmailType.RAW_TEXT, EmailType.HTML_BODY, EmailType.HTML_TEMPLATE_FILE)
                                .required(),
      htmlTemplateDir:        Joi.string()
                                .when('emailType', { is: EmailType.HTML_TEMPLATE_FILE, then: Joi.string().required() }),
      htmlTemplateFile:       Joi.string()
                                .when('emailType', { is: EmailType.HTML_TEMPLATE_FILE, then: Joi.string().required() }),
      body:                   Joi.string()
                                .when('emailType', { is: EmailType.RAW_TEXT, then: Joi.string().required() })
                                .when('emailType', { is: EmailType.HTML_BODY, then: Joi.string().required() }),
      attachments:            Joi.array().items(Joi.object({
                                attachmentDir: Joi.string().required(),
                                attachmentFile: Joi.string().required(),
                                attachAsFileName: Joi.string()
                              }))
    });
  }

}

module.exports = SendEmailUseCase;