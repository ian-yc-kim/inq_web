import React, { useEffect, useState } from 'react'
import { validate as validateEmail } from 'email-validator'
import * as userService from '../../services/userService'
import type { User } from '../../types/user'

type ModalMode = 'add' | 'edit'

export default function StaffManagement(): React.ReactElement {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<ModalMode>('add')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [formEmail, setFormEmail] = useState<string>('')
  const [formPassword, setFormPassword] = useState<string>('')
  const [modalError, setModalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const loadUsers = async (): Promise<void> => {
    setIsLoading(true)
    setPageError(null)
    try {
      const res = await userService.getUsers()
      setUsers(res)
    } catch (errUnknown) {
      console.error('StaffManagement:', errUnknown)
      setPageError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const openAdd = () => {
    setModalMode('add')
    setEditingUserId(null)
    setFormEmail('')
    setFormPassword('')
    setModalError(null)
    setIsModalOpen(true)
  }

  const openEdit = (u: User) => {
    setModalMode('edit')
    setEditingUserId(u.id)
    setFormEmail(u.email)
    setFormPassword('')
    setModalError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalError(null)
    setIsSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (!formEmail.trim()) {
      setModalError('Email is required')
      return
    }

    if (!validateEmail(formEmail)) {
      setModalError('Email is invalid')
      return
    }

    if (modalMode === 'add' && !formPassword.trim()) {
      setModalError('Password is required')
      return
    }

    setIsSubmitting(true)

    try {
      if (modalMode === 'add') {
        await userService.createUser({ email: formEmail, password: formPassword })
      } else {
        if (!editingUserId) throw new Error('Missing editing user id')
        const payload: { email?: string; password?: string } = { email: formEmail }
        if (formPassword.trim()) payload.password = formPassword
        await userService.updateUser(editingUserId, payload)
      }

      closeModal()
      await loadUsers()
    } catch (errUnknown) {
      console.error('StaffManagement:', errUnknown)
      setModalError('Operation failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      // confirmation
      const ok = window.confirm('Are you sure you want to delete this user?')
      if (!ok) return

      await userService.deleteUser(id)
      await loadUsers()
    } catch (errUnknown) {
      console.error('StaffManagement:', errUnknown)
      setPageError('Failed to delete user')
    }
  }

  return (
    <main>
      <h1>Staff Management</h1>
      <div style={{ marginBottom: 12 }}>
        <button aria-label="add-staff" onClick={openAdd}>Add Staff</button>
      </div>

      {isLoading && <div>Loading...</div>}
      {pageError && <div role="alert" style={{ color: 'red' }}>{pageError}</div>}

      <table aria-label="staff-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>ID</th>
            <th style={{ textAlign: 'left' }}>Email</th>
            <th style={{ textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>
                <button onClick={() => openEdit(u)} aria-label={`edit-${u.id}`}>Edit</button>
                <button onClick={() => void handleDelete(u.id)} aria-label={`delete-${u.id}`}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div role="dialog" aria-modal="true" aria-label="staff-modal" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: 20, width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <h2>{modalMode === 'add' ? 'Add Staff' : 'Edit Staff'}</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="s-email">Email</label>
                <input id="s-email" name="email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} aria-label="staff-email" />
              </div>

              <div>
                <label htmlFor="s-password">Password</label>
                <input id="s-password" name="password" type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} aria-label="staff-password" />
                {modalMode === 'edit' && <small>Leave blank to keep current password</small>}
              </div>

              {modalError && <div role="alert" style={{ color: 'red' }}>{modalError}</div>}

              <div style={{ marginTop: 12 }}>
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={closeModal} style={{ marginLeft: 8 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
