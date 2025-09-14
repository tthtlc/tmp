import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
} from '@mui/material'
import { CloudUpload, CheckCircle, Error } from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import { questionsAPI } from '../services/api'
import { toast } from 'react-toastify'

const ImportPage = () => {
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [previewData, setPreviewData] = useState(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setImportFile(file)
        previewFile(file)
      }
    }
  })

  const previewFile = async (file) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (data.questions && Array.isArray(data.questions)) {
        setPreviewData(data.questions.slice(0, 3)) // Show first 3 questions as preview
      } else {
        toast.error('Invalid JSON format. Expected {"questions": [...]}')
        setImportFile(null)
      }
    } catch (error) {
      toast.error('Invalid JSON file')
      setImportFile(null)
    }
  }

  const handleImport = async () => {
    if (!importFile) return

    try {
      setImporting(true)
      const response = await questionsAPI.importQuestions(importFile)
      setImportResult({
        success: true,
        message: response.data.message
      })
      toast.success('Import completed successfully')
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Import failed'
      setImportResult({
        success: false,
        message: errorMessage
      })
      toast.error(errorMessage)
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setImportFile(null)
    setPreviewData(null)
    setImportResult(null)
  }

  const exampleFormat = {
    questions: [
      {
        subject: "Mathematics",
        topic: "Algebra",
        question: "Solve for $x$: $2x + 5 = 13$",
        difficulty: "easy",
        attachment: "algebra_example.png"
      },
      {
        subject: "Physics",
        topic: "Mechanics",
        question: "Calculate the velocity using the formula: $$v = u + at$$",
        difficulty: "medium",
        attachment: null
      }
    ]
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Import Questions
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload a JSON file containing questions to import into the database.
      </Typography>

      <Box sx={{ mb: 4 }}>
        {/* File Upload Area */}
        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
            mb: 3,
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          {isDragActive ? (
            <Typography variant="h6">Drop the JSON file here...</Typography>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Drag and drop a JSON file here, or click to select
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Only .json files are accepted
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Selected File Info */}
        {importFile && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Selected file: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
          </Alert>
        )}

        {/* Preview */}
        {previewData && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview (First 3 Questions)
              </Typography>
              <List>
                {previewData.map((question, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={`${question.subject} - ${question.topic}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Difficulty: {question.difficulty}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {question.question.substring(0, 100)}...
                            </Typography>
                            {question.attachment && (
                              <Typography variant="caption" color="primary">
                                📎 {question.attachment}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < previewData.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Import Controls */}
        {importFile && (
          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={importing}
              startIcon={importing ? null : <CheckCircle />}
            >
              {importing ? 'Importing...' : 'Import Questions'}
            </Button>
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
          </Box>
        )}

        {/* Progress */}
        {importing && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Processing questions...
            </Typography>
          </Box>
        )}

        {/* Import Result */}
        {importResult && (
          <Alert 
            severity={importResult.success ? 'success' : 'error'} 
            sx={{ mb: 3 }}
            icon={importResult.success ? <CheckCircle /> : <Error />}
          >
            {importResult.message}
          </Alert>
        )}
      </Box>

      {/* JSON Format Example */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Expected JSON Format
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your JSON file should follow this structure:
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
            {JSON.stringify(exampleFormat, null, 2)}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Field Requirements:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="subject" 
                  secondary="Required. The subject area of the question"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="topic" 
                  secondary="Required. The specific topic within the subject"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="question" 
                  secondary="Required. The question content (LaTeX supported with $ and $$ delimiters)"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="difficulty" 
                  secondary="Required. Must be 'easy', 'medium', or 'hard'"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="attachment" 
                  secondary="Optional. Filename of an image attachment"
                />
              </ListItem>
            </List>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ImportPage