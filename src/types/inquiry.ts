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
