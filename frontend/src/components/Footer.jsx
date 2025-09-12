import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <span className="text-xl font-bold text-slate-900">OneST</span>
            </div>
            <p className="text-slate-600 text-sm max-w-md">
              OneST is a web portal that provides multiple services to the public, including UEN validation and Singapore weather forecasts.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/uen-validation" className="text-sm text-slate-600 hover:text-primary-600 transition-colors">
                  UEN Validation
                </Link>
              </li>
              <li>
                <Link to="/weather" className="text-sm text-slate-600 hover:text-primary-600 transition-colors">
                  Weather Forecast
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Information
            </h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.uen.gov.sg/ueninternet/faces/pages/admin/aboutUEN.jspx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-primary-600 transition-colors"
                >
                  About UEN
                </a>
              </li>
              <li>
                <a 
                  href="https://data.gov.sg" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-primary-600 transition-colors"
                >
                  Data.gov.sg
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-600">
              © 2025 OneST. Built for Singapore services.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-xs text-slate-500">
                Powered by Singapore Government APIs
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer