const { HTTP_STATUS_FORBIDDEN } = require('http2').constants;

class ForbiddenError extends Error {
  constructor(message) {
    super();
    this.name = 'ForbiddenError';
    this.statusCode = HTTP_STATUS_FORBIDDEN;
    this.message = message;
  }
}

module.exports = ForbiddenError;
