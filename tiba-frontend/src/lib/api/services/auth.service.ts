import client from '../client'
import type { LoginRequest, LoginResponse, RegisterRequest, User, ApiResponse } from '@/types'

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await client.post<ApiResponse<LoginResponse>>('/auth/login', data)
    return res.data.data
  },

  async adminLogin(data: LoginRequest): Promise<LoginResponse> {
    const res = await client.post<ApiResponse<LoginResponse>>('/auth/login', data)
    return res.data.data
  },

  async register(data: RegisterRequest): Promise<{ message: string }> {
    const res = await client.post<ApiResponse<{ message: string }>>('/auth/register', data)
    return res.data.data
  },

  async logout(): Promise<void> {
    try {
      await client.post('/auth/logout')
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
    }
  },

  async getProfile(): Promise<User> {
    const res = await client.get<ApiResponse<User>>('/auth/me')
    return res.data.data
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await client.post<ApiResponse<null>>('/auth/forgot-password', { email })
    return { message: res.data.message || '' }
  },

  async resetPassword(data: { token: string; new_password: string; confirm_password: string }): Promise<{ message: string }> {
    const res = await client.post<ApiResponse<null>>('/auth/reset-password', data)
    return { message: res.data.message || '' }
  },
}
