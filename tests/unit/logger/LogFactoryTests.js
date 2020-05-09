const sinon = require("sinon"),
      { expect } = require("chai"),
      { LogFactory, BasicLogger } = require("../../../lib/logger");

describe("LogFactory", () => {

  describe("#init()", () => {

    it("should call log adapter", () => {
      const adaptFake = sinon.fake(() => {});
      LogFactory.init({}, { adapt: adaptFake }, {});
      expect(true).to.equal(adaptFake.calledOnce);
    })

    it("should create BasicLogger instance", () => {
      const adaptFake = sinon.fake(() => {});

      LogFactory.init({}, { adapt: adaptFake }, {});

      const logger = LogFactory.getLogger("ClassName");

      expect(true).to.equal(adaptFake.calledOnce);
      expect(logger).to.be.instanceOf(BasicLogger);
    })

  })

})