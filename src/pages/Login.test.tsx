import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, vi, beforeEach, expect } from 'vitest'
import * as authService from '../services/authService'
import { AuthProvider } from '../context/AuthContext'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'
import Board from './Board'

describe('Login page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('renders form correctly', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('updates inputs on user typing', async () => {
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    await user.type(emailInput, 'test@x.com')
    await user.type(passwordInput, 'mypassword')

    expect(emailInput.value).toBe('test@x.com')
    expect(passwordInput.value).toBe('mypassword')
  })

  it('calls login and navigates to board on success', async () => {
    const spy = vi.spyOn(authService, 'login').mockResolvedValue({ token: 't', user: { email: 'a@b.com' } })

    const user = userEvent.setup()
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/board" element={<Board />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    const submitBtn = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'a@b.com')
    await user.type(passwordInput, 'pwd')
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Inquiry Board/i)).toBeInTheDocument()
    })

    expect(spy).toHaveBeenCalledWith('a@b.com', 'pwd')
    spy.mockRestore()
  })

  it('shows error on failed login', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue(new Error('invalid'))

    const user = userEvent.setup()
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    const submitBtn = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'bad@x.com')
    await user.type(passwordInput, 'wrong')
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password')
    })
  })
})
