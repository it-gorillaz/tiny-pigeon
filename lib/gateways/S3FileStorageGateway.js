'use strict';

class S3FileStorageGateway {

  constructor(s3) {
    this.s3 = s3;
  }

  async exists(dir, fileName) {
    const params = { Bucket: dir, Key: fileName };
    return await this.s3
      .headObject(params)
      .promise()
      .then(() => true)
      .catch(() => false);
  }

  async getFileContents(dir, fileName) {
    const params = { Bucket: dir, Key: fileName };
    return await this.s3
      .getObject(params)
      .promise()
      .then((result) => result.Body)
  }

}

module.exports = S3FileStorageGateway;