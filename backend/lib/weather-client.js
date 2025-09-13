/**
 * Weather API Client
 * Handles communication with Singapore Weather APIs
 */

import axios from 'axios';

// API endpoints
const WEATHER_API_ENDPOINTS = {
  primary: 'https://data.gov.sg/datasets/d_3f9e064e25005b0e42969944ccaf2e7a/view',
  secondary: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast'
};

// Log API endpoints on module load
console.log('🔗 Weather API Endpoints Configuration:');
console.log(`   PRIMARY: ${WEATHER_API_ENDPOINTS.primary}`);
console.log(`   SECONDARY: ${WEATHER_API_ENDPOINTS.secondary}`);

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
 * Creates an axios instance with default configuration and logging interceptors
 */
function createWeatherAPIClient() {
  const client = axios.create({
    timeout: API_TIMEOUT,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'OneST-Weather-Client/1.0'
    }
  });

  // Request interceptor for logging
  client.interceptors.request.use(
    (config) => {
      console.log(`🚀 HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`📋 Request Headers: ${JSON.stringify(config.headers, null, 2)}`);
      console.log(`⏱️ Request Timeout: ${config.timeout}ms`);
      return config;
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging
  client.interceptors.response.use(
    (response) => {
      console.log(`📥 HTTP Response: ${response.status} ${response.statusText}`);
      console.log(`🔗 Response URL: ${response.config.url}`);
      console.log(`📊 Response Size: ${JSON.stringify(response.data).length} characters`);
      console.log(`🕒 Response Headers: ${JSON.stringify(response.headers, null, 2)}`);
      return response;
    },
    (error) => {
      const status = error.response?.status || 'Network Error';
      const statusText = error.response?.statusText || error.message;
      const url = error.config?.url || 'Unknown URL';
      
      console.error(`❌ HTTP Error Response: ${status} ${statusText}`);
      console.error(`🔗 Failed URL: ${url}`);
      console.error(`📋 Error Details: ${error.message}`);
      
      if (error.response?.data) {
        console.error(`📊 Error Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      
      return Promise.reject(error);
    }
  );

  return client;
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
  const itemsCount = data?.items?.length || 0;
  const locationsCount = data?.area_metadata?.length || 0;
  
  weatherCache = {
    data: data,
    timestamp: Date.now(),
    locations: extractLocationsFromData(data)
  };
  
  console.log(`💾 Cache updated: ${itemsCount} weather items, ${locationsCount} locations`);
  console.log(`🕒 Cache will expire in ${Math.round(CACHE_DURATION / 1000)}s`);
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
  const url = WEATHER_API_ENDPOINTS.primary;
  
  console.log(`🌐 Fetching from PRIMARY API: ${url}`);
  
  try {
    const response = await client.get(url);
    console.log(`✅ PRIMARY API Response: HTTP ${response.status} ${response.statusText} from ${url}`);
    console.log(`📊 PRIMARY API Data size: ${JSON.stringify(response.data).length} characters`);
    return response.data;
  } catch (error) {
    const status = error.response?.status || 'Unknown';
    const statusText = error.response?.statusText || error.message;
    console.error(`❌ PRIMARY API Error: HTTP ${status} ${statusText} from ${url}`);
    console.error('Primary weather API error details:', error.message);
    throw new Error(`Primary API failed: ${error.message}`);
  }
}

/**
 * Fetches weather forecast from the secondary API
 */
async function fetchFromSecondaryAPI() {
  const client = createWeatherAPIClient();
  const url = WEATHER_API_ENDPOINTS.secondary;
  
  console.log(`🌐 Fetching from SECONDARY API: ${url}`);
  
  try {
    const response = await client.get(url);
    console.log(`✅ SECONDARY API Response: HTTP ${response.status} ${response.statusText} from ${url}`);
    console.log(`📊 SECONDARY API Data size: ${JSON.stringify(response.data).length} characters`);
    console.log(`🕒 SECONDARY API Response time: ${response.headers['x-response-time'] || 'N/A'}`);
    return response.data;
  } catch (error) {
    const status = error.response?.status || 'Unknown';
    const statusText = error.response?.statusText || error.message;
    console.error(`❌ SECONDARY API Error: HTTP ${status} ${statusText} from ${url}`);
    console.error('Secondary weather API error details:', error.message);
    throw new Error(`Secondary API failed: ${error.message}`);
  }
}

/**
 * Fetches weather forecast with fallback mechanism
 */
async function fetchWeatherForecast() {
  const startTime = Date.now();
  
  // Return cached data if valid
  if (isCacheValid()) {
    console.log('📋 Using cached weather data (cache is valid)');
    console.log(`⚡ Cache age: ${Math.round((Date.now() - weatherCache.timestamp) / 1000)}s`);
    return weatherCache.data;
  }
  
  console.log('🔄 Cache expired or empty, fetching fresh weather data...');
  let lastError = null;
  
  // Try secondary API first (it's more reliable)
  try {
    console.log('🎯 Attempting SECONDARY API first (primary choice)...');
    const data = await fetchFromSecondaryAPI();
    updateCache(data);
    const duration = Date.now() - startTime;
    console.log(`🎉 Weather data successfully fetched from SECONDARY API in ${duration}ms`);
    return data;
  } catch (error) {
    lastError = error;
    console.warn('⚠️ SECONDARY API failed, trying PRIMARY API as fallback...');
  }
  
  // Try primary API as fallback
  try {
    console.log('🎯 Attempting PRIMARY API as fallback...');
    const data = await fetchFromPrimaryAPI();
    updateCache(data);
    const duration = Date.now() - startTime;
    console.log(`🎉 Weather data successfully fetched from PRIMARY API in ${duration}ms`);
    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('💥 Both weather APIs failed');
    console.error(`❌ Total attempt duration: ${duration}ms`);
    console.error(`❌ Last SECONDARY API error: ${lastError?.message}`);
    console.error(`❌ Last PRIMARY API error: ${error?.message}`);
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
  console.log(`🌤️ Getting formatted weather forecast for: ${location || 'All Singapore'}`);
  
  try {
    const weatherData = await getWeatherForecast(location);
    
    // Add metadata about the request
    const formattedData = {
      ...weatherData,
      metadata: {
        requestedLocation: location,
        timestamp: new Date().toISOString(),
        source: 'Singapore Government Weather API',
        cacheUsed: isCacheValid(),
        apiEndpoints: {
          primary: WEATHER_API_ENDPOINTS.primary,
          secondary: WEATHER_API_ENDPOINTS.secondary
        }
      }
    };
    
    console.log(`✅ Formatted weather data ready for: ${location || 'All Singapore'}`);
    console.log(`📊 Final data contains ${formattedData.items?.length || 0} forecast items`);
    
    return formattedData;
  } catch (error) {
    console.error(`❌ Failed to get formatted weather forecast: ${error.message}`);
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

export {
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