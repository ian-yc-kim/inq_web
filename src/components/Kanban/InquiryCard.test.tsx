import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import InquiryCard from './InquiryCard'
import { InquiryStatus } from '../../types/inquiry'

// Mock dnd-kit sortable hook to avoid DOM drag complexities in unit tests
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    setNodeRef: (el: any) => {},
    attributes: {},
    listeners: {},
    transform: null,
    transition: undefined,
  }),
}))

describe('InquiryCard', () => {
  it('renders title, badges and assignee', () => {
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
