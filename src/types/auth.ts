export interface User {
  email: string
}

export interface LoginResponse {
  token: string
  user: User
}
