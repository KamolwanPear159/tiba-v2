import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

function getMemberToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('member_token')
}

function memberHeaders() {
  const token = getMemberToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function sendOTP(email: string, purpose: string): Promise<{ message: string }> {
  const res = await axios.post(`${API_URL}/auth/send-otp`, { email, purpose })
  return res.data
}

export async function verifyOTP(email: string, code: string, purpose: string): Promise<{ message: string }> {
  const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, code, purpose })
  return res.data
}

export async function registerNormal(data: {
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
  address?: string
  otp_code: string
}): Promise<void> {
  const res = await axios.post(`${API_URL}/auth/register/normal`, data)
  const { access_token, token, user } = res.data?.data ?? res.data
  const memberToken = access_token ?? token
  if (typeof window !== 'undefined') {
    localStorage.setItem('member_token', memberToken)
    localStorage.setItem('member_user', JSON.stringify(user))
  }
}

export async function registerAssociation(data: {
  entity_type: 'company' | 'individual'
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
  address?: string
  otp_code: string
  org_name?: string
  tax_id?: string
}): Promise<void> {
  const res = await axios.post(`${API_URL}/auth/register/association`, data)
  const { access_token, token, user } = res.data?.data ?? res.data
  const memberToken = access_token ?? token
  if (typeof window !== 'undefined') {
    localStorage.setItem('member_token', memberToken)
    localStorage.setItem('member_user', JSON.stringify(user))
  }
}

export async function loginMember(email: string, password: string): Promise<void> {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password })
  const { access_token, token, user } = res.data?.data ?? res.data
  const memberToken = access_token ?? token
  if (typeof window !== 'undefined') {
    localStorage.setItem('member_token', memberToken)
    localStorage.setItem('member_user', JSON.stringify(user))
  }
}

export function logoutMember(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('member_token')
    localStorage.removeItem('member_user')
  }
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await axios.post(`${API_URL}/auth/forgot-password`, { email })
  return res.data
}

export async function resetPassword(
  email: string,
  otp_code: string,
  new_password: string,
): Promise<{ message: string }> {
  const res = await axios.post(`${API_URL}/auth/reset-password`, { email, otp_code, new_password })
  return res.data
}

// ─── Member profile ───────────────────────────────────────────────────────────

export async function getMemberProfile(): Promise<any> {
  const res = await axios.get(`${API_URL}/member/profile`, { headers: memberHeaders() })
  return res.data?.data ?? res.data
}

export async function updateProfile(data: Record<string, any>): Promise<any> {
  const res = await axios.patch(`${API_URL}/member/profile`, data, { headers: memberHeaders() })
  return res.data?.data ?? res.data
}

export async function changePassword(
  current_password: string,
  new_password: string,
): Promise<{ message: string }> {
  const res = await axios.post(
    `${API_URL}/member/profile/change-password`,
    { current_password, new_password },
    { headers: memberHeaders() },
  )
  return res.data
}

// ─── Enrollments ─────────────────────────────────────────────────────────────

export async function getMyEnrollments(page = 1): Promise<any> {
  const res = await axios.get(`${API_URL}/member/enrollments`, {
    params: { page },
    headers: memberHeaders(),
  })
  return res.data?.data ?? res.data
}

export async function enrollCourse(sessionId: string): Promise<any> {
  const res = await axios.post(
    `${API_URL}/member/enrollments`,
    { session_id: sessionId },
    { headers: memberHeaders() },
  )
  return res.data?.data ?? res.data
}

export async function uploadSlip(enrollmentId: string, file: File): Promise<any> {
  const form = new FormData()
  form.append('slip', file)
  const res = await axios.post(`${API_URL}/member/enrollments/${enrollmentId}/slip`, form, {
    headers: { ...memberHeaders(), 'Content-Type': 'multipart/form-data' },
  })
  return res.data?.data ?? res.data
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function getMyPayments(page = 1): Promise<any> {
  const res = await axios.get(`${API_URL}/member/payments`, {
    params: { page },
    headers: memberHeaders(),
  })
  return res.data?.data ?? res.data
}

// ─── Certificates ─────────────────────────────────────────────────────────────

export async function getMyCertificates(): Promise<any> {
  const res = await axios.get(`${API_URL}/member/certificates`, { headers: memberHeaders() })
  return res.data?.data ?? res.data
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(): Promise<any> {
  const res = await axios.get(`${API_URL}/member/notifications`, { headers: memberHeaders() })
  return res.data?.data ?? res.data
}

export async function markNotificationRead(id: string): Promise<any> {
  const res = await axios.put(`${API_URL}/member/notifications/${id}/read`, {}, { headers: memberHeaders() })
  return res.data
}

export async function getUnreadCount(): Promise<number> {
  const res = await axios.get(`${API_URL}/member/notifications/unread-count`, { headers: memberHeaders() })
  return res.data?.data?.count ?? res.data?.count ?? 0
}
