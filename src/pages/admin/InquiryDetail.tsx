import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import type { InquiryDetail, Message } from '../../types/inquiry'
import * as inquiryService from '../../services/inquiryService'
import * as socketService from '../../services/socketService'

export default function InquiryDetail(): React.ReactElement {
  const { id } = useParams() as { id?: string }
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<string>('')
  const [isReplying, setIsReplying] = useState<boolean>(false)

  const loadInquiry = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await inquiryService.getInquiry(id)
      setInquiry(res)
    } catch (err) {
      console.error('InquiryDetail:', err)
      setError('Failed to load inquiry')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    let mounted = true
    if (!id) {
      setError('Missing inquiry id')
      return
    }

    void (async () => {
      if (!mounted) return
      await loadInquiry()
    })()

    return () => {
      mounted = false
    }
  }, [id, loadInquiry])

  useEffect(() => {
    // Only depend on id to avoid unnecessary reconnects when loadInquiry identity changes
    try {
      socketService.connect()
      const unsub = socketService.subscribe((updated) => {
        try {
          if (!id) return
          if (updated.id === id) {
            // Fetch fresh data directly to avoid re-subscribing when loadInquiry changes
            void (async () => {
              try {
                const res = await inquiryService.getInquiry(id)
                setInquiry(res)
              } catch (e) {
                console.error('InquiryDetail:', e)
              }
            })()
          }
        } catch (e) {
          console.error('InquiryDetail:', e)
        }
      })

      return () => {
        try {
          // Only unsubscribe here. Do not disconnect the shared socket service.
          unsub()
        } catch (e) {
          console.error('InquiryDetail:', e)
        }
      }
    } catch (e) {
      console.error('InquiryDetail:', e)
    }
  }, [id])

  const handleSend = async () => {
    if (!id) return
    const content = replyText.trim()
    if (!content) return

    setIsReplying(true)
    try {
      const created = await inquiryService.replyInquiry(id, content)
      setReplyText('')
      setInquiry((prev) => {
        if (!prev) return prev
        return { ...prev, messages: [...prev.messages, created] }
      })
    } catch (err) {
      console.error('InquiryDetail:', err)
      setError('Failed to send reply')
    } finally {
      setIsReplying(false)
    }
  }

  if (!id) {
    return (
      <main>
        <h1>Inquiry Detail</h1>
        <div role="alert">Missing inquiry id</div>
      </main>
    )
  }

  return (
    <main>
      <h1>Inquiry Detail</h1>

      {isLoading && <div>Loading...</div>}
      {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}

      {inquiry && (
        <section>
          <header style={{ marginBottom: 12 }}>
            <h2>{inquiry.title}</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ padding: '4px 8px', background: '#eef', borderRadius: 8 }}>{inquiry.status}</span>
              <div style={{ color: '#555' }}>{inquiry.name} &lt;{inquiry.email}&gt;</div>
            </div>
          </header>

          <article style={{ border: '1px solid #eee', padding: 12, borderRadius: 6, marginBottom: 12 }}>
            <h3>Content</h3>
            <p>{inquiry.content}</p>
          </article>

          <section aria-label="message-list" style={{ marginBottom: 12 }}>
            <h3>Messages</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inquiry.messages.length === 0 && <div>No messages</div>}
              {inquiry.messages.map((m: Message) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.sender === 'staff' ? 'flex-end' : 'flex-start',
                    background: m.sender === 'staff' ? '#e6ffed' : '#f5f5f5',
                    padding: 8,
                    borderRadius: 8,
                    maxWidth: '80%',
                  }}
                >
                  <div style={{ fontSize: 13, color: '#333' }}>{m.content}</div>
                  <div style={{ fontSize: 11, color: '#777', marginTop: 6 }}>{m.sender} - {m.createdAt}</div>
                </div>
              ))}
            </div>
          </section>

          <section aria-label="reply-area" style={{ marginTop: 12 }}>
            <h3>Reply</h3>
            <div>
              <textarea
                aria-label="reply-textarea"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <button aria-label="send-reply" onClick={handleSend} disabled={isReplying}>{isReplying ? 'Sending...' : 'Send Reply'}</button>
            </div>
          </section>
        </section>
      )}
    </main>
  )
}
