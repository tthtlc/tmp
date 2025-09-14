import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import QuestionsPage from './pages/QuestionsPage'
import ImportPage from './pages/ImportPage'
import ExportPage from './pages/ExportPage'

// Placeholder pages
const UsersPage = () => <div>Users Management (Admin Only)</div>
const AuditPage = () => <div>Audit Logs (Admin/Editor)</div>
const UnauthorizedPage = () => (
  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
    <h2>Access Denied</h2>
    <p>You don't have permission to access this page.</p>
  </div>
)

function App() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
      />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        
        <Route path="questions" element={<QuestionsPage />} />
        
        <Route path="import" element={
          <ProtectedRoute requiredRoles={['admin', 'editor']}>
            <ImportPage />
          </ProtectedRoute>
        } />
        
        <Route path="export" element={
          <ProtectedRoute requiredRoles={['admin', 'editor']}>
            <ExportPage />
          </ProtectedRoute>
        } />
        
        <Route path="users" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        } />
        
        <Route path="audit" element={
          <ProtectedRoute requiredRoles={['admin', 'editor']}>
            <AuditPage />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App