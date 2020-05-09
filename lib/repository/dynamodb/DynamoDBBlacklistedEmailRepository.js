'use strict';

const AbstractDynamoDB = require("./AbstractDynamoDB");

class DynamoDBBlacklistedEmailRepository extends AbstractDynamoDB {

  constructor(table, dynamodb) {
    super(table, dynamodb);
  }

}

module.exports = DynamoDBBlacklistedEmailRepository