import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Cloud, ArrowRight, Shield, Clock, Globe } from 'lucide-react'

const HomePage = () => {
  const services = [
    {
      title: 'UEN Validation',
      description: 'Validate Singapore Unique Entity Numbers (UEN) for businesses and organizations. Supports all three official UEN formats.',
      icon: CheckCircle,
      href: '/uen-validation',
      color: 'bg-success-600',
      features: ['Format A, B, C validation', 'Entity type identification', 'Real-time validation', 'Format examples']
    },
    {
      title: 'Weather Forecast',
      description: 'Get real-time weather forecasts for Singapore locations. 2-hour forecast data from official government sources.',
      icon: Cloud,
      href: '/weather',
      color: 'bg-primary-600',
      features: ['2-hour forecasts', 'All Singapore locations', 'Real-time data', 'Government API sources']
    }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Built with security best practices and reliable error handling.'
    },
    {
      icon: Clock,
      title: 'Real-time Data',
      description: 'Always up-to-date information from official government sources.'
    },
    {
      icon: Globe,
      title: 'Singapore Focused',
      description: 'Specifically designed for Singapore businesses and residents.'
    }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900">
            Welcome to <span className="text-primary-600">OneST</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto">
            Your one-stop portal for Singapore services. Validate UENs and get weather forecasts with ease.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/uen-validation"
            className="btn btn-primary btn-lg"
          >
            Validate UEN
            <ArrowRight size={20} className="ml-2" />
          </Link>
          <Link
            to="/weather"
            className="btn btn-secondary btn-lg"
          >
            Check Weather
            <Cloud size={20} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Services</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose from our range of Singapore-specific services designed to help businesses and individuals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <div key={service.title} className="card group hover:shadow-lg transition-shadow">
                <div className="card-header">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="card-title text-xl">{service.title}</h3>
                    </div>
                  </div>
                  <p className="card-description mt-2">{service.description}</p>
                </div>
                
                <div className="card-content">
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-slate-600">
                        <CheckCircle size={16} className="text-success-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="card-footer">
                  <Link
                    to={service.href}
                    className="btn btn-primary w-full group-hover:bg-primary-700 transition-colors"
                  >
                    Get Started
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose OneST?</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Built specifically for Singapore, with modern technology and user experience in mind.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 rounded-2xl p-8 md:p-12 text-center text-white">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to get started?</h2>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Try our services now and experience the convenience of Singapore's digital services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/uen-validation"
              className="btn bg-white text-primary-600 hover:bg-primary-50 btn-lg"
            >
              Validate UEN Now
            </Link>
            <Link
              to="/weather"
              className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 btn-lg"
            >
              Check Weather
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage