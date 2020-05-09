'use strict';

const Joi = require("@hapi/joi"),
      UseCaseStatus = require("./UseCaseStatus");

const VALIDATION_SETTINGS = {
  abortEarly: false,
  convert: true,
  allowUnknown: false
}

class BlacklistEmailUseCase {

  constructor(repository) {
    this.repository = repository;
  }

  async execute(request) {
    
    const { error } = this.rules().validate(request, VALIDATION_SETTINGS);
    if (error) {
      return {
        failed: true,
        status: UseCaseStatus.CONSTRAINTS_VIOLATED,
        error: error.details
      }
    }

    const bounces = [];
    for (let bounce of request.bounces) {
      bounces.push({
        id: bounce.email,
        action: bounce.action,
        reason: bounce.reason,
        statusCode: bounce.statusCode,
        createdAt: new Date()
      })
    }

    await this.repository.batchInsert(bounces);
    
    return {
      failed: false,
      status: UseCaseStatus.OK,
      data: bounces
    }

  }

  rules() {
    return Joi.object({
      bounces: Joi.array().items(Joi.object({
        email: Joi.string().email().required(),
        action: Joi.string().required(),
        reason: Joi.string().required(),
        statusCode: Joi.string().required()
      })).required()
    });
  }

}

module.exports = BlacklistEmailUseCase;