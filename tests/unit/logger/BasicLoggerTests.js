const sinon = require("sinon"),
      { expect } = require("chai"),
      { BasicLogger } = require("../../../lib/logger")

describe("BasicLogger", () => {

  afterEach(() => { sinon.restore() })

  describe("#info()", () => {
    it("should call console.log", () => {
      const logStub = sinon.stub(console, 'log');

      const mask = (body) => body;

      const logger = new BasicLogger("className", {}, mask);
      logger.info({ message: "test" });

      expect(true).to.equal(logStub.calledOnce);
    })
  })

  describe("#warn()", () => {
    it("should call console.warn", () => {
      const logStub = sinon.stub(console, 'warn');
      const mask = (body) => body;

      const logger = new BasicLogger("className", {}, mask);
      logger.warn({ message: "test" });

      expect(true).to.equal(logStub.calledOnce);
    })
  })

  describe("#error()", () => {
    it("should call console.error", () => {
      const logStub = sinon.stub(console, 'error');
      const mask = (body) => body;

      const logger = new BasicLogger("className", {}, mask);
      logger.error({ message: "test" });

      expect(true).to.equal(logStub.calledOnce);
    })
  })

  describe("#debug()", () => {
    it("should call console.debug", () => {
      const logStub = sinon.stub(console, 'debug');
      const mask = (body) => body;

      const logger = new BasicLogger("className", {}, mask);
      logger.debug({ message: "test" });

      expect(true).to.equal(logStub.calledOnce);
    })
  })

})