import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, vi, beforeEach, expect } from 'vitest'

vi.mock('../../services/userService')
import * as userService from '../../services/userService'
import StaffManagement from './StaffManagement'
import type { User } from '../../types/user'

const sampleUsers: User[] = [
  { id: 'u1', email: 'a@example.com', name: 'A' },
  { id: 'u2', email: 'b@example.com', name: 'B' },
]

describe('StaffManagement', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders user list', async () => {
    ;(userService.getUsers as unknown as vi.Mock).mockResolvedValue(sampleUsers)

    render(<StaffManagement />)

    await waitFor(() => expect(screen.getByText('a@example.com')).toBeInTheDocument())
    expect(screen.getByText('u1')).toBeInTheDocument()
    expect(userService.getUsers).toHaveBeenCalled()
  })

  it('opens Add modal', async () => {
    ;(userService.getUsers as unknown as vi.Mock).mockResolvedValue([])
    const user = userEvent.setup()
    render(<StaffManagement />)

    await waitFor(() => expect(userService.getUsers).toHaveBeenCalled())

    await user.click(screen.getByLabelText('add-staff'))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('staff-email')).toBeInTheDocument()
    expect(screen.getByLabelText('staff-password')).toBeInTheDocument()
  })

  it('validates add modal and prevents submit for invalid email/password', async () => {
    ;(userService.getUsers as unknown as vi.Mock).mockResolvedValue([])
    const createSpy = vi.spyOn(userService, 'createUser').mockResolvedValue({ id: 'x', email: 'x@x.com' } as any)

    const user = userEvent.setup()
    render(<StaffManagement />)

    await waitFor(() => expect(userService.getUsers).toHaveBeenCalled())

    await user.click(screen.getByLabelText('add-staff'))

    await user.type(screen.getByLabelText('staff-email'), 'bad-email')
    await user.click(screen.getByRole('button', { name: /Save/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/Email is invalid/i))
    expect(createSpy).not.toHaveBeenCalled()
  })

  it('submits add form and refreshes list', async () => {
    // getUsers called twice: initial and after create
    ;(userService.getUsers as unknown as vi.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'u3', email: 'new@example.com' }])

    const createSpy = vi.spyOn(userService, 'createUser').mockResolvedValue({ id: 'u3', email: 'new@example.com' } as any)

    const user = userEvent.setup()
    render(<StaffManagement />)

    await waitFor(() => expect(userService.getUsers).toHaveBeenCalledTimes(1))

    await user.click(screen.getByLabelText('add-staff'))
    await user.type(screen.getByLabelText('staff-email'), 'new@example.com')
    await user.type(screen.getByLabelText('staff-password'), 'secret')
    await user.click(screen.getByRole('button', { name: /Save/i }))

    await waitFor(() => expect(createSpy).toHaveBeenCalledWith({ email: 'new@example.com', password: 'secret' }))
    await waitFor(() => expect(userService.getUsers).toHaveBeenCalledTimes(2))

    // modal should be closed and new email visible
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText('new@example.com')).toBeInTheDocument()
  })

  it('opens edit modal and calls update', async () => {
    ;(userService.getUsers as unknown as vi.Mock).mockResolvedValue(sampleUsers)
    const updateSpy = vi.spyOn(userService, 'updateUser').mockResolvedValue({ id: 'u1', email: 'updated@example.com' } as any)
    ;(userService.getUsers as unknown as vi.Mock).mockResolvedValueOnce(sampleUsers).mockResolvedValueOnce([{ id: 'u1', email: 'updated@example.com' }])

    const user = userEvent.setup()
    render(<StaffManagement />)

    await waitFor(() => expect(screen.getByText('a@example.com')).toBeInTheDocument())

    await user.click(screen.getByLabelText('edit-u1'))

    const emailInput = screen.getByLabelText('staff-email') as HTMLInputElement
    expect(emailInput.value).toBe('a@example.com')

    await user.clear(emailInput)
    await user.type(emailInput, 'updated@example.com')
    await user.click(screen.getByRole('button', { name: /Save/i }))

    await waitFor(() => expect(updateSpy).toHaveBeenCalledWith('u1', { email: 'updated@example.com' }))
  })

  it('deletes user when confirmed', async () => {
    ;(userService.getUsers as unknown as vi.Mock).mockResolvedValue(sampleUsers)
    const deleteSpy = vi.spyOn(userService, 'deleteUser').mockResolvedValue(undefined)
    ;(userService.getUsers as unknown as vi.Mock).mockResolvedValueOnce(sampleUsers).mockResolvedValueOnce([{ id: 'u2', email: 'b@example.com' }])

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    const user = userEvent.setup()
    render(<StaffManagement />)

    await waitFor(() => expect(screen.getByText('a@example.com')).toBeInTheDocument())

    await user.click(screen.getByLabelText('delete-u1'))

    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith('u1'))
    await waitFor(() => expect(userService.getUsers).toHaveBeenCalled())
  })

  it('does not delete when confirmation cancelled', async () => {
    ;(userService.getUsers as unknown as vi.Mock).mockResolvedValue(sampleUsers)
    const deleteSpy = vi.spyOn(userService, 'deleteUser').mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    const user = userEvent.setup()
    render(<StaffManagement />)

    await waitFor(() => expect(screen.getByText('a@example.com')).toBeInTheDocument())

    await user.click(screen.getByLabelText('delete-u1'))

    expect(deleteSpy).not.toHaveBeenCalled()
  })
})
