const { HTTP_STATUS_INTERNAL_SERVER_ERROR } = require('http2').constants;

class InternalServerError extends Error {
  constructor(message) {
    super();
    this.name = 'InternalServerError';
    this.statusCode = HTTP_STATUS_INTERNAL_SERVER_ERROR;
    this.message = message;
  }
}

module.exports = InternalServerError;
