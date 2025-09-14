import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
}

// Users API
export const usersAPI = {
  createUser: (userData) => api.post('/users', userData),
  getUsers: (params) => api.get('/users', { params }),
}

// Questions API
export const questionsAPI = {
  getQuestions: (params) => api.get('/questions', { params }),
  getQuestion: (id) => api.get(`/questions/${id}`),
  createQuestion: (questionData) => api.post('/questions', questionData),
  updateQuestion: (id, questionData) => api.put(`/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  updateQuestionStatus: (id, status) => api.put(`/questions/${id}/status`, null, { params: { status } }),
  importQuestions: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/questions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  exportQuestions: () => api.get('/questions/export', { responseType: 'blob' }),
  getAuditLogs: (questionId) => api.get(`/questions/${questionId}/audit`),
  getAuditHistory: (questionId, daysBack = 30) => 
    api.get(`/questions/${questionId}/audit/history`, { params: { days_back: daysBack } }),
}

// Files API
export const filesAPI = {
  uploadFile: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getFile: (filePath) => api.get(`/files/${filePath}`, { responseType: 'blob' }),
}

export default api