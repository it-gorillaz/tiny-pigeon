'use strict';

const moment = require("moment-timezone"),
      _ = require("lodash");

class AbstractDynamoDB {

  constructor(table, dynamodb) {
    this.table = table;
    this.dynamodb = dynamodb;
  }

  async insert(entity) {
    const params = { TableName: this.table, Item: this.normalizeItem(entity) };
    await this.dynamodb.put(params).promise();
    return entity;
  }

  async update(entity) {
    const attrs = this.toAttributeUpdate(entity);
    const params = {
      TableName: this.table,
      Key: { id: entity.id },
      AttributeUpdates: this.skipNullAttributes(attrs)
    };
    await this.dynamodb.update(params).promise();
    return entity;
  }

  async delete(entity) {
    const params = { TableName: this.table, Key: { id: entity.id } };
    await this.dynamodb.delete(params).promise();
  }

  async findById(id) {
    const params = { TableName: this.table, Key: { id: id } };
    return await this.dynamodb
      .get(params)
      .promise()
      .then((result) => result.Item);
  }

  async findAll() {
    let items = [];
    let scanOutput = {};
    let params = { TableName: this.table };
    do {
      if (scanOutput.LastEvaluatedKey) {
        params.ExclusiveStartKey = scanOutput.LastEvaluatedKey;
      }
      scanOutput = await this.dynamodb.scan(params).promise();
      items = items.concat(scanOutput.Items);
    } while (scanOutput.LastEvaluatedKey);
    return items;
  }

  async batchFindById(ids) {
    const tableName = this.table;
    const keys = ids.map((id) => { return { id: id } });
    const params = {
      RequestItems: {
        [tableName]: { Keys: keys, ConsistentRead: false }
      },
      ReturnConsumedCapacity: 'NONE'
    };
    return await this.dynamodb
      .batchGet(params)
      .promise()
      .then((result) => result.Responses[tableName]);
  }

  async batchInsert(entities) {
    const normalizeItem = this.normalizeItem;
    const mapper = (entity) => { return { PutRequest: { Item: normalizeItem(entity) } } };
    const items = entities.map(mapper);
    const params = { RequestItems: { [this.table]: items } };
    await this.dynamodb.batchWrite(params).promise();
    return entities;
  }

  skipNullAttributes(attributes) {
    return _.omitBy(attributes, (attr) => _.isNull(attr.Value));
  }

  normalizeItem(entity) {
    const normalize = (result, value, key) => {
      if (value instanceof Date) {
        value = moment(value).format();
      }
      result[key] = value;
      return result;
    }
    return _.transform(entity, normalize);
  }

  toAttributeUpdate(entity) {
    const normalize = (result, value, key) => {
      if (key !== 'id') {
        if (value instanceof Date) {
          value = moment(value).format();
        }
        result[key] = { Action: 'PUT', Value: value };
      }
      return result;
    }
    return _.transform(entity, normalize);
  }

}

module.exports = AbstractDynamoDB;