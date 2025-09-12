/**
 * Weather API Client
 * Handles communication with Singapore Weather APIs
 */

const axios = require('axios');

// API endpoints
const WEATHER_API_ENDPOINTS = {
  primary: 'https://data.gov.sg/datasets/d_3f9e064e25005b0e42969944ccaf2e7a/view',
  secondary: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast'
};

// Default timeout for API requests
const API_TIMEOUT = 10000; // 10 seconds

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let weatherCache = {
  data: null,
  timestamp: null,
  locations: null
};

/**
 * Singapore locations for weather forecast
 * Based on the typical areas covered by Singapore weather services
 */
const SINGAPORE_LOCATIONS = [
  'Ang Mo Kio',
  'Bedok',
  'Bishan',
  'Boon Lay',
  'Bukit Batok',
  'Bukit Merah',
  'Bukit Panjang',
  'Bukit Timah',
  'Central Water Catchment',
  'Changi',
  'Choa Chu Kang',
  'Clementi',
  'City',
  'Geylang',
  'Hougang',
  'Jurong East',
  'Jurong Island',
  'Jurong West',
  'Kallang',
  'Marine Parade',
  'Novena',
  'Pasir Ris',
  'Paya Lebar',
  'Pioneer',
  'Punggol',
  'Queenstown',
  'Sembawang',
  'Sengkang',
  'Serangoon',
  'Tampines',
  'Toa Payoh',
  'Tuas',
  'Woodlands',
  'Yishun'
];

/**
 * Creates an axios instance with default configuration
 */
function createWeatherAPIClient() {
  return axios.create({
    timeout: API_TIMEOUT,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'OneST-Weather-Client/1.0'
    }
  });
}

/**
 * Checks if cached data is still valid
 */
function isCacheValid() {
  if (!weatherCache.data || !weatherCache.timestamp) {
    return false;
  }
  
  const now = Date.now();
  const cacheAge = now - weatherCache.timestamp;
  
  return cacheAge < CACHE_DURATION;
}

/**
 * Updates the weather cache
 */
function updateCache(data) {
  weatherCache = {
    data: data,
    timestamp: Date.now(),
    locations: extractLocationsFromData(data)
  };
}

/**
 * Extracts location names from weather data
 */
function extractLocationsFromData(data) {
  if (!data || !data.area_metadata) {
    return SINGAPORE_LOCATIONS;
  }
  
  return data.area_metadata.map(area => area.name).sort();
}

/**
 * Fetches weather forecast from the primary API
 */
async function fetchFromPrimaryAPI() {
  const client = createWeatherAPIClient();
  
  try {
    const response = await client.get(WEATHER_API_ENDPOINTS.primary);
    return response.data;
  } catch (error) {
    console.error('Primary weather API error:', error.message);
    throw new Error(`Primary API failed: ${error.message}`);
  }
}

/**
 * Fetches weather forecast from the secondary API
 */
async function fetchFromSecondaryAPI() {
  const client = createWeatherAPIClient();
  
  try {
    const response = await client.get(WEATHER_API_ENDPOINTS.secondary);
    return response.data;
  } catch (error) {
    console.error('Secondary weather API error:', error.message);
    throw new Error(`Secondary API failed: ${error.message}`);
  }
}

/**
 * Fetches weather forecast with fallback mechanism
 */
async function fetchWeatherForecast() {
  // Return cached data if valid
  if (isCacheValid()) {
    return weatherCache.data;
  }
  
  let lastError = null;
  
  // Try primary API first
  try {
    const data = await fetchFromSecondaryAPI(); // Using secondary as it's more reliable
    updateCache(data);
    return data;
  } catch (error) {
    lastError = error;
    console.warn('Secondary API failed, trying primary API...');
  }
  
  // Try primary API as fallback
  try {
    const data = await fetchFromPrimaryAPI();
    updateCache(data);
    return data;
  } catch (error) {
    console.error('Both weather APIs failed');
    throw new Error(`All weather APIs failed. Last error: ${error.message}`);
  }
}

/**
 * Filters weather data by location
 */
function filterByLocation(weatherData, location) {
  if (!location || !weatherData || !weatherData.items) {
    return weatherData;
  }
  
  const locationName = location.trim();
  
  // Filter forecasts in each item
  const filteredItems = weatherData.items.map(item => {
    if (!item.forecasts) return item;
    
    const filteredForecasts = item.forecasts.filter(forecast => 
      forecast.area && forecast.area.toLowerCase().includes(locationName.toLowerCase())
    );
    
    return {
      ...item,
      forecasts: filteredForecasts
    };
  });
  
  // Filter area metadata
  const filteredAreaMetadata = weatherData.area_metadata ? 
    weatherData.area_metadata.filter(area => 
      area.name && area.name.toLowerCase().includes(locationName.toLowerCase())
    ) : [];
  
  return {
    ...weatherData,
    area_metadata: filteredAreaMetadata,
    items: filteredItems
  };
}

/**
 * Gets weather forecast for a specific location or all locations
 */
async function getWeatherForecast(location = null) {
  try {
    const weatherData = await fetchWeatherForecast();
    
    if (location) {
      return filterByLocation(weatherData, location);
    }
    
    return weatherData;
  } catch (error) {
    console.error('Error getting weather forecast:', error);
    throw error;
  }
}

/**
 * Gets list of available Singapore locations
 */
function getAvailableLocations() {
  // Return cached locations if available
  if (weatherCache.locations && weatherCache.locations.length > 0) {
    return weatherCache.locations;
  }
  
  // Return default locations
  return SINGAPORE_LOCATIONS;
}

/**
 * Validates if a location is a valid Singapore location
 */
function isValidLocation(location) {
  if (!location || typeof location !== 'string') {
    return false;
  }
  
  const locationName = location.trim().toLowerCase();
  const availableLocations = getAvailableLocations();
  
  return availableLocations.some(loc => 
    loc.toLowerCase().includes(locationName) || 
    locationName.includes(loc.toLowerCase())
  );
}

/**
 * Gets weather forecast with enhanced error handling and formatting
 */
async function getFormattedWeatherForecast(location = null) {
  try {
    const weatherData = await getWeatherForecast(location);
    
    // Add metadata about the request
    const formattedData = {
      ...weatherData,
      metadata: {
        requestedLocation: location,
        timestamp: new Date().toISOString(),
        source: 'Singapore Government Weather API',
        cacheUsed: isCacheValid()
      }
    };
    
    return formattedData;
  } catch (error) {
    throw new Error(`Failed to get weather forecast: ${error.message}`);
  }
}

/**
 * Clears the weather cache (useful for testing or manual refresh)
 */
function clearCache() {
  weatherCache = {
    data: null,
    timestamp: null,
    locations: null
  };
}

/**
 * Gets cache status for debugging
 */
function getCacheStatus() {
  return {
    hasData: !!weatherCache.data,
    timestamp: weatherCache.timestamp,
    age: weatherCache.timestamp ? Date.now() - weatherCache.timestamp : null,
    isValid: isCacheValid(),
    locationsCount: weatherCache.locations ? weatherCache.locations.length : 0
  };
}

module.exports = {
  getWeatherForecast,
  getFormattedWeatherForecast,
  getAvailableLocations,
  isValidLocation,
  filterByLocation,
  clearCache,
  getCacheStatus,
  SINGAPORE_LOCATIONS,
  WEATHER_API_ENDPOINTS
};