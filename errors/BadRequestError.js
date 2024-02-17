const { HTTP_STATUS_BAD_REQUEST } = require('http2').constants;

class BadRequestError extends Error {
  constructor(message) {
    super();
    this.name = 'BadRequestError';
    this.statusCode = HTTP_STATUS_BAD_REQUEST;
    this.message = message;
  }
}

module.exports = BadRequestError;
