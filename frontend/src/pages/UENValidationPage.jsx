import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Info, HelpCircle, Loader } from 'lucide-react'
import { uenAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const UENValidationPage = () => {
  const [uen, setUen] = useState('')
  const [validationResult, setValidationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formatInfo, setFormatInfo] = useState(null)
  const [showHelp, setShowHelp] = useState(false)

  // Load format information on component mount
  useEffect(() => {
    const loadFormatInfo = async () => {
      try {
        const response = await uenAPI.getFormats()
        setFormatInfo(response.data)
      } catch (err) {
        console.error('Failed to load format info:', err)
      }
    }
    loadFormatInfo()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!uen.trim()) {
      setError('Please enter a UEN to validate')
      return
    }

    setLoading(true)
    setError(null)
    setValidationResult(null)

    try {
      const response = await uenAPI.validate(uen.trim())
      setValidationResult(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setUen('')
    setValidationResult(null)
    setError(null)
  }

  const handleExampleClick = (example) => {
    setUen(example)
    setValidationResult(null)
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          UEN Validation
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Validate Singapore Unique Entity Numbers (UEN) for businesses and organizations. 
          Supports all three official UEN formats.
        </p>
      </div>

      {/* Validation Form */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Enter UEN</h2>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="btn btn-secondary btn-sm"
              title="Show format help"
            >
              <HelpCircle size={16} />
              Help
            </button>
          </div>
          <p className="card-description">
            Enter the UEN you want to validate. The system will check if it matches any of the three valid formats.
          </p>
        </div>

        <div className="card-content space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="uen" className="block text-sm font-medium text-slate-700 mb-2">
                UEN Number
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  id="uen"
                  value={uen}
                  onChange={(e) => setUen(e.target.value.toUpperCase())}
                  placeholder="e.g., 12345678A, 200912345A, or T09LL0001B"
                  className="input flex-1"
                  maxLength={10}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !uen.trim()}
                  className="btn btn-primary btn-md min-w-[100px]"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Validate'}
                </button>
                {uen && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="btn btn-secondary btn-md"
                    disabled={loading}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Quick Examples */}
          {formatInfo && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700">Quick Examples:</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(formatInfo.formats).map(([formatKey, format]) => (
                  format.examples?.slice(0, 1).map((example, index) => (
                    <button
                      key={`${formatKey}-${index}`}
                      onClick={() => handleExampleClick(example)}
                      className="btn btn-secondary btn-sm"
                      disabled={loading}
                    >
                      {example}
                    </button>
                  ))
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="alert alert-error">
              <XCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Validation Result */}
          {validationResult && (
            <div className={`alert ${validationResult.isValid ? 'alert-success' : 'alert-error'}`}>
              <div className="flex items-start space-x-3">
                {validationResult.isValid ? (
                  <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={20} className="flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <div className="font-medium">
                    {validationResult.isValid ? 'Valid UEN' : 'Invalid UEN'}
                  </div>
                  
                  {validationResult.isValid ? (
                    <div className="space-y-1 text-sm">
                      <p><strong>UEN:</strong> {validationResult.uen}</p>
                      <p><strong>Format:</strong> {validationResult.format} - {validationResult.formatDescription}</p>
                      {validationResult.entityType && (
                        <p><strong>Entity Type:</strong> {validationResult.entityType}</p>
                      )}
                      {validationResult.details && (
                        <p><strong>Pattern:</strong> {validationResult.details.pattern} ({validationResult.details.length} characters)</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p>{validationResult.error}</p>
                      {validationResult.details?.providedLength && (
                        <p><strong>Provided length:</strong> {validationResult.details.providedLength} characters</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Format Help */}
      {showHelp && formatInfo && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">UEN Format Guide</h2>
            <p className="card-description">
              Singapore UEN comes in three different formats depending on the entity type and registration authority.
            </p>
          </div>
          
          <div className="card-content space-y-6">
            {Object.entries(formatInfo.formats).map(([formatKey, format]) => (
              <div key={formatKey} className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Format {formatKey.slice(-1).toUpperCase()}: {format.pattern}
                </h3>
                <p className="text-sm text-slate-600 mb-3">{format.description}</p>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-slate-700">Examples:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {format.examples?.map((example, index) => (
                        <button
                          key={index}
                          onClick={() => handleExampleClick(example)}
                          className="btn btn-secondary btn-sm"
                          disabled={loading}
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="alert alert-info">
              <Info size={16} className="flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check alphabet validation is not implemented as per system requirements</li>
                  <li>The system only validates format patterns, not actual registration status</li>
                  <li>For official verification, please check with the relevant Singapore authorities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entity Types Reference */}
      {showHelp && formatInfo && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Entity Types</h2>
            <p className="card-description">
              Different entity types are issued by various Singapore government agencies.
            </p>
          </div>
          
          <div className="card-content">
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(formatInfo.entityTypes).map(([code, description]) => (
                <div key={code} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                  <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{code}</span>
                  <span className="text-sm text-slate-600 ml-3 flex-1">{description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UENValidationPage