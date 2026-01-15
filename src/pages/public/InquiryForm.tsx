import React, { useState } from 'react'
import { validate as validateEmail } from 'email-validator'
import { createInquiry } from '../../services/inquiryService'
import type { CreateInquiryRequest } from '../../types/inquiry'

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'title' | 'content', string>>

export default function InquiryForm(): React.ReactElement {
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [successInquiryId, setSuccessInquiryId] = useState<string | null>(null)

  const validate = (): boolean => {
    const errs: FieldErrors = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!validateEmail(email)) errs.email = 'Email is invalid'
    if (!phone.trim()) errs.phone = 'Phone is required'
    if (!title.trim()) errs.title = 'Title is required'
    if (!content.trim()) errs.content = 'Content is required'

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const clearForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setTitle('')
    setContent('')
    setFieldErrors({})
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validate()) return

    setLoading(true)
    try {
      const payload: CreateInquiryRequest = { name, email, phone, title, content }
      const created = await createInquiry(payload)
      setSuccessInquiryId(created.id)
      clearForm()
    } catch (errUnknown) {
      console.error('InquiryForm:', errUnknown)
      setError('Failed to submit inquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (successInquiryId) {
    return (
      <main>
        <h1>Inquiry submitted</h1>
        <p>Inquiry submitted successfully. ID: {successInquiryId}</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Submit an Inquiry</h1>
      <form onSubmit={handleSubmit} aria-label="inquiry-form">
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="name-input"
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name && (
            <div role="alert" style={{ color: 'red' }}>{fieldErrors.name}</div>
          )}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="email-input"
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && (
            <div role="alert" style={{ color: 'red' }}>{fieldErrors.email}</div>
          )}
        </div>

        <div>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-label="phone-input"
            aria-invalid={!!fieldErrors.phone}
          />
          {fieldErrors.phone && (
            <div role="alert" style={{ color: 'red' }}>{fieldErrors.phone}</div>
          )}
        </div>

        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="title-input"
            aria-invalid={!!fieldErrors.title}
          />
          {fieldErrors.title && (
            <div role="alert" style={{ color: 'red' }}>{fieldErrors.title}</div>
          )}
        </div>

        <div>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label="content-input"
            aria-invalid={!!fieldErrors.content}
          />
          {fieldErrors.content && (
            <div role="alert" style={{ color: 'red' }}>{fieldErrors.content}</div>
          )}
        </div>

        {error && (
          <div role="alert" style={{ color: 'red' }}>{error}</div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </main>
  )
}
