import axios from 'axios'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging and authentication
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('Response error:', error)
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 429:
          throw new Error('Too many requests. Please try again later.')
        case 500:
          throw new Error('Server error. Please try again later.')
        case 503:
          throw new Error('Service temporarily unavailable.')
        default:
          throw new Error(data?.error?.message || 'An error occurred')
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.')
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred.')
    }
  }
)

// UEN Validation API
export const uenAPI = {
  /**
   * Validate UEN format
   * @param {string} uen - The UEN to validate
   * @returns {Promise} API response
   */
  async validate(uen) {
    const response = await api.get('/uen/validate', {
      params: { uen }
    })
    return response.data
  },

  /**
   * Get UEN format information
   * @returns {Promise} API response with format details
   */
  async getFormats() {
    const response = await api.get('/uen/formats')
    return response.data
  }
}

// Weather API
export const weatherAPI = {
  /**
   * Get weather forecast
   * @param {string} location - Optional location filter
   * @returns {Promise} API response
   */
  async getForecast(location = null) {
    const params = location ? { location } : {}
    const response = await api.get('/weather/forecast', { params })
    return response.data
  },

  /**
   * Get available Singapore locations
   * @returns {Promise} API response with locations list
   */
  async getLocations() {
    const response = await api.get('/weather/locations')
    return response.data
  }
}

// System API
export const systemAPI = {
  /**
   * Get system health status
   * @returns {Promise} API response
   */
  async getHealth() {
    const response = await api.get('/health')
    return response.data
  }
}

export default api