/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

/**
 * Error handler middleware
 * Catches and handles all errors in the application
 * @param {Error} err - Error object
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = {};

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    statusCode = 403;
    message = 'CORS policy violation';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = err.details;
  }

  // Not found errors
  if (err.statusCode === 404) {
    statusCode = 404;
    message = 'Not Found';
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      details,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

/**
 * 404 handler middleware
 * Handles requests to non-existent routes
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.originalUrl,
    },
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 * @param {Function} fn - Async function
 * @returns {Function} Express middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
