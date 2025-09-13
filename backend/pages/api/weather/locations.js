/**
 * Weather Locations API Endpoint
 * GET /api/weather/locations
 * Returns list of available Singapore locations for weather forecast
 */

import { getAvailableLocations, getCacheStatus } from '../../../lib/weather-client.js';
import { 
  createSuccessResponse, 
  handleMethodNotAllowed,
  handleInternalError,
  sendResponse,
  asyncHandler
} from '../../../lib/error-handler.js';

/**
 * Main handler for weather locations endpoint
 */
async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      const errorResponse = handleMethodNotAllowed(req.method, ['GET']);
      return sendResponse(res, errorResponse);
    }

    // Get available locations
    const locations = getAvailableLocations();
    const cacheStatus = getCacheStatus();

    // Prepare response data
    const responseData = {
      locations: locations,
      metadata: {
        totalLocations: locations.length,
        source: cacheStatus.hasData ? 'Live weather data' : 'Default location list',
        cacheStatus: {
          isValid: cacheStatus.isValid,
          lastUpdated: cacheStatus.timestamp ? new Date(cacheStatus.timestamp).toISOString() : null,
          age: cacheStatus.age
        },
        timestamp: new Date().toISOString()
      }
    };

    const successResponse = createSuccessResponse(responseData);
    return sendResponse(res, successResponse);

  } catch (error) {
    const errorResponse = handleInternalError(error, 'Weather locations');
    return sendResponse(res, errorResponse);
  }
}

// Export with async error handling
export default asyncHandler(handler);