import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  QuestionAnswer,
  TrendingUp,
  Schedule,
  CheckCircle,
} from '@mui/icons-material'
import { questionsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    prodQuestions: 0,
    devmtQuestions: 0,
    subjectBreakdown: {},
    difficultyBreakdown: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Fetch all questions with a large limit to get stats
      const response = await questionsAPI.getQuestions({ limit: 10000 })
      const questions = response.data.questions
      
      // Calculate statistics
      const prodQuestions = questions.filter(q => q.status === 'prod').length
      const devmtQuestions = questions.filter(q => q.status === 'devmt').length
      
      // Subject breakdown
      const subjectBreakdown = {}
      questions.forEach(q => {
        subjectBreakdown[q.subject] = (subjectBreakdown[q.subject] || 0) + 1
      })
      
      // Difficulty breakdown
      const difficultyBreakdown = {}
      questions.forEach(q => {
        difficultyBreakdown[q.difficulty] = (difficultyBreakdown[q.difficulty] || 0) + 1
      })
      
      setStats({
        totalQuestions: questions.length,
        prodQuestions,
        devmtQuestions,
        subjectBreakdown,
        difficultyBreakdown,
      })
    } catch (err) {
      setError('Failed to load dashboard statistics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.username}! Here's an overview of your question database.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Questions"
            value={stats.totalQuestions}
            icon={<QuestionAnswer fontSize="large" />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Production Questions"
            value={stats.prodQuestions}
            icon={<CheckCircle fontSize="large" />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Development"
            value={stats.devmtQuestions}
            icon={<Schedule fontSize="large" />}
            color="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Subjects"
            value={Object.keys(stats.subjectBreakdown).length}
            icon={<TrendingUp fontSize="large" />}
            color="info"
          />
        </Grid>

        {/* Subject Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Questions by Subject
            </Typography>
            {Object.entries(stats.subjectBreakdown).map(([subject, count]) => (
              <Box key={subject} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                <Typography>{subject}</Typography>
                <Typography variant="h6" color="primary">
                  {count}
                </Typography>
              </Box>
            ))}
            {Object.keys(stats.subjectBreakdown).length === 0 && (
              <Typography color="text.secondary">No questions found</Typography>
            )}
          </Paper>
        </Grid>

        {/* Difficulty Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Questions by Difficulty
            </Typography>
            {Object.entries(stats.difficultyBreakdown).map(([difficulty, count]) => (
              <Box key={difficulty} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                <Typography sx={{ textTransform: 'capitalize' }}>
                  {difficulty}
                </Typography>
                <Typography 
                  variant="h6" 
                  color={
                    difficulty === 'easy' ? 'success.main' : 
                    difficulty === 'medium' ? 'warning.main' : 'error.main'
                  }
                >
                  {count}
                </Typography>
              </Box>
            ))}
            {Object.keys(stats.difficultyBreakdown).length === 0 && (
              <Typography color="text.secondary">No questions found</Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity would go here */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography color="text.secondary">
              Use the navigation menu to manage questions, import/export data, or view audit logs.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage