import type { Inquiry } from '../types/inquiry'

let ws: WebSocket | null = null
const subscribers = new Set<(inquiry: Inquiry) => void>()
let isConnecting = false

type WSEvent = unknown

function isInquiryUpdatedEvent(obj: WSEvent): obj is { type: 'inquiry_updated'; payload: Inquiry } {
  if (!obj || typeof obj !== 'object') return false
  const o = obj as Record<string, unknown>
  if (o.type !== 'inquiry_updated') return false
  const payload = o.payload as unknown
  if (!payload || typeof payload !== 'object') return false
  const p = payload as Record<string, unknown>
  if (typeof p.id !== 'string') return false
  if (typeof p.title !== 'string') return false
  if (typeof p.status !== 'string') return false
  if (!Array.isArray(p.badges)) return false
  return true
}

export function connect(): void {
  try {
    const url = import.meta.env.VITE_WS_URL
    if (!url) {
      console.error('socketService.connect: VITE_WS_URL not set')
      return
    }

    if (ws || isConnecting) return
    isConnecting = true

    ws = new WebSocket(url)

    ws.onopen = () => {
      isConnecting = false
    }

    ws.onmessage = (ev: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(ev.data) as WSEvent
        if (isInquiryUpdatedEvent(parsed)) {
          const payload = parsed.payload
          subscribers.forEach((cb) => cb(payload))
        }
      } catch (err) {
        console.error('socketService.onmessage:', err)
      }
    }

    ws.onerror = (ev) => {
      // Errors handled minimally per action item
      console.error('socketService.onerror:', ev)
    }

    ws.onclose = () => {
      // ensure isConnecting is reset on any close so future connects can proceed
      ws = null
      isConnecting = false
    }
  } catch (error) {
    isConnecting = false
    console.error('socketService.connect:', error)
  }
}

export function disconnect(): void {
  try {
    if (!ws) return
    ws.onmessage = null
    ws.onopen = null
    ws.onerror = null
    ws.onclose = null
    try {
      ws.close()
    } catch (e) {
      console.error('socketService.disconnect:', e)
    }
    ws = null
    isConnecting = false
  } catch (error) {
    console.error('socketService.disconnect:', error)
  }
}

export function subscribe(callback: (inquiry: Inquiry) => void): () => void {
  subscribers.add(callback)
  return () => {
    subscribers.delete(callback)
  }
}
