import axios from 'axios'
import type { LoginResponse } from '../types/auth'

const USE_MOCK_AUTH = true

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    if (USE_MOCK_AUTH) {
      // Simulate network delay for mock
      await new Promise((r) => setTimeout(r, 50))
      return { token: 'mock-jwt', user: { email } }
    }

    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password })
    return res.data as LoginResponse
  } catch (error) {
    console.error('authService.login:', error)
    throw error
  }
}
