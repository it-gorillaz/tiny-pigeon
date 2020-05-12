'use strict';

class SQSLogAdapter {

  adapt(event) {
    const { Records: [record] } = event;
    return {
      level: null,
      name: null,
      payload: null,
      client: record.body.client,
      messageId: record.messageId,
      approximateReceiveCount: record.attributes.ApproximateReceiveCount,
      sentTimestamp: record.attributes.SentTimestamp,
      senderId: record.attributes.SenderId,
      approximateFirstReceiveTimestamp: record.attributes.ApproximateFirstReceiveTimestamp,
      messageAttributes: record.messageAttributes,
      md5OfBody: record.md5OfBody,
      eventSource: record.eventSource,
      eventSourceARN: record.eventSourceARN,
      awsRegion: record.awsRegion,
      time: null
    }
  }

}

module.exports = SQSLogAdapter;