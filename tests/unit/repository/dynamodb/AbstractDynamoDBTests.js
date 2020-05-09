const AWS = require("aws-sdk"),
      AWSMock = require("aws-sdk-mock"),
      sinon = require("sinon"),
      { expect } = require("chai"),
      { AbstractDynamoDB } = require("../../../../lib/repository/dynamodb");

describe("AbstractDynamoDB", () => {

  class DummyRepository extends AbstractDynamoDB {
    constructor(dynamodb) {
      super("dummy_table", dynamodb);
    }
  }

  beforeEach(() => { AWSMock.setSDKInstance(AWS) });

  afterEach(() => { AWSMock.restore() })

  describe("#insert()", () => {

    it("should insert entity", async() => {
      const entity = { id: "12345" };

      const put = sinon.fake(() => new Promise((resolve) => resolve(entity)));
      AWSMock.mock("DynamoDB.DocumentClient", "put", put);

      const repository = new DummyRepository(new AWS.DynamoDB.DocumentClient());
      const response = await repository.insert(entity);

      expect(true).to.equal(put.calledOnce);
      expect(entity).to.deep.include(response);
    })

  })

  describe("#update()", () => {

    it("should update entity", async() => {
      const entity = { id: "12345" };

      const update = sinon.fake(() => new Promise((resolve) => resolve(entity)));
      AWSMock.mock("DynamoDB.DocumentClient", "update", update);

      const repository = new DummyRepository(new AWS.DynamoDB.DocumentClient());
      const response = await repository.update(entity);

      expect(true).to.equal(update.calledOnce);
      expect(entity).to.deep.include(response);
    })

  })

  describe("#delete()", () => {

    it("should delete entity", async() => {
      const entity = { id: "12345" };

      const deleteFake = sinon.fake(() => new Promise((resolve) => resolve(entity)));
      AWSMock.mock("DynamoDB.DocumentClient", "delete", deleteFake);


      const repository = new DummyRepository(new AWS.DynamoDB.DocumentClient());
      await repository.delete(entity);

      expect(true).to.equal(deleteFake.calledOnce);
    })

  })

  describe("#findById()", () => {

    it("should return entity by id", async() => {
      const entity = { id: "12345" };

      const findById = sinon.fake(() => new Promise((resolve) => resolve({Item: entity})));
      AWSMock.mock("DynamoDB.DocumentClient", "get", findById);

      const repository = new DummyRepository(new AWS.DynamoDB.DocumentClient());
      const response = await repository.findById(entity.id);

      expect(true).to.equal(findById.calledOnce);
      expect(entity).to.deep.include(response);
    })

  })

  describe("#findAll()", () => {

    it("should return all", async() => {
      const entity = { id: "12345" };

      const scan = sinon.fake(() => new Promise((resolve) => resolve({Items: [entity]})));
      AWSMock.mock("DynamoDB.DocumentClient", "scan", scan);

      const repository = new DummyRepository(new AWS.DynamoDB.DocumentClient());
      const response = await repository.findAll();

      expect(true).to.equal(scan.calledOnce);
      expect(entity).to.deep.include(response[0]);
    })

  })

  describe("#batchFindById()", () => {

    it("should return by id list", async() => {
      const entities = [{ id: "12345" }, { id: "abcde" }];

      const dynamodbResponse = {
        Responses: {
          "dummy_table": entities
        }
      };
      const batchGet = sinon.fake(() => new Promise((resolve) => resolve(dynamodbResponse)));
      AWSMock.mock("DynamoDB.DocumentClient", "batchGet", batchGet);

      const repository = new DummyRepository(new AWS.DynamoDB.DocumentClient());
      const response = await repository.batchFindById(["12345", "abcde"]);

      expect(true).to.equal(batchGet.calledOnce);
      expect(entities[0]).to.deep.include(response[0]);
      expect(entities[1]).to.deep.include(response[1]);
    })

  })

  describe("#batchInsert()", () => {

    it("should insert list of entities", async() => {
      const entities = [{ id: "12345" }, { id: "abcde" }];

      const batchWrite = sinon.fake(() => new Promise((resolve) => resolve(entities)));
      AWSMock.mock("DynamoDB.DocumentClient", "batchWrite", batchWrite);

      const repository = new DummyRepository(new AWS.DynamoDB.DocumentClient());
      const response = await repository.batchInsert(entities);

      expect(true).to.equal(batchWrite.calledOnce);
      expect(entities[0]).to.deep.include(response[0]);
      expect(entities[1]).to.deep.include(response[1]);
    })

  })

})