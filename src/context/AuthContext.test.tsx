import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as authService from '../services/authService'
import { AuthProvider, useAuth } from './AuthContext'

function TestConsumer() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()

  return (
    <div>
      <div>user-email:{user?.email ?? 'none'}</div>
      <div>auth:{isAuthenticated ? 'yes' : 'no'}</div>
      <div>loading:{isLoading ? 'yes' : 'no'}</div>
      <button onClick={() => void login('a@b.com', 'pwd')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders children', () => {
    render(
      <AuthProvider>
        <div>child</div>
      </AuthProvider>,
    )

    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('login updates state and localStorage', async () => {
    const spy = vi.spyOn(authService, 'login').mockResolvedValue({ token: 't', user: { email: 'a@b.com' } })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    fireEvent.click(screen.getByText('login'))

    await waitFor(() => expect(screen.getByText('user-email:a@b.com')).toBeInTheDocument())
    expect(screen.getByText('auth:yes')).toBeInTheDocument()
    expect(localStorage.getItem('auth_token')).toBe('t')
    expect(localStorage.getItem('auth_user')).toBe(JSON.stringify({ email: 'a@b.com' }))

    spy.mockRestore()
  })

  it('logout clears state and localStorage', async () => {
    const spy = vi.spyOn(authService, 'login').mockResolvedValue({ token: 't', user: { email: 'a@b.com' } })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    fireEvent.click(screen.getByText('login'))
    await waitFor(() => expect(screen.getByText('user-email:a@b.com')).toBeInTheDocument())

    fireEvent.click(screen.getByText('logout'))

    await waitFor(() => expect(screen.getByText('user-email:none')).toBeInTheDocument())
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('auth_user')).toBeNull()

    spy.mockRestore()
  })

  it('restores session from localStorage on mount', async () => {
    localStorage.setItem('auth_token', 'tok')
    localStorage.setItem('auth_user', JSON.stringify({ email: 's@e.com' }))

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByText('user-email:s@e.com')).toBeInTheDocument())
    expect(screen.getByText('auth:yes')).toBeInTheDocument()
  })
})
