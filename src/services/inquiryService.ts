import axios from 'axios'
import type { Inquiry, InquiryStatus, CreateInquiryRequest, InquiryDetail, Message } from '../types/inquiry'

export async function createInquiry(data: CreateInquiryRequest): Promise<Inquiry> {
  try {
    const url = `${import.meta.env.VITE_API_URL}/inquiries`
    const res = await axios.post(url, data)
    return res.data as Inquiry
  } catch (error) {
    console.error('inquiryService.createInquiry:', error)
    throw error
  }
}

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

export async function getInquiry(id: string): Promise<InquiryDetail> {
  try {
    const url = `${import.meta.env.VITE_API_URL}/inquiries/${id}`
    const res = await axios.get(url)
    return res.data as InquiryDetail
  } catch (error) {
    console.error('inquiryService.getInquiry:', error)
    throw error
  }
}

export async function replyInquiry(id: string, content: string): Promise<Message> {
  try {
    const url = `${import.meta.env.VITE_API_URL}/inquiries/${id}/reply`
    const res = await axios.post(url, { content })
    return res.data as Message
  } catch (error) {
    console.error('inquiryService.replyInquiry:', error)
    throw error
  }
}
