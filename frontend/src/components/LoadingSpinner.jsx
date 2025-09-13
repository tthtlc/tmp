import React from 'react'

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`} data-testid="loading-spinner">
      <div className="animate-spin rounded-full border-2 border-slate-300 border-t-primary-600" data-testid="loading-spinner-inner"></div>
    </div>
  )
}

export default LoadingSpinner