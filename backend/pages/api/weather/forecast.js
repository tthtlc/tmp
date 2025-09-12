/**
 * Weather Forecast API Endpoint
 * GET /api/weather/forecast?location={location}
 */

const { 
  getFormattedWeatherForecast, 
  isValidLocation, 
  getAvailableLocations 
} = require('../../../lib/weather-client');
const { 
  createSuccessResponse, 
  handleValidationError,
  handleMethodNotAllowed,
  handleExternalAPIError,
  handleInternalError,
  sendResponse,
  asyncHandler
} = require('../../../lib/error-handler');

/**
 * Main handler for weather forecast endpoint
 */
async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      const errorResponse = handleMethodNotAllowed(req.method, ['GET']);
      return sendResponse(res, errorResponse);
    }

    // Get location parameter (optional)
    const { location } = req.query;

    // Validate location if provided
    if (location && !isValidLocation(location)) {
      const availableLocations = getAvailableLocations();
      const errorResponse = handleValidationError(
        'location',
        `Invalid location. Please provide a valid Singapore location.`,
        location
      );
      
      // Add available locations to help user
      errorResponse.error.details.availableLocations = availableLocations.slice(0, 10); // First 10 for brevity
      errorResponse.error.details.totalAvailableLocations = availableLocations.length;
      
      return sendResponse(res, errorResponse);
    }

    // Get weather forecast
    let weatherData;
    try {
      weatherData = await getFormattedWeatherForecast(location);
    } catch (error) {
      const errorResponse = handleExternalAPIError('Singapore Weather API', error);
      return sendResponse(res, errorResponse);
    }

    // Add additional metadata
    const responseData = {
      ...weatherData,
      requestInfo: {
        requestedLocation: location || 'All Singapore',
        timestamp: new Date().toISOString(),
        validPeriod: weatherData.items && weatherData.items.length > 0 
          ? weatherData.items[0].valid_period 
          : null
      }
    };

    const successResponse = createSuccessResponse(responseData);
    return sendResponse(res, successResponse);

  } catch (error) {
    const errorResponse = handleInternalError(error, 'Weather forecast');
    return sendResponse(res, errorResponse);
  }
}

// Export with async error handling
module.exports = asyncHandler(handler);