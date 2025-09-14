import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import { Box, Typography } from '@mui/material'

const LaTeXRenderer = ({ content, inline = false }) => {
  if (!content) return null

  // Simple LaTeX detection - looks for $ or $$ delimiters
  const renderContent = () => {
    if (typeof content !== 'string') {
      return <Typography>{String(content)}</Typography>
    }

    // Split content by LaTeX delimiters
    const parts = []
    let remaining = content
    let key = 0

    while (remaining.length > 0) {
      // Look for block math ($$...$$)
      const blockStart = remaining.indexOf('$$')
      if (blockStart !== -1) {
        // Add text before block math
        if (blockStart > 0) {
          parts.push(
            <span key={key++}>{remaining.substring(0, blockStart)}</span>
          )
        }
        
        // Find end of block math
        const blockEnd = remaining.indexOf('$$', blockStart + 2)
        if (blockEnd !== -1) {
          const latex = remaining.substring(blockStart + 2, blockEnd)
          try {
            parts.push(
              <BlockMath key={key++} math={latex} />
            )
          } catch (error) {
            parts.push(
              <span key={key++} style={{ color: 'red' }}>
                [LaTeX Error: {latex}]
              </span>
            )
          }
          remaining = remaining.substring(blockEnd + 2)
          continue
        }
      }

      // Look for inline math ($...$)
      const inlineStart = remaining.indexOf('$')
      if (inlineStart !== -1 && inlineStart !== blockStart) {
        // Add text before inline math
        if (inlineStart > 0) {
          parts.push(
            <span key={key++}>{remaining.substring(0, inlineStart)}</span>
          )
        }
        
        // Find end of inline math
        const inlineEnd = remaining.indexOf('$', inlineStart + 1)
        if (inlineEnd !== -1) {
          const latex = remaining.substring(inlineStart + 1, inlineEnd)
          try {
            parts.push(
              <InlineMath key={key++} math={latex} />
            )
          } catch (error) {
            parts.push(
              <span key={key++} style={{ color: 'red' }}>
                [LaTeX Error: {latex}]
              </span>
            )
          }
          remaining = remaining.substring(inlineEnd + 1)
          continue
        }
      }

      // No more LaTeX found, add remaining text
      if (remaining.length > 0) {
        parts.push(<span key={key++}>{remaining}</span>)
      }
      break
    }

    return parts.length > 0 ? parts : <span>{content}</span>
  }

  return (
    <Box sx={{ 
      '& .katex': { fontSize: 'inherit' },
      '& .katex-display': { margin: '0.5em 0' }
    }}>
      {renderContent()}
    </Box>
  )
}

export default LaTeXRenderer