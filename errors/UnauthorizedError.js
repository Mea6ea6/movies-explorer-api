const { HTTP_STATUS_UNAUTHORIZED } = require('http2').constants;

class UnauthorizedError extends Error {
  constructor(message) {
    super();
    this.name = 'UnauthorizedError';
    this.statusCode = HTTP_STATUS_UNAUTHORIZED;
    this.message = message;
  }
}

module.exports = UnauthorizedError;
