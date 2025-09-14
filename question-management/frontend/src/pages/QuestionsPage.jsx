import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Alert,
  CircularProgress,
  Menu,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  History,
  PlayArrow,
  Pause,
} from '@mui/icons-material'
import { questionsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LaTeXRenderer from '../components/LaTeXRenderer'
import QuestionEditor from '../components/QuestionEditor'
import { toast } from 'react-toastify'

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    difficulty: '',
    status: '',
  })
  
  // Dialog states
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuQuestion, setMenuQuestion] = useState(null)

  const { canEdit, user } = useAuth()

  useEffect(() => {
    fetchQuestions()
  }, [currentPage, filters])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const params = {
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      }
      
      const response = await questionsAPI.getQuestions(params)
      setQuestions(response.data.questions)
      setTotalQuestions(response.data.total)
    } catch (error) {
      toast.error('Failed to load questions')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value })
    setCurrentPage(1)
  }

  const handleCreateQuestion = () => {
    setSelectedQuestion(null)
    setEditorOpen(true)
  }

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question)
    setEditorOpen(true)
    handleMenuClose()
  }

  const handleDeleteQuestion = (question) => {
    setQuestionToDelete(question)
    setDeleteDialogOpen(true)
    handleMenuClose()
  }

  const confirmDelete = async () => {
    try {
      await questionsAPI.deleteQuestion(questionToDelete.id)
      toast.success('Question deleted successfully')
      fetchQuestions()
    } catch (error) {
      toast.error('Failed to delete question')
    } finally {
      setDeleteDialogOpen(false)
      setQuestionToDelete(null)
    }
  }

  const handleStatusChange = async (question, newStatus) => {
    try {
      await questionsAPI.updateQuestionStatus(question.id, newStatus)
      toast.success(`Question status changed to ${newStatus}`)
      fetchQuestions()
    } catch (error) {
      toast.error('Failed to update question status')
    }
    handleMenuClose()
  }

  const handleMenuClick = (event, question) => {
    setMenuAnchor(event.currentTarget)
    setMenuQuestion(question)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setMenuQuestion(null)
  }

  const getStatusColor = (status) => {
    return status === 'prod' ? 'success' : 'warning'
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'default'
    }
  }

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading && questions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Questions</Typography>
        {canEdit() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateQuestion}
          >
            Add Question
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Subject"
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Topic"
            value={filters.topic}
            onChange={(e) => handleFilterChange('topic', e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
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
        {canEdit() && (
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
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
        )}
      </Grid>

      {/* Questions Grid */}
      {questions.length === 0 ? (
        <Alert severity="info">
          No questions found. {canEdit() ? 'Try adjusting your filters or create a new question.' : 'Try adjusting your filters.'}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {questions.map((question) => (
            <Grid item xs={12} md={6} lg={4} key={question.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box>
                      <Chip
                        label={question.status.toUpperCase()}
                        color={getStatusColor(question.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={question.difficulty.toUpperCase()}
                        color={getDifficultyColor(question.difficulty)}
                        size="small"
                      />
                    </Box>
                    {canEdit() && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, question)}
                      >
                        <MoreVert />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    {question.subject}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {question.topic}
                  </Typography>
                  
                  <Box sx={{ mt: 2, minHeight: 100 }}>
                    <LaTeXRenderer content={truncateText(question.question)} />
                  </Box>
                  
                  {question.attachment_filename && (
                    <Chip
                      label={`📎 ${question.attachment_filename}`}
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                
                <CardActions>
                  <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                    ID: {question.id}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalQuestions > pageSize && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(totalQuestions / pageSize)}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditQuestion(menuQuestion)}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        {menuQuestion?.status === 'devmt' && (
          <MenuItem onClick={() => handleStatusChange(menuQuestion, 'prod')}>
            <PlayArrow fontSize="small" sx={{ mr: 1 }} />
            Set to Production
          </MenuItem>
        )}
        {menuQuestion?.status === 'prod' && (
          <MenuItem onClick={() => handleStatusChange(menuQuestion, 'devmt')}>
            <Pause fontSize="small" sx={{ mr: 1 }} />
            Set to Development
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDeleteQuestion(menuQuestion)}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Question Editor Dialog */}
      <QuestionEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        question={selectedQuestion}
        onSave={fetchQuestions}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this question? This action cannot be undone.
          </Typography>
          {questionToDelete && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {questionToDelete.subject} - {questionToDelete.topic}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuestionsPage