import React, { useState, useEffect } from 'react'
import { Cloud, MapPin, RefreshCw, Clock, AlertCircle, Thermometer } from 'lucide-react'
import { weatherAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const WeatherPage = () => {
  const [weatherData, setWeatherData] = useState(null)
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Load initial data
  useEffect(() => {
    loadLocations()
    loadWeatherForecast()
  }, [])

  const loadLocations = async () => {
    try {
      const response = await weatherAPI.getLocations()
      setLocations(response.data.locations)
    } catch (err) {
      console.error('Failed to load locations:', err)
    }
  }

  const loadWeatherForecast = async (location = null) => {
    setLoading(true)
    setError(null)

    try {
      console.log('🌤️ Frontend: Loading weather forecast for location:', location)
      const response = await weatherAPI.getForecast(location)
      console.log('📊 Frontend: Received API response:', response)
      console.log('📊 Frontend: Response data structure:', {
        hasData: !!response.data,
        hasItems: !!response.data?.items,
        itemsLength: response.data?.items?.length,
        hasAreaMetadata: !!response.data?.area_metadata,
        firstItem: response.data?.items?.[0],
        firstItemForecasts: response.data?.items?.[0]?.forecasts?.length
      })
      
      setWeatherData(response.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('❌ Frontend: Weather API error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (location) => {
    setSelectedLocation(location)
    loadWeatherForecast(location || null)
  }

  const handleRefresh = () => {
    loadWeatherForecast(selectedLocation || null)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown'
    return new Date(timestamp).toLocaleString('en-SG', {
      timeZone: 'Asia/Singapore',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getWeatherIcon = (forecast) => {
    if (!forecast) return <Cloud size={24} />
    
    const weather = forecast.toLowerCase()
    if (weather.includes('rain') || weather.includes('shower')) {
      return <Cloud size={24} className="text-blue-600" />
    } else if (weather.includes('cloudy')) {
      return <Cloud size={24} className="text-gray-600" />
    } else if (weather.includes('sunny') || weather.includes('fair')) {
      return <Thermometer size={24} className="text-yellow-600" />
    }
    return <Cloud size={24} />
  }

  const getCurrentItem = () => {
    console.log('🔍 getCurrentItem called:', {
      hasWeatherData: !!weatherData,
      hasItems: !!weatherData?.items,
      itemsLength: weatherData?.items?.length,
      firstItem: weatherData?.items?.[0]
    })
    
    if (!weatherData?.items || weatherData.items.length === 0) {
      console.log('❌ getCurrentItem: No items available')
      return null
    }
    
    const currentItem = weatherData.items[0]
    console.log('✅ getCurrentItem: Returning item:', {
      hasForecasts: !!currentItem?.forecasts,
      forecastsLength: currentItem?.forecasts?.length
    })
    
    return currentItem
  }

  const getValidPeriod = () => {
    const currentItem = getCurrentItem()
    if (!currentItem?.valid_period) return null
    
    return {
      start: formatTime(currentItem.valid_period.start),
      end: formatTime(currentItem.valid_period.end)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Singapore Weather Forecast
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Real-time 2-hour weather forecast for Singapore locations. 
          Data sourced from official Singapore government APIs.
        </p>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Forecast Controls</h2>
          <p className="card-description">
            Select a specific location or view forecast for all Singapore areas.
          </p>
        </div>
        
        <div className="card-content">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">
                Location (Optional)
              </label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="input"
                disabled={loading}
              >
                <option value="">All Singapore</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn btn-primary btn-md min-w-[120px]"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <RefreshCw size={16} />
                  Refresh
                </>
              )}
            </button>
          </div>
          
          {lastUpdated && (
            <div className="flex items-center space-x-2 text-sm text-slate-600 mt-4">
              <Clock size={14} />
              <span>Last updated: {lastUpdated.toLocaleTimeString('en-SG')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} className="flex-shrink-0" />
          <div>
            <p className="font-medium">Failed to load weather data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Weather Data */}
      {weatherData && !loading && (
        <>
          {/* Forecast Summary */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title">Current Forecast</h2>
                {weatherData.requestInfo?.requestedLocation && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <MapPin size={14} />
                    <span>{weatherData.requestInfo.requestedLocation}</span>
                  </div>
                )}
              </div>
              
              {getValidPeriod() && (
                <p className="card-description">
                  Valid from {getValidPeriod().start} to {getValidPeriod().end}
                </p>
              )}
            </div>
            
            <div className="card-content">
              {getCurrentItem()?.forecasts?.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getCurrentItem().forecasts.slice(0, 6).map((forecast, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        {getWeatherIcon(forecast.forecast)}
                        <div>
                          <h3 className="font-medium text-slate-900">{forecast.area}</h3>
                          <p className="text-sm text-slate-600">{forecast.forecast}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Cloud size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No forecast data available for the selected location.</p>
                </div>
              )}
            </div>
          </div>

          {/* All Areas Forecast */}
          {getCurrentItem()?.forecasts?.length > 6 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">All Areas</h2>
                <p className="card-description">
                  Complete forecast for all Singapore areas
                </p>
              </div>
              
              <div className="card-content">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {getCurrentItem().forecasts.map((forecast, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getWeatherIcon(forecast.forecast)}
                        <span className="font-medium text-sm">{forecast.area}</span>
                      </div>
                      <span className="text-xs text-slate-600">{forecast.forecast}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Area Metadata */}
          {weatherData.area_metadata && weatherData.area_metadata.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Location Details</h2>
                <p className="card-description">
                  Geographic coordinates for forecast areas
                </p>
              </div>
              
              <div className="card-content">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {weatherData.area_metadata.slice(0, 9).map((area, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-3">
                      <h3 className="font-medium text-slate-900 mb-1">{area.name}</h3>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div>Lat: {area.label_location?.latitude?.toFixed(3)}</div>
                        <div>Lng: {area.label_location?.longitude?.toFixed(3)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {weatherData.area_metadata.length > 9 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-slate-600">
                      Showing 9 of {weatherData.area_metadata.length} areas
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* API Information */}
          <div className="alert alert-info">
            <AlertCircle size={16} className="flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Data Source</p>
              <p>Weather data is provided by Singapore Government APIs and updated regularly. 
                 Forecasts are typically valid for 2-hour periods.</p>
              {weatherData.metadata?.source && (
                <p className="mt-1"><strong>Source:</strong> {weatherData.metadata.source}</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {loading && !weatherData && (
        <div className="card">
          <div className="card-content">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <LoadingSpinner size="xl" />
              <p className="text-slate-600">Loading weather forecast...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WeatherPage