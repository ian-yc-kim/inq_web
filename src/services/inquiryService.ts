import axios from 'axios'
import type { Inquiry, InquiryStatus } from '../types/inquiry'

export async function getInquiries(): Promise<Inquiry[]> {
  try {
    const url = `${import.meta.env.VITE_API_URL}/inquiries`
    const res = await axios.get(url)
    return res.data as Inquiry[]
  } catch (error) {
    console.error('inquiryService.getInquiries:', error)
    throw error
  }
}

export async function updateInquiry(id: string, status: InquiryStatus): Promise<Inquiry> {
  try {
    const url = `${import.meta.env.VITE_API_URL}/inquiries/${id}`
    const res = await axios.patch(url, { status })
    return res.data as Inquiry
  } catch (error) {
    console.error('inquiryService.updateInquiry:', error)
    throw error
  }
}
