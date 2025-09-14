import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material'
import { Download, GetApp } from '@mui/icons-material'
import { questionsAPI } from '../services/api'
import { toast } from 'react-toastify'

const ExportPage = () => {
  const [exporting, setExporting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byDifficulty: {},
    bySubject: {},
  })
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    difficulty: '',
    status: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await questionsAPI.getQuestions({ limit: 10000 })
      const questions = response.data.questions
      
      const byStatus = {}
      const byDifficulty = {}
      const bySubject = {}
      
      questions.forEach(q => {
        byStatus[q.status] = (byStatus[q.status] || 0) + 1
        byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1
        bySubject[q.subject] = (bySubject[q.subject] || 0) + 1
      })
      
      setStats({
        total: questions.length,
        byStatus,
        byDifficulty,
        bySubject,
      })
    } catch (error) {
      toast.error('Failed to load statistics')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      
      // Build query parameters from filters
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
      })
      
      const response = await questionsAPI.exportQuestions()
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      link.download = `questions_export_${timestamp}.json`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Questions exported successfully')
    } catch (error) {
      toast.error('Failed to export questions')
      console.error(error)
    } finally {
      setExporting(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value })
  }

  const getFilteredCount = () => {
    // This is a simplified calculation - in a real app you'd make an API call
    // with filters to get the exact count
    return stats.total // For now, return total
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Export Questions
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Export your questions database to a JSON file for backup or sharing.
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Database Statistics
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Questions
                </Typography>
                <Typography variant="h4" color="primary">
                  {stats.total}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  By Status
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {Object.entries(stats.byStatus).map(([status, count]) => (
                    <Chip
                      key={status}
                      label={`${status.toUpperCase()}: ${count}`}
                      color={status === 'prod' ? 'success' : 'warning'}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  By Difficulty
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {Object.entries(stats.byDifficulty).map(([difficulty, count]) => (
                    <Chip
                      key={difficulty}
                      label={`${difficulty.toUpperCase()}: ${count}`}
                      color={
                        difficulty === 'easy' ? 'success' :
                        difficulty === 'medium' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  By Subject
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {Object.entries(stats.bySubject).slice(0, 5).map(([subject, count]) => (
                    <Chip
                      key={subject}
                      label={`${subject}: ${count}`}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                  {Object.keys(stats.bySubject).length > 5 && (
                    <Chip
                      label={`+${Object.keys(stats.bySubject).length - 5} more`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Export Options Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Options
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Filters are not yet implemented in the export. All questions will be exported.
              </Alert>

              {/* Filters - Placeholder for future implementation */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    size="small"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Topic"
                    value={filters.topic}
                    onChange={(e) => handleFilterChange('topic', e.target.value)}
                    size="small"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" disabled>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={filters.difficulty}
                      label="Difficulty"
                      onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" disabled>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="prod">Production</MenuItem>
                      <MenuItem value="devmt">Development</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Questions to export: {stats.total}
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleExport}
                  disabled={exporting || stats.total === 0}
                  startIcon={exporting ? <CircularProgress size={20} /> : <Download />}
                  sx={{ mt: 2 }}
                >
                  {exporting ? 'Exporting...' : 'Export Questions'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Export Format Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Format
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                The exported JSON file will contain all questions in the following format:
              </Typography>
              
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                }}
              >
{`{
  "questions": [
    {
      "subject": "Mathematics",
      "topic": "Algebra",
      "question": "Solve for $x$: $2x + 5 = 13$",
      "difficulty": "easy",
      "attachment": "algebra_example.png"
    },
    {
      "subject": "Physics", 
      "topic": "Mechanics",
      "question": "Calculate velocity using: $$v = u + at$$",
      "difficulty": "medium",
      "attachment": null
    }
  ]
}`}
              </Box>
              
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  This format is compatible with the import function, making it easy to backup and restore your question database.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ExportPage