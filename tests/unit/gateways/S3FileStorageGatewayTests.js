const AWS = require('aws-sdk'),
      AWSMock = require('aws-sdk-mock'),
      sinon = require('sinon'),
      { expect } = require('chai'),
      { S3FileStorageGateway } = require('../../../lib/gateways')

describe("S3FileStorageGateway", () => {

  beforeEach(() => { AWSMock.setSDKInstance(AWS) });

  afterEach(() => { AWSMock.restore() })

  describe("#exists()", () => {

    it("should return false when file not found", async() => {
      const fake = sinon.fake((_, callback) => callback(new Error()))
      AWSMock.mock('S3', 'headObject', fake);

      const fileStorageGateway = new S3FileStorageGateway(new AWS.S3());
      const exists = await fileStorageGateway.exists('anyDir', 'anyFile');

      expect(exists).to.be.equal(false);
      expect(true).to.be.equal(fake.calledOnce);
    });

    it("should return true when file exists", async() => {
      const fake = sinon.fake((_, callback) => callback(null, {}));
      AWSMock.mock('S3', 'headObject', fake)
      ;
      const fileStorageGateway = new S3FileStorageGateway(new AWS.S3());
      const exists = await fileStorageGateway.exists('anyDir', 'anyFile');

      expect(exists).to.equal(true);
      expect(true).to.be.equal(fake.calledOnce);
    });

  });

  describe("#getFileContents()", async() => {

    it("should return ArrayBuffer as file content", async() => {
      const body = { Body: new ArrayBuffer(8) };
      const fake = sinon.fake((_, callback) => callback(null, body));
      AWSMock.mock('S3', 'getObject', fake);

      const fileStorageGateway = new S3FileStorageGateway(new AWS.S3());
      const file = await fileStorageGateway.getFileContents('anyDir', 'anyFile');

      expect(file).to.instanceOf(ArrayBuffer);
      expect(true).to.be.equal(fake.calledOnce);
    });

  });

})