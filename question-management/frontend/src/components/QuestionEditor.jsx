import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import Editor from '@monaco-editor/react'
import LaTeXRenderer from './LaTeXRenderer'
import { questionsAPI, filesAPI } from '../services/api'
import { toast } from 'react-toastify'

const QuestionEditor = ({ open, onClose, question = null, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      subject: '',
      topic: '',
      question: '',
      difficulty: 'medium',
      attachment_filename: '',
    }
  })

  const questionContent = watch('question')

  useEffect(() => {
    if (question) {
      reset({
        subject: question.subject || '',
        topic: question.topic || '',
        question: question.question || '',
        difficulty: question.difficulty || 'medium',
        attachment_filename: question.attachment_filename || '',
      })
    } else {
      reset({
        subject: '',
        topic: '',
        question: '',
        difficulty: 'medium',
        attachment_filename: '',
      })
    }
  }, [question, reset])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      if (question) {
        // Update existing question
        await questionsAPI.updateQuestion(question.id, data)
        toast.success('Question updated successfully')
      } else {
        // Create new question
        await questionsAPI.createQuestion(data)
        toast.success('Question created successfully')
      }
      
      onSave?.()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save question')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setUploadingFile(true)
      const response = await filesAPI.uploadFile(file)
      setValue('attachment_filename', response.data.filename)
      toast.success('File uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload file')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {question ? 'Edit Question' : 'Create New Question'}
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Subject and Topic */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="subject"
                control={control}
                rules={{ required: 'Subject is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Subject"
                    error={!!errors.subject}
                    helperText={errors.subject?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="topic"
                control={control}
                rules={{ required: 'Topic is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Topic"
                    error={!!errors.topic}
                    helperText={errors.topic?.message}
                  />
                )}
              />
            </Grid>

            {/* Difficulty */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Difficulty">
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            {/* File Upload */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={uploadingFile}
                  startIcon={uploadingFile && <CircularProgress size={16} />}
                  sx={{ mb: 1 }}
                >
                  {uploadingFile ? 'Uploading...' : 'Upload Attachment'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </Button>
                <Controller
                  name="attachment_filename"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Attachment Filename"
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Question Content Editor */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">
                    Question Content (LaTeX Supported)
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                </Box>
                
                {previewMode ? (
                  <Paper sx={{ p: 2, minHeight: 200, backgroundColor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Preview:
                    </Typography>
                    <LaTeXRenderer content={questionContent} />
                  </Paper>
                ) : (
                  <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                    <Controller
                      name="question"
                      control={control}
                      rules={{ required: 'Question content is required' }}
                      render={({ field }) => (
                        <Editor
                          height="300px"
                          defaultLanguage="markdown"
                          value={field.value}
                          onChange={(value) => field.onChange(value || '')}
                          options={{
                            minimap: { enabled: false },
                            wordWrap: 'on',
                            lineNumbers: 'on',
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                          }}
                        />
                      )}
                    />
                  </Box>
                )}
                
                {errors.question && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {errors.question.message}
                  </Alert>
                )}
              </Box>
            </Grid>

            {/* LaTeX Help */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="subtitle2" gutterBottom>
                  LaTeX Help:
                </Typography>
                <Typography variant="body2">
                  • Inline math: $x^2 + y^2 = z^2$
                </Typography>
                <Typography variant="body2">
                  • Block math: $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
                </Typography>
                <Typography variant="body2">
                  • Fractions: $\frac{a}{b}$ • Superscript: $x^2$ • Subscript: $x_1$
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? 'Saving...' : (question ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuestionEditor