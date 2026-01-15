import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { getInquiries, updateInquiry, createInquiry, getInquiry, replyInquiry } from './inquiryService'
import { InquiryStatus } from '../types/inquiry'

vi.mock('axios')

const mockedAxios = axios as unknown as { get: any; patch: any; post: any }

describe('inquiryService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('getInquiries returns array of inquiries', async () => {
    const fake = [
      { id: '1', title: 'T1', status: InquiryStatus.NEW, badges: ['a'] },
    ]
    mockedAxios.get = vi.fn().mockResolvedValue({ data: fake })

    const res = await getInquiries()

    expect(mockedAxios.get).toHaveBeenCalled()
    expect(res).toEqual(fake)
  })

  it('updateInquiry patches and returns updated inquiry', async () => {
    const updated = { id: '1', title: 'T1', status: InquiryStatus.ON_HOLD, badges: [] }
    mockedAxios.patch = vi.fn().mockResolvedValue({ data: updated })

    const res = await updateInquiry('1', InquiryStatus.ON_HOLD)

    expect(mockedAxios.patch).toHaveBeenCalled()
    expect(res).toEqual(updated)
  })

  it('getInquiries throws on error', async () => {
    mockedAxios.get = vi.fn().mockRejectedValue(new Error('network'))
    await expect(getInquiries()).rejects.toThrow()
  })

  it('createInquiry posts data and returns created inquiry on success', async () => {
    const payload = { name: 'Alice', email: 'a@example.com', phone: '123', title: 'Hi', content: 'Hello' }
    const createdInquiry = { id: '2', title: payload.title, status: InquiryStatus.NEW, badges: [] }

    mockedAxios.post = vi.fn().mockResolvedValue({ data: createdInquiry })

    const res = await createInquiry(payload)

    const expectedUrl = `${import.meta.env.VITE_API_URL}/inquiries`
    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
    expect(mockedAxios.post).toHaveBeenCalledWith(expectedUrl, payload)
    expect(res).toEqual(createdInquiry)
  })

  it('createInquiry throws when post fails', async () => {
    const payload = { name: 'Bob', email: 'b@example.com', phone: '456', title: 'Help', content: 'Please' }
    mockedAxios.post = vi.fn().mockRejectedValue(new Error('network'))

    await expect(createInquiry(payload)).rejects.toThrow()
  })

  // New tests for getInquiry and replyInquiry
  it('getInquiry calls correct api url and returns detail', async () => {
    const fakeDetail = {
      id: '123',
      title: 'Detail',
      status: InquiryStatus.NEW,
      badges: [],
      content: 'Full content',
      email: 'c@example.com',
      name: 'Customer',
      createdAt: '2025-01-01T00:00:00Z',
      messages: [{ id: 'm1', content: 'Hello', sender: 'customer', createdAt: '2025-01-01T00:00:00Z' }],
    }

    mockedAxios.get = vi.fn().mockResolvedValue({ data: fakeDetail })

    const res = await getInquiry('123')

    const expectedUrl = `${import.meta.env.VITE_API_URL}/inquiries/123`
    expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl)
    expect(res).toEqual(fakeDetail)
  })

  it('getInquiry propagates errors', async () => {
    mockedAxios.get = vi.fn().mockRejectedValue(new Error('network'))
    await expect(getInquiry('123')).rejects.toThrow()
  })

  it('replyInquiry posts reply and returns created message', async () => {
    const fakeMessage = { id: 'm2', content: 'Thanks', sender: 'staff', createdAt: '2025-01-02T00:00:00Z' }
    mockedAxios.post = vi.fn().mockResolvedValue({ data: fakeMessage })

    const res = await replyInquiry('123', 'Thanks')

    const expectedUrl = `${import.meta.env.VITE_API_URL}/inquiries/123/reply`
    expect(mockedAxios.post).toHaveBeenCalledWith(expectedUrl, { content: 'Thanks' })
    expect(res).toEqual(fakeMessage)
  })

  it('replyInquiry propagates errors', async () => {
    mockedAxios.post = vi.fn().mockRejectedValue(new Error('network'))
    await expect(replyInquiry('123', 'Hello')).rejects.toThrow()
  })
})
