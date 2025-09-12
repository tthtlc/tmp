import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import UENValidationPage from './pages/UENValidationPage'
import WeatherPage from './pages/WeatherPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/uen-validation" element={<UENValidationPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App