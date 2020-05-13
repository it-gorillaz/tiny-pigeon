const sinon = require("sinon"),
      { expect } = require("chai"),
      { EmailType } = require("../../../../lib/model"),
      { UseCaseStatus, SendEmailUseCase } = require("../../../../lib/usecase/email");

describe("SendEmailUseCase", () => {

  describe("#execute()", () => {

    it("should fail when contraints are violated", async() => {
      const batchFindById = sinon.fake(() => {});
      const sendEmail = sinon.fake(() => {});
      const exists = sinon.fake(() => {});
      const getFileContents = sinon.fake(() => {});

      const repository = { batchFindById: batchFindById };
      const emailGateway = { sendEmail: sendEmail };
      const fileStorageGateway = { exists: exists, getFileContents: getFileContents };

      const request = {
        client: null,
        failOnBlacklistedEmail: null,
        emailType: null,
        from: null,
        to: null,
        subject: null
      };

      const useCase = new SendEmailUseCase(repository, emailGateway, fileStorageGateway);
      const result = await useCase.execute(request);

      expect(true).to.equal(result.failed);
      expect(UseCaseStatus.CONSTRAINTS_VIOLATED).to.equal(result.status);
      expect(false).to.equal(batchFindById.called);
      expect(false).to.equal(sendEmail.called);
      expect(false).to.equal(exists.called);
      expect(false).to.equal(getFileContents.called);

    });

    it("should fail when email is blacklisted", async() => {
      const bounce = {
        id: "blacklisted@email.com",
        action: "",
        reason: "",
        statusCode: "",
        createdAt: new Date()
      };

      const batchFindById = sinon.fake(() => new Promise((resolve) => resolve([bounce])));
      const sendEmail = sinon.fake(() => {});
      const exists = sinon.fake(() => {});
      const getFileContents = sinon.fake(() => {});

      const repository = { batchFindById: batchFindById };
      const emailGateway = { sendEmail: sendEmail };
      const fileStorageGateway = { exists: exists, getFileContents: getFileContents };

      const request = {
        client: "any-client-service",
        failOnBlacklistedEmail: true,
        emailType: EmailType.RAW_TEXT,
        from: "any@email.com",
        to: ["blacklisted@email.com"],
        subject: {content:"should fail"},
        body: {content:"this will fail"}
      };

      const useCase = new SendEmailUseCase(repository, emailGateway, fileStorageGateway);
      const result = await useCase.execute(request);

      expect(true).to.equal(result.failed);
      expect(UseCaseStatus.FAILED_ON_BLACKLISTED_EMAIL).to.equal(result.status);
      expect(true).to.equal(batchFindById.calledOnce);
      expect(false).to.equal(sendEmail.called);
      expect(false).to.equal(exists.called);
      expect(false).to.equal(getFileContents.called);

    });

    it("should fail when recipient is blacklisted", async() => {
      const bounce = {
        id: "blacklisted@email.com",
        action: "",
        reason: "",
        statusCode: "",
        createdAt: new Date()
      };

      const batchFindById = sinon.fake(() => new Promise((resolve) => resolve([bounce])));
      const sendEmail = sinon.fake(() => {});
      const exists = sinon.fake(() => {});
      const getFileContents = sinon.fake(() => {});

      const repository = { batchFindById: batchFindById };
      const emailGateway = { sendEmail: sendEmail };
      const fileStorageGateway = { exists: exists, getFileContents: getFileContents };

      const request = {
        client: "any-client-service",
        failOnBlacklistedEmail: false,
        emailType: EmailType.RAW_TEXT,
        from: "any@email.com",
        to: ["blacklisted@email.com"],
        subject: {content:"should fail"},
        body: {content:"this will fail"}
      };

      const useCase = new SendEmailUseCase(repository, emailGateway, fileStorageGateway);
      const result = await useCase.execute(request);

      expect(true).to.equal(result.failed);
      expect(UseCaseStatus.RECIPIENT_IS_BLACKLISTED).to.equal(result.status);
      expect(true).to.equal(batchFindById.calledOnce);
      expect(false).to.equal(sendEmail.called);
      expect(false).to.equal(exists.called);
      expect(false).to.equal(getFileContents.called);

    });

    it("should fail when attachment is not found", async() => {
      const batchFindById = sinon.fake(() => new Promise((resolve) => resolve([])));
      const sendEmail = sinon.fake(() => {});
      const exists = sinon.fake(() => new Promise((resolve) => resolve(false)));
      const getFileContents = sinon.fake(() => {});

      const repository = { batchFindById: batchFindById };
      const emailGateway = { sendEmail: sendEmail };
      const fileStorageGateway = { exists: exists, getFileContents: getFileContents };

      const request = {
        client: "any-client-service",
        failOnBlacklistedEmail: false,
        emailType: EmailType.RAW_TEXT,
        from: "any@email.com",
        to: ["any@email.com"],
        subject: {content:"should fail"},
        body: {content:"this will fail"},
        attachments: [
          {
            dir: "any",
            file: "any"
          }
        ]
      };

      const useCase = new SendEmailUseCase(repository, emailGateway, fileStorageGateway);
      const result = await useCase.execute(request);

      expect(true).to.equal(result.failed);
      expect(UseCaseStatus.ATTACHMENT_NOT_FOUND).to.equal(result.status);
      expect(true).to.equal(batchFindById.calledOnce);
      expect(true).to.equal(exists.calledOnce);
      expect(false).to.equal(getFileContents.called);
      expect(false).to.equal(sendEmail.called);
      expect(request.attachments[0]).to.deep.include(result.error);

    });

    it("should fail when html template is not found", async() => {
      const batchFindById = sinon.fake(() => new Promise((resolve) => resolve([])));
      const sendEmail = sinon.fake(() => {});
      const exists = sinon.fake(() => new Promise((resolve) => resolve(false)));
      const getFileContents = sinon.fake(() => {});

      const repository = { batchFindById: batchFindById };
      const emailGateway = { sendEmail: sendEmail };
      const fileStorageGateway = { exists: exists, getFileContents: getFileContents };

      const request = {
        client: "any-client-service",
        failOnBlacklistedEmail: false,
        emailType: EmailType.HTML_TEMPLATE_FILE,
        from: "any@email.com",
        to: ["any@email.com"],
        subject: {content:"should fail"},
        body: {content:"this will fail"},
        template: { dir: "any", file: "any" }
      };

      const useCase = new SendEmailUseCase(repository, emailGateway, fileStorageGateway);
      const result = await useCase.execute(request);

      expect(true).to.equal(result.failed);
      expect(UseCaseStatus.HTML_TEMPLATE_FILE_NOT_FOUND).to.equal(result.status);
      expect(true).to.equal(batchFindById.calledOnce);
      expect(true).to.equal(exists.calledOnce);
      expect(false).to.equal(getFileContents.called);
      expect(false).to.equal(sendEmail.called);
      expect({ template: request.template }).to.deep.include(result.error);

    });

    it("should send email", async() => {
      const batchFindById = sinon.fake(() => new Promise((resolve) => resolve([])));
      const sendEmail = sinon.fake(() => new Promise((resolve) => resolve({ messageId: "12345" })));
      const exists = sinon.fake(() => new Promise((resolve) => resolve(true)));
      const getFileContents = sinon.fake(() => 
        new Promise((resolve) => resolve( new TextEncoder().encode("body") )));

      const repository = { batchFindById: batchFindById };
      const emailGateway = { sendEmail: sendEmail };
      const fileStorageGateway = { exists: exists, getFileContents: getFileContents };

      const request = {
        client: "any-client-service",
        failOnBlacklistedEmail: false,
        emailType: EmailType.HTML_TEMPLATE_FILE,
        from: "any@email.com",
        to: ["any@email.com"],
        subject: {content:"should be ${status}", params:{status: "OK"}},
        body: {content: "Hi, Mr ${model.lastName}", params: {model: {lastName: "Doe"}}},
        template: { dir: "any", file: "any" },
        attachments: [{ dir: "any", file: "any" }]
      };

      const useCase = new SendEmailUseCase(repository, emailGateway, fileStorageGateway);
      const result = await useCase.execute(request);

      expect(false).to.equal(result.failed);
      expect(UseCaseStatus.OK).to.equal(result.status);
      expect(true).to.equal(batchFindById.calledOnce);
      expect(true).to.equal(exists.calledTwice);
      expect(true).to.equal(getFileContents.calledTwice);
      expect(true).to.equal(sendEmail.calledOnce);
      expect({ messageId: "12345" }).to.deep.include(result.data);

    });

  });

})