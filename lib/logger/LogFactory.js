'use strict';

const maskJson = require("mask-json"),
      BasicLogger = require("./BasicLogger");

const DEFAULT_MASK_CONFIG = {
  ignoreCase: false,
  replacement: "[REDACTED]"
}

class LogFactory {

  static init(event, logAdapter, logMask) {
    this.body = logAdapter.adapt(event);
    this.mask = maskJson(logMask.fields || [], { ...DEFAULT_MASK_CONFIG, ...logMask.config });
  }

  static getLogger(name) {
    return new BasicLogger(name, this.body, this.mask);
  }

}

module.exports = LogFactory;