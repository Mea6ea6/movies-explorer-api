const { HTTP_STATUS_NOT_FOUND } = require('http2').constants;

class NotFoundError extends Error {
  constructor(message) {
    super();
    this.name = 'NotFoundError';
    this.statusCode = HTTP_STATUS_NOT_FOUND;
    this.message = message;
  }
}

module.exports = NotFoundError;
