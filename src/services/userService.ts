import axios from 'axios'
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user'

function getAuthHeaders(): { Authorization: string } {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Missing auth token')
    }
    return { Authorization: `Bearer ${token}` }
  } catch (error) {
    console.error('userService.getAuthHeaders:', error)
    throw error
  }
}

const BASE = `${import.meta.env.VITE_API_URL}`

export async function getUsers(): Promise<User[]> {
  try {
    const url = `${BASE}/api/users`
    const res = await axios.get(url, { headers: getAuthHeaders() })
    return res.data as User[]
  } catch (error) {
    console.error('userService.getUsers:', error)
    throw error
  }
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  try {
    const url = `${BASE}/api/users`
    const res = await axios.post(url, data, { headers: getAuthHeaders() })
    return res.data as User
  } catch (error) {
    console.error('userService.createUser:', error)
    throw error
  }
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
  try {
    const url = `${BASE}/api/users/${id}`
    const res = await axios.put(url, data, { headers: getAuthHeaders() })
    return res.data as User
  } catch (error) {
    console.error('userService.updateUser:', error)
    throw error
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    const url = `${BASE}/api/users/${id}`
    await axios.delete(url, { headers: getAuthHeaders() })
  } catch (error) {
    console.error('userService.deleteUser:', error)
    throw error
  }
}
