import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

// Basic smoke test updated for routing/login presence
describe('App', () => {
  it('renders login when unauthenticated', () => {
    render(<App />)
    expect(screen.getByText(/Login/i)).toBeInTheDocument()
  })
})
