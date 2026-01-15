import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { getInquiries, updateInquiry, createInquiry } from './inquiryService'
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
})
