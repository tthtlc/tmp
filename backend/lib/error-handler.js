/**
 * Error Handler Utilities
 * Centralized error handling for the OneST API
 */

/**
 * Standard error codes used throughout the application
 */
const ERROR_CODES = {
  // Validation errors
  MISSING_PARAMETER: 'MISSING_PARAMETER',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  
  // External API errors
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  API_TIMEOUT: 'API_TIMEOUT',
  API_RATE_LIMITED: 'API_RATE_LIMITED',
  
  // Server errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Client errors
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED'
};

/**
 * HTTP status codes mapping
 */
const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

/**
 * Creates a standardized error response
 */
function createErrorResponse(code, message, details = null, httpStatus = HTTP_STATUS.BAD_REQUEST) {
  return {
    success: false,
    error: {
      code: code,
      message: message,
      details: details,
      timestamp: new Date().toISOString()
    },
    httpStatus: httpStatus
  };
}

/**
 * Creates a standardized success response
 */
function createSuccessResponse(data, metadata = null) {
  const response = {
    success: true,
    data: data
  };
  
  if (metadata) {
    response.metadata = metadata;
  }
  
  return response;
}

/**
 * Handles validation errors
 */
function handleValidationError(field, message, value = null) {
  const details = {
    field: field,
    providedValue: value
  };
  
  return createErrorResponse(
    ERROR_CODES.VALIDATION_FAILED,
    message,
    details,
    HTTP_STATUS.BAD_REQUEST
  );
}

/**
 * Handles missing parameter errors
 */
function handleMissingParameter(parameterName, expectedType = 'string') {
  const details = {
    parameter: parameterName,
    expectedType: expectedType
  };
  
  return createErrorResponse(
    ERROR_CODES.MISSING_PARAMETER,
    `Required parameter '${parameterName}' is missing`,
    details,
    HTTP_STATUS.BAD_REQUEST
  );
}

/**
 * Handles external API errors
 */
function handleExternalAPIError(apiName, originalError) {
  let errorCode = ERROR_CODES.EXTERNAL_API_ERROR;
  let httpStatus = HTTP_STATUS.SERVICE_UNAVAILABLE;
  let message = `External API (${apiName}) error`;
  
  // Classify error type based on original error
  if (originalError.code === 'ECONNABORTED' || originalError.message.includes('timeout')) {
    errorCode = ERROR_CODES.API_TIMEOUT;
    httpStatus = HTTP_STATUS.GATEWAY_TIMEOUT;
    message = `External API (${apiName}) timeout`;
  } else if (originalError.response && originalError.response.status === 429) {
    errorCode = ERROR_CODES.API_RATE_LIMITED;
    httpStatus = HTTP_STATUS.SERVICE_UNAVAILABLE;
    message = `External API (${apiName}) rate limited`;
  }
  
  const details = {
    api: apiName,
    originalMessage: originalError.message,
    statusCode: originalError.response ? originalError.response.status : null
  };
  
  return createErrorResponse(errorCode, message, details, httpStatus);
}

/**
 * Handles internal server errors
 */
function handleInternalError(originalError, context = null) {
  const details = {
    context: context,
    originalMessage: originalError.message,
    stack: process.env.NODE_ENV === 'development' ? originalError.stack : undefined
  };
  
  return createErrorResponse(
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    'An internal server error occurred',
    details,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}

/**
 * Handles method not allowed errors
 */
function handleMethodNotAllowed(method, allowedMethods = []) {
  const details = {
    method: method,
    allowedMethods: allowedMethods
  };
  
  return createErrorResponse(
    ERROR_CODES.METHOD_NOT_ALLOWED,
    `Method ${method} is not allowed`,
    details,
    HTTP_STATUS.METHOD_NOT_ALLOWED
  );
}

/**
 * Handles not found errors
 */
function handleNotFound(resource = 'Resource') {
  return createErrorResponse(
    ERROR_CODES.NOT_FOUND,
    `${resource} not found`,
    null,
    HTTP_STATUS.NOT_FOUND
  );
}

/**
 * Logs errors with appropriate level based on error type
 */
function logError(error, context = null, request = null) {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      code: error.code || 'UNKNOWN',
      stack: error.stack
    },
    context: context
  };
  
  // Add request information if available
  if (request) {
    logData.request = {
      method: request.method,
      url: request.url,
      headers: request.headers,
      query: request.query,
      body: request.body
    };
  }
  
  // Log based on error severity
  if (error.httpStatus >= 500) {
    console.error('Server Error:', JSON.stringify(logData, null, 2));
  } else if (error.httpStatus >= 400) {
    console.warn('Client Error:', JSON.stringify(logData, null, 2));
  } else {
    console.info('Error:', JSON.stringify(logData, null, 2));
  }
}

/**
 * Express middleware for handling errors
 */
function errorMiddleware(err, req, res, next) {
  let errorResponse;
  
  // Handle different types of errors
  if (err.code && Object.values(ERROR_CODES).includes(err.code)) {
    // Already a formatted error
    errorResponse = err;
  } else if (err.name === 'ValidationError') {
    errorResponse = handleValidationError('unknown', err.message);
  } else {
    // Generic internal error
    errorResponse = handleInternalError(err, 'Express error handler');
  }
  
  // Log the error
  logError(err, 'Express middleware', req);
  
  // Send response
  res.status(errorResponse.httpStatus || HTTP_STATUS.INTERNAL_SERVER_ERROR)
     .json({
       success: errorResponse.success,
       error: errorResponse.error
     });
}

/**
 * Async wrapper for route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validates request parameters
 */
function validateRequestParams(req, requiredParams = [], optionalParams = []) {
  const errors = [];
  const params = { ...req.query, ...req.body };
  
  // Check required parameters
  for (const param of requiredParams) {
    if (!params[param] || params[param].toString().trim() === '') {
      errors.push({
        parameter: param,
        error: 'Required parameter is missing or empty'
      });
    }
  }
  
  if (errors.length > 0) {
    throw createErrorResponse(
      ERROR_CODES.VALIDATION_FAILED,
      'Parameter validation failed',
      { errors },
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  return params;
}

/**
 * Sends a standardized API response
 */
function sendResponse(res, data, httpStatus = HTTP_STATUS.OK) {
  if (data.success === false) {
    // Error response
    res.status(data.httpStatus || HTTP_STATUS.INTERNAL_SERVER_ERROR)
       .json({
         success: data.success,
         error: data.error
       });
  } else {
    // Success response
    res.status(httpStatus).json(data);
  }
}

export {
  ERROR_CODES,
  HTTP_STATUS,
  createErrorResponse,
  createSuccessResponse,
  handleValidationError,
  handleMissingParameter,
  handleExternalAPIError,
  handleInternalError,
  handleMethodNotAllowed,
  handleNotFound,
  logError,
  errorMiddleware,
  asyncHandler,
  validateRequestParams,
  sendResponse
};