import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, vi, beforeEach, expect } from 'vitest'

vi.mock('../../services/userService')
vi.mock('../../services/inquiryService')
vi.mock('../../services/socketService')
import * as userService from '../../services/userService'
import * as inquiryService from '../../services/inquiryService'
import * as socketService from '../../services/socketService'
import App from '../../App'

describe('Routing and navigation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('redirects to login when accessing protected /admin/staff unauthenticated', async () => {
    // navigate to protected route
    window.history.pushState({}, '', '/admin/staff')

    render(<App />)

    await waitFor(() => expect(screen.getByText(/Login/i)).toBeInTheDocument())
  })

  it('navigates from board to staff management when authenticated', async () => {
    // mock users fetch used by StaffManagement
    ;(userService.getUsers as unknown as any).mockResolvedValue([])

    // ensure board dependencies are mocked to avoid network/socket side effects
    ;(inquiryService.getInquiries as unknown as any).mockResolvedValue([])
    ;(socketService.connect as unknown as any) = vi.fn()
    ;(socketService.subscribe as unknown as any) = vi.fn(() => () => {})
    ;(socketService.disconnect as unknown as any) = vi.fn()

    // simulate authenticated state
    localStorage.setItem('auth_token', 'mock-token')
    localStorage.setItem('auth_user', JSON.stringify({ email: 'a@b.com' }))

    window.history.pushState({}, '', '/board')

    const user = userEvent.setup()
    render(<App />)

    // board should render
    await waitFor(() => expect(screen.getByText(/Inquiry Board/i)).toBeInTheDocument())

    // click the staff management link
    await user.click(screen.getByLabelText('staff-mgmt-link'))

    // StaffManagement heading should appear
    await waitFor(() => expect(screen.getByText(/Staff Management/i)).toBeInTheDocument())
  })

  it('renders InquiryDetail for authenticated direct URL access', async () => {
    // simulate authenticated state
    localStorage.setItem('auth_token', 'mock-token')
    localStorage.setItem('auth_user', JSON.stringify({ email: 'a@b.com' }))

    const inquiry = {
      id: 'abc',
      title: 'Need help',
      status: 'NEW',
      name: 'Jane Doe',
      email: 'jane@example.com',
      content: 'Details here',
      messages: [],
    }

    ;(inquiryService.getInquiry as unknown as any).mockResolvedValue(inquiry)
    ;(socketService.subscribe as unknown as any).mockImplementation(() => () => {})

    window.history.pushState({}, '', '/admin/inquiries/abc')

    render(<App />)

    // Inquiry Detail page should render
    await waitFor(() => expect(screen.getByText(/Inquiry Detail/i)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('Need help')).toBeInTheDocument())
  })
})
