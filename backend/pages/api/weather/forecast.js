/**
 * Weather Forecast API Endpoint
 * GET /api/weather/forecast?location={location}
 */

import { 
  getFormattedWeatherForecast, 
  isValidLocation, 
  getAvailableLocations 
} from '../../../lib/weather-client.js';
import { 
  createSuccessResponse, 
  handleValidationError,
  handleMethodNotAllowed,
  handleExternalAPIError,
  handleInternalError,
  sendResponse,
  asyncHandler
} from '../../../lib/error-handler.js';

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
      console.log('Fetching weather data for location:', location);
      weatherData = await getFormattedWeatherForecast(location);
      console.log('Weather data received, items count:', weatherData?.items?.length || 0);
    } catch (error) {
      console.error('Weather API error:', error);
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
    console.log('Sending weather response, success:', successResponse.success);
    return sendResponse(res, successResponse);

  } catch (error) {
    const errorResponse = handleInternalError(error, 'Weather forecast');
    return sendResponse(res, errorResponse);
  }
}

// Export with async error handling
export default asyncHandler(handler);