export const InquiryStatus = {
  NEW: 'NEW',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
} as const

export type InquiryStatus = (typeof InquiryStatus)[keyof typeof InquiryStatus]

export interface Inquiry {
  id: string
  title: string
  status: InquiryStatus
  assignee?: string
  badges: string[]
}

export interface CreateInquiryRequest {
  name: string
  email: string
  phone: string
  title: string
  content: string
}

export interface Message {
  id: string
  content: string
  sender: 'customer' | 'staff'
  createdAt: string
}

export interface InquiryDetail extends Inquiry {
  content: string
  email: string
  name: string
  createdAt: string
  messages: Message[]
}
