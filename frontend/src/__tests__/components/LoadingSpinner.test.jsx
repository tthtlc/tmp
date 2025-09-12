import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../../components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('generic')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('w-6', 'h-6')
  })

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />)
    const spinner = screen.getByRole('generic')
    expect(spinner).toHaveClass('w-4', 'h-4')
  })

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByRole('generic')
    expect(spinner).toHaveClass('w-8', 'h-8')
  })

  it('renders with extra large size', () => {
    render(<LoadingSpinner size="xl" />)
    const spinner = screen.getByRole('generic')
    expect(spinner).toHaveClass('w-12', 'h-12')
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    const spinner = screen.getByRole('generic')
    expect(spinner).toHaveClass('custom-class')
  })

  it('has spinning animation', () => {
    render(<LoadingSpinner />)
    const spinnerInner = document.querySelector('.animate-spin')
    expect(spinnerInner).toBeInTheDocument()
  })
})