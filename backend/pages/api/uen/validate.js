/**
 * UEN Validation API Endpoint
 * GET /api/uen/validate?uen={uen}
 */

const { validateUEN, getFormatExamples } = require('../../../lib/uen-validator');
const { 
  createSuccessResponse, 
  handleValidationError, 
  handleMethodNotAllowed,
  handleInternalError,
  validateRequestParams,
  sendResponse,
  asyncHandler,
  HTTP_STATUS
} = require('../../../lib/error-handler');

/**
 * Main handler for UEN validation endpoint
 */
async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      const errorResponse = handleMethodNotAllowed(req.method, ['GET']);
      return sendResponse(res, errorResponse);
    }

    // Validate request parameters
    let params;
    try {
      params = validateRequestParams(req, ['uen']);
    } catch (error) {
      return sendResponse(res, error);
    }

    const { uen } = params;

    // Validate UEN format
    const validationResult = validateUEN(uen);

    // Prepare response data
    const responseData = {
      uen: uen.trim().toUpperCase(),
      isValid: validationResult.isValid,
      format: validationResult.format,
      formatDescription: validationResult.formatDescription,
      entityType: validationResult.entityType,
      details: validationResult.details,
      error: validationResult.error,
      timestamp: new Date().toISOString()
    };

    // Add format examples for invalid UENs to help users
    if (!validationResult.isValid) {
      responseData.formatExamples = getFormatExamples();
    }

    const successResponse = createSuccessResponse(responseData);
    return sendResponse(res, successResponse);

  } catch (error) {
    const errorResponse = handleInternalError(error, 'UEN validation');
    return sendResponse(res, errorResponse);
  }
}

// Export with async error handling
module.exports = asyncHandler(handler);