export interface User {
  id: string
  email: string
  name?: string
  role?: string
  created_at?: string
  updated_at?: string
}

export interface CreateUserRequest {
  email: string
  password?: string
  name?: string
  role?: string
}

export interface UpdateUserRequest {
  email?: string
  password?: string
  name?: string
  role?: string
}
