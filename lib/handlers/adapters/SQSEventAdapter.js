'use strict';

class SQSEventAdapter {

  adapt(event) {
    event.Records = event.Records.map((record) => {
      record.body = JSON.parse(record.body);
      return record;
    });
  }

}

module.exports = SQSEventAdapter;