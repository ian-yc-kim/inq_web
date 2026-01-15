import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { getUsers, createUser, updateUser, deleteUser } from './userService'
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user'

vi.mock('axios')

const mockedAxios = axios as unknown as { get: any; post: any; put: any; delete: any }

describe('userService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.setItem('auth_token', 'test-token')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('getUsers calls correct endpoint and returns users', async () => {
    const fake: User[] = [{ id: '1', email: 'a@example.com' }]
    mockedAxios.get = vi.fn().mockResolvedValue({ data: fake })

    const res = await getUsers()

    const expectedUrl = `${import.meta.env.VITE_API_URL}/api/users`
    expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl, { headers: { Authorization: 'Bearer test-token' } })
    expect(res).toEqual(fake)
  })

  it('createUser posts data and returns created user', async () => {
    const payload: CreateUserRequest = { email: 'b@example.com', password: 'pass', name: 'B' }
    const created: User = { id: '2', email: payload.email, name: 'B' }
    mockedAxios.post = vi.fn().mockResolvedValue({ data: created })

    const res = await createUser(payload)

    const expectedUrl = `${import.meta.env.VITE_API_URL}/api/users`
    expect(mockedAxios.post).toHaveBeenCalledWith(expectedUrl, payload, { headers: { Authorization: 'Bearer test-token' } })
    expect(res).toEqual(created)
  })

  it('updateUser puts data and returns updated user', async () => {
    const id = '3'
    const payload: UpdateUserRequest = { name: 'C' }
    const updated: User = { id, email: 'c@example.com', name: 'C' }
    mockedAxios.put = vi.fn().mockResolvedValue({ data: updated })

    const res = await updateUser(id, payload)

    const expectedUrl = `${import.meta.env.VITE_API_URL}/api/users/${id}`
    expect(mockedAxios.put).toHaveBeenCalledWith(expectedUrl, payload, { headers: { Authorization: 'Bearer test-token' } })
    expect(res).toEqual(updated)
  })

  it('deleteUser calls delete endpoint', async () => {
    const id = '4'
    mockedAxios.delete = vi.fn().mockResolvedValue({ data: {} })

    await deleteUser(id)

    const expectedUrl = `${import.meta.env.VITE_API_URL}/api/users/${id}`
    expect(mockedAxios.delete).toHaveBeenCalledWith(expectedUrl, { headers: { Authorization: 'Bearer test-token' } })
  })

  it('throws Missing auth token when token absent', async () => {
    localStorage.removeItem('auth_token')
    mockedAxios.get = vi.fn()

    await expect(getUsers()).rejects.toThrow('Missing auth token')
    expect(mockedAxios.get).not.toHaveBeenCalled()
  })
})
