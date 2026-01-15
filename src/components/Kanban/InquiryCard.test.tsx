import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import InquiryCard from './InquiryCard'
import { InquiryStatus } from '../../types/inquiry'

describe('InquiryCard', () => {
  it('renders title, badges, assignee and draggable attributes', () => {
    const inquiry = {
      id: 'abc',
      title: 'Help needed',
      status: InquiryStatus.NEW,
      assignee: 'John',
      badges: ['urgent', 'billing'],
    }

    render(<InquiryCard inquiry={inquiry} />)

    expect(screen.getByText('Help needed')).toBeInTheDocument()
    expect(screen.getByText('urgent')).toBeInTheDocument()
    expect(screen.getByText('billing')).toBeInTheDocument()
    expect(screen.getByText(/Assignee:/i)).toHaveTextContent('Assignee: John')

    const article = screen.getByLabelText(`inquiry-card-${inquiry.id}`)
    expect(article).toHaveAttribute('draggable', 'true')
    expect(article).toHaveAttribute('data-inquiry-id', inquiry.id)
  })

  it('renders without assignee when not provided', () => {
    const inquiry = {
      id: 'no-assignee',
      title: 'No one assigned',
      status: InquiryStatus.NEW,
      badges: [],
    } as any

    render(<InquiryCard inquiry={inquiry} />)

    expect(screen.getByText('No one assigned')).toBeInTheDocument()
    expect(screen.queryByText(/Assignee:/i)).toBeNull()
  })
})
