'use strict';

const moment = require('moment-timezone'),
      LEVEL = require('./LogLevel');

const log = (level, message, settings, output) => {
  const { name, body, mask } = settings;
  body.level = level;
  body.name = name;
  body.payload = message;
  body.time = moment().format();
  const json = mask(body);
  output(JSON.stringify(json));
}

class BasicLogger {

  constructor(name, body, mask) {
    this.settings = {
      name: name,
      body: body,
      mask: mask
    };
  }

  info(message) {
    log(LEVEL.INFO, message, this.settings, console.log);
  }

  warn(message) {
    log(LEVEL.WARN, message, this.settings, console.warn);
  }

  error(message) {
    log(LEVEL.ERROR, message, this.settings, console.error);
  }

  debug(message) {
    log(LEVEL.DEBUG, message, this.settings, console.debug);
  }

}

module.exports = BasicLogger;