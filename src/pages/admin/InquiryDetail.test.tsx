import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, vi, beforeEach, expect } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

vi.mock('../../services/inquiryService')
vi.mock('../../services/socketService')

import * as inquiryService from '../../services/inquiryService'
import * as socketService from '../../services/socketService'
import InquiryDetail from './InquiryDetail'

const sampleDetail = {
  id: '123',
  title: 'Test Inquiry',
  status: 'NEW',
  badges: [],
  content: 'Initial content',
  email: 'c@example.com',
  name: 'Customer',
  createdAt: '2025-01-01T00:00:00Z',
  messages: [
    { id: 'm1', content: 'Hello', sender: 'customer', createdAt: '2025-01-01T00:00:00Z' },
  ],
}

describe('InquiryDetail page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and renders inquiry details', async () => {
    vi.spyOn(inquiryService, 'getInquiry').mockResolvedValue(sampleDetail as any)
    vi.spyOn(socketService, 'connect').mockImplementation(() => {})
    vi.spyOn(socketService, 'subscribe').mockImplementation(() => () => {})
    vi.spyOn(socketService, 'disconnect').mockImplementation(() => {})

    render(
      <MemoryRouter initialEntries={["/admin/inquiries/123"]}>
        <Routes>
          <Route path="/admin/inquiries/:id" element={<InquiryDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Test Inquiry')).toBeInTheDocument())
    expect(screen.getByText('Initial content')).toBeInTheDocument()
    expect(screen.getByText(/Customer/)).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('sends reply and appends new message', async () => {
    vi.spyOn(inquiryService, 'getInquiry').mockResolvedValue(sampleDetail as any)
    const newMsg = { id: 'm2', content: 'Thanks', sender: 'staff', createdAt: '2025-01-02T00:00:00Z' }
    vi.spyOn(inquiryService, 'replyInquiry').mockResolvedValue(newMsg as any)

    vi.spyOn(socketService, 'connect').mockImplementation(() => {})
    vi.spyOn(socketService, 'subscribe').mockImplementation(() => () => {})
    vi.spyOn(socketService, 'disconnect').mockImplementation(() => {})

    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={["/admin/inquiries/123"]}>
        <Routes>
          <Route path="/admin/inquiries/:id" element={<InquiryDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Test Inquiry')).toBeInTheDocument())

    const textarea = screen.getByLabelText('reply-textarea') as HTMLTextAreaElement
    await user.type(textarea, 'Thanks')
    const send = screen.getByLabelText('send-reply')
    await user.click(send)

    await waitFor(() => expect(inquiryService.replyInquiry).toHaveBeenCalledWith('123', 'Thanks'))
    await waitFor(() => expect(textarea.value).toBe(''))
    await waitFor(() => expect(screen.getByText('Thanks')).toBeInTheDocument())
  })

  it('websocket updates trigger reload only for matching id', async () => {
    const getMock = vi.fn().mockResolvedValue(sampleDetail)
    vi.spyOn(inquiryService, 'getInquiry').mockImplementation(getMock as any)

    let capturedCb: any = null
    vi.spyOn(socketService, 'connect').mockImplementation(() => {})
    vi.spyOn(socketService, 'subscribe').mockImplementation((cb: any) => {
      capturedCb = cb
      return () => {}
    })
    vi.spyOn(socketService, 'disconnect').mockImplementation(() => {})

    render(
      <MemoryRouter initialEntries={["/admin/inquiries/123"]}>
        <Routes>
          <Route path="/admin/inquiries/:id" element={<InquiryDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(getMock).toHaveBeenCalledTimes(1))

    // non-matching id should not trigger
    capturedCb && capturedCb({ id: '999' })
    // give microtask time
    await new Promise((r) => setTimeout(r, 0))
    expect(getMock).toHaveBeenCalledTimes(1)

    // matching id should trigger reload
    capturedCb && capturedCb({ id: '123' })
    await waitFor(() => expect(getMock).toHaveBeenCalledTimes(2))
  })
})
