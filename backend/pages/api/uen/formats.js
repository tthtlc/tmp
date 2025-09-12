/**
 * UEN Format Information API Endpoint
 * GET /api/uen/formats
 * Returns information about UEN formats and entity types
 */

const { getFormatExamples, getAllEntityTypes } = require('../../../lib/uen-validator');
const { 
  createSuccessResponse, 
  handleMethodNotAllowed,
  handleInternalError,
  sendResponse,
  asyncHandler
} = require('../../../lib/error-handler');

/**
 * Main handler for UEN formats endpoint
 */
async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      const errorResponse = handleMethodNotAllowed(req.method, ['GET']);
      return sendResponse(res, errorResponse);
    }

    // Get format examples and entity types
    const formatExamples = getFormatExamples();
    const entityTypes = getAllEntityTypes();

    // Prepare response data
    const responseData = {
      formats: formatExamples,
      entityTypes: entityTypes,
      summary: {
        totalFormats: Object.keys(formatExamples).length,
        totalEntityTypes: Object.keys(entityTypes).length
      },
      documentation: {
        description: 'UEN (Unique Entity Number) validation formats for Singapore entities',
        reference: 'https://www.uen.gov.sg/ueninternet/faces/pages/admin/aboutUEN.jspx',
        note: 'Check alphabet validation is not implemented as per requirements'
      },
      timestamp: new Date().toISOString()
    };

    const successResponse = createSuccessResponse(responseData);
    return sendResponse(res, successResponse);

  } catch (error) {
    const errorResponse = handleInternalError(error, 'UEN formats');
    return sendResponse(res, errorResponse);
  }
}

// Export with async error handling
module.exports = asyncHandler(handler);