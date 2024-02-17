const { HTTP_STATUS_CONFLICT } = require('http2').constants;

class ConflictError extends Error {
  constructor(message) {
    super();
    this.name = 'ConflictError';
    this.statusCode = HTTP_STATUS_CONFLICT;
    this.message = message;
  }
}

module.exports = ConflictError;
