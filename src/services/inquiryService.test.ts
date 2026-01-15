import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { getInquiries, updateInquiry } from './inquiryService'
import { InquiryStatus } from '../types/inquiry'

vi.mock('axios')

const mockedAxios = axios as unknown as { get: any; patch: any }

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
})
