'use strict';

class SNSEventAdapter {

  adapt(event) {
    event.Records = event.Records.map((record) => {
      record.Sns.Message = JSON.parse(record.Sns.Message)
      return record;
    });
  }

}

module.exports = SNSEventAdapter;