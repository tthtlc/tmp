/**
 * Health Check API Endpoint
 * GET /api/health
 * Returns system health status and API availability
 */

import { getCacheStatus } from '../../lib/weather-client.js';
import { 
  createSuccessResponse, 
  handleMethodNotAllowed,
  sendResponse,
  asyncHandler
} from '../../lib/error-handler.js';

/**
 * Main handler for health check endpoint
 */
async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      const errorResponse = handleMethodNotAllowed(req.method, ['GET']);
      return sendResponse(res, errorResponse);
    }

    const cacheStatus = getCacheStatus();
    const now = new Date();

    // Prepare health status
    const healthData = {
      status: 'healthy',
      timestamp: now.toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      services: {
        uenValidation: {
          status: 'operational',
          description: 'UEN validation service'
        },
        weatherForecast: {
          status: 'operational',
          description: 'Singapore weather forecast service',
          cache: {
            hasData: cacheStatus.hasData,
            isValid: cacheStatus.isValid,
            lastUpdated: cacheStatus.timestamp ? new Date(cacheStatus.timestamp).toISOString() : null
          }
        }
      },
      endpoints: {
        uen: {
          validate: '/api/uen/validate',
          formats: '/api/uen/formats'
        },
        weather: {
          forecast: '/api/weather/forecast',
          locations: '/api/weather/locations'
        },
        system: {
          health: '/api/health'
        }
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
      }
    };

    const successResponse = createSuccessResponse(healthData);
    return sendResponse(res, successResponse);

  } catch (error) {
    const errorResponse = handleInternalError(error, 'Health check');
    return sendResponse(res, errorResponse);
  }
}

// Export with async error handling
export default asyncHandler(handler);