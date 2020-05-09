const sinon = require("sinon"),
      { expect } = require("chai"),
      { UseCaseStatus, BlacklistEmailUseCase } = require("../../../../lib/usecase/email");

describe("BlacklistEmailUseCase", () => {

  describe("#execute()", () => {

    it("should fail when constraints are violated", async() => {
      const fake = sinon.fake(() => {});
      const repository = { batchInsert: fake };
      const useCase = new BlacklistEmailUseCase(repository);

      const request = {
        bounces: [
          {
            email: "invalid",
            action: null,
            reason: null,
            statusCode: null
          }
        ]
      }

      const result = await useCase.execute(request);

      expect(true).to.be.equal(result.failed);
      expect(UseCaseStatus.CONSTRAINTS_VIOLATED).to.be.equal(result.status);
      expect(false).to.be.equal(fake.called)
    })

    it("should save bounced emails", async() => {
      const bounces = [{
        id: "any@email.com",
        action: "action",
        reason: "reason",
        statusCode: "statusCode",
        createdAt: new Date()
      }];

      const fake = sinon.fake(() => new Promise((resolve) => resolve(bounces)));
      const repository = { batchInsert: fake };
      
      const useCase = new BlacklistEmailUseCase(repository);

      const request = {
        bounces: [
          {
            email: "any@email.com",
            action: "action",
            reason: "reason",
            statusCode: "statusCode"
          }
        ]
      }

      const result = await useCase.execute(request);

      expect(false).to.equal(result.failed);
      expect(UseCaseStatus.OK).to.equal(result.status);
      expect(true).to.equal(fake.calledOnce);

    })

  })

})