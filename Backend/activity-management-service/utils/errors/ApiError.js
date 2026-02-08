class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational; // Indicates if the error is expected/handled
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', stack = '') {
    super(404, message, true, stack);
  }
}

class BadRequestError extends ApiError {
  constructor(message = 'Bad request', stack = '') {
    super(400, message, true, stack);
  }
}

// You can add more custom error types as needed, e.g., UnauthorizedError, ForbiddenError

module.exports = {
  ApiError,
  NotFoundError,
  BadRequestError,
};