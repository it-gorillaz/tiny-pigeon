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

    try {

      const { config, logAdapters, eventAdapters, handlers } = this.modules;

      AWS.config.setPromisesDependency(bluebird);
      AWS.config.update({ region: config.REGION });

      moment.tz.setDefault(config.TIMEZONE);
      moment.defaultFormat = config.DATE_TIME_FORMAT;

      const eventAdapter = eventAdapters[this.eventType];
      eventAdapter.adapt(event);

      const logAdapter = logAdapters[this.eventType];
      LogFactory.init(event, logAdapter, { fields: config.REDACT });

      const logger = LogFactory.getLogger(`[${DefaultEventHandler.name}]`);
      const handler = handlers[this.eventType]();

      logger.info({ message: "Delegating new event to handler", data: {
        config: config,
        eventType: this.eventType,
        event: event
      }});

      const result = await handler.handleEvent(event);

      logger.info({ message: "Task completed", data: result });

    } catch (e) {
      console.error(e);
    }

    return { message: "Task completed" };

  }

}

module.exports = DefaultEventHandler;