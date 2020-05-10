'use strict';

const AWS = require("aws-sdk"),
      bluebird = require("bluebird"),
      moment = require("moment-timezone"),
      { LogFactory } = require("../logger");

class DefaultEventHandler {

  constructor(eventType, modules) {
    this.eventType = eventType;
    this.modules = modules;
  }
  
  async handleEvent(event) {
    const { config, logAdapters, handlers } = this.modules;

    AWS.config.setPromisesDependency(bluebird);
    AWS.config.update({ region: config.REGION });

    moment.tz.setDefault(config.TIMEZONE);
    moment.defaultFormat = config.DATE_TIME_FORMAT;

    const logAdapter = logAdapters[this.eventType];
    LogFactory.init(event, logAdapter, { fields: config.REDACT });

    const logger = LogFactory.getLogger(`[${DefaultEventHandler.name}]`);
    const handler = handlers[this.eventType]();

    logger.info({ message: "Delegating new event to handler", data: {
      config: config,
      eventType: this.eventType,
      event: event
    }});

    await handler.handleEvent(event);

    return { message: "Task completed" };
  }

}

module.exports = DefaultEventHandler;