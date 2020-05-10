'use strict';

class SNSLogAdapter {

  adapt(event) {
    const { Records: [record] } = event;
    const { Sns: { Type, MessageId, TopicArn, Timestamp } } = record;
    return {
      level: null,
      name: null,
      payload: null,
      messageId: MessageId,
      type: Type,
      topicArn: TopicArn,
      timestamp: Timestamp,
      time: null
    }
  }

}

module.exports = SNSLogAdapter;