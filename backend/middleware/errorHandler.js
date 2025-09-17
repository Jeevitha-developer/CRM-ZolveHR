const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error response
  let error = {
    error: 'Internal Server Error',
    message: 'Something went wrong on the server',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  let statusCode = 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    error.error = 'Validation Error';
    error.message = err.message;
    error.details = err.errors;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    error.error = 'Invalid ID';
    error.message = 'Invalid ID format provided';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    error.error = 'Duplicate Entry';
    error.message = 'A record with this information already exists';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    error.error = 'Reference Error';
    error.message = 'Referenced record does not exist';
  } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    statusCode = 500;
    error.error = 'Database Access Error';
    error.message = 'Database connection failed';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error.error = 'Invalid Token';
    error.message = 'Authentication token is invalid';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    error.error = 'Token Expired';
    error.message = 'Authentication token has expired';
  } else if (err.message) {
    error.message = err.message;
  }

  // Send error response
  res.status(statusCode).json(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound
};