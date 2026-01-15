import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InquiryCard from './InquiryCard'
import { InquiryStatus } from '../../types/inquiry'
import { MemoryRouter } from 'react-router-dom'

// Mock dnd-kit sortable hook to avoid DOM drag complexities in unit tests
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    setNodeRef: () => {},
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

    render(
      <MemoryRouter>
        <InquiryCard inquiry={inquiry} />
      </MemoryRouter>
    )

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

    render(
      <MemoryRouter>
        <InquiryCard inquiry={inquiry} />
      </MemoryRouter>
    )

    expect(screen.getByText('No one assigned')).toBeInTheDocument()
    expect(screen.queryByText(/Assignee:/i)).toBeNull()
  })

  it('renders a view link to the inquiry detail', () => {
    const inquiry = {
      id: 'abc',
      title: 'Help needed',
      status: InquiryStatus.NEW,
      assignee: 'John',
      badges: ['urgent'],
    }

    render(
      <MemoryRouter>
        <InquiryCard inquiry={inquiry} />
      </MemoryRouter>
    )

    const link = screen.getByLabelText(`view-inquiry-${inquiry.id}`)
    expect(link).toBeInTheDocument()
    // href in jsdom is absolute, ensure it ends with expected path
    expect((link as HTMLAnchorElement).href.endsWith(`/admin/inquiries/${inquiry.id}`)).toBeTruthy()
  })
})
