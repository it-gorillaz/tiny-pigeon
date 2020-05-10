'use strict';

const modules = require("./lib/modules"),
      { DefaultEventHandler } = require("./lib/handlers");

exports.handler = async(event) => await
  new DefaultEventHandler(process.env.EVENT_TYPE, modules)
    .handleEvent(event);