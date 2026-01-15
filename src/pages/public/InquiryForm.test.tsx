import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as inquiryService from '../../services/inquiryService'
import InquiryForm from './InquiryForm'
import { InquiryStatus } from '../../types/inquiry'

describe('InquiryForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all fields and submit button', () => {
    render(<InquiryForm />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields and does not call service', async () => {
    const spy = vi.spyOn(inquiryService, 'createInquiry')
    const user = userEvent.setup()
    render(<InquiryForm />)

    await user.click(screen.getByRole('button', { name: /submit/i }))

    // wait for validation messages to appear after state update
    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/Phone is required/i)).toBeInTheDocument()
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/Content is required/i)).toBeInTheDocument()
    })

    expect(spy).not.toHaveBeenCalled()
  })

  it('shows email invalid error for bad email and does not call service', async () => {
    const spy = vi.spyOn(inquiryService, 'createInquiry')
    const user = userEvent.setup()
    render(<InquiryForm />)

    await user.type(screen.getByLabelText(/name/i), 'Alice')
    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.type(screen.getByLabelText(/phone/i), '123')
    await user.type(screen.getByLabelText(/title/i), 'Hello')
    await user.type(screen.getByLabelText(/content/i), 'Content')

    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/Email is invalid/i)).toBeInTheDocument()
    })

    expect(spy).not.toHaveBeenCalled()
  })

  it('submits successfully and shows success message', async () => {
    const created = { id: 'inq_123', title: 'Hello', status: InquiryStatus.NEW, badges: [] }
    const spy = vi.spyOn(inquiryService, 'createInquiry').mockResolvedValue(created as any)

    const user = userEvent.setup()
    render(<InquiryForm />)

    await user.type(screen.getByLabelText(/name/i), 'Alice')
    await user.type(screen.getByLabelText(/email/i), 'a@example.com')
    await user.type(screen.getByLabelText(/phone/i), '123')
    await user.type(screen.getByLabelText(/title/i), 'Hello')
    await user.type(screen.getByLabelText(/content/i), 'Content')

    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/Inquiry submitted successfully/i)).toBeInTheDocument()
      expect(screen.getByText(/inq_123/i)).toBeInTheDocument()
    })

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('shows generic error on submission failure', async () => {
    const spy = vi.spyOn(inquiryService, 'createInquiry').mockRejectedValue(new Error('fail'))
    const user = userEvent.setup()
    render(<InquiryForm />)

    await user.type(screen.getByLabelText(/name/i), 'Bob')
    await user.type(screen.getByLabelText(/email/i), 'b@example.com')
    await user.type(screen.getByLabelText(/phone/i), '456')
    await user.type(screen.getByLabelText(/title/i), 'Help')
    await user.type(screen.getByLabelText(/content/i), 'Please')

    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/Failed to submit inquiry/i)).toBeInTheDocument()
    })

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
