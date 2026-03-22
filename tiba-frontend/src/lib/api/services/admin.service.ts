import client from '../client'
import type {
  DashboardStats, MonthlyEnrollment, Member, Registration,
  Order, SubUserRequest, AdminUser, ApiResponse,
  PaginatedResponse, PaginationParams, ActivityLog,
  MemberCompany, Tutor, UserLog, MembershipPlan,
} from '@/types'

function fromNullStr(val: unknown): string | undefined {
  if (typeof val === 'string') return val || undefined
  if (val && typeof val === 'object' && 'Valid' in val && 'String' in val) {
    const ns = val as { Valid: boolean; String: string }
    return ns.Valid ? ns.String || undefined : undefined
  }
  return undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTutor(t: any): import('@/types').Tutor {
  return {
    tutor_id: t.id ?? t.tutor_id,
    name: t.name,
    position: t.position,
    photo_url: fromNullStr(t.photo_url) ?? fromNullStr(t.photo_path),
    is_active: t.is_active ?? true,
    created_at: t.created_at,
  }
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await client.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats')
    return res.data.data
  },

  async getMonthlyEnrollments(): Promise<MonthlyEnrollment[]> {
    const res = await client.get<ApiResponse<MonthlyEnrollment[]>>('/admin/dashboard/monthly-enrollments')
    return res.data.data
  },

  async getRecentRegistrations(): Promise<Registration[]> {
    const res = await client.get<ApiResponse<Registration[]>>('/admin/dashboard/recent-registrations')
    return res.data.data
  },

  // ─── Members ────────────────────────────────────────────────────────────
  async getMembers(params?: PaginationParams): Promise<PaginatedResponse<Member>> {
    const res = await client.get<ApiResponse<PaginatedResponse<Member>>>('/admin/members', { params })
    return res.data.data
  },

  async getMember(id: string): Promise<Member> {
    const res = await client.get<ApiResponse<Member>>(`/admin/members/${id}`)
    return res.data.data
  },

  async updateMemberStatus(id: string, data: { status: string }): Promise<Member> {
    const res = await client.patch<ApiResponse<Member>>(`/admin/members/${id}/status`, data)
    return res.data.data
  },

  // ─── Registrations ──────────────────────────────────────────────────────
  async getRegistrations(params?: PaginationParams): Promise<PaginatedResponse<Registration>> {
    const res = await client.get<ApiResponse<PaginatedResponse<Registration>>>('/admin/registrations', { params })
    return res.data.data
  },

  async getRegistration(id: string): Promise<Registration> {
    const res = await client.get<ApiResponse<Registration>>(`/admin/registrations/${id}`)
    return res.data.data
  },

  async updateRegistrationStatus(id: string, data: { status: string; payment_status?: string }): Promise<Registration> {
    const res = await client.patch<ApiResponse<Registration>>(`/admin/registrations/${id}/status`, data)
    return res.data.data
  },

  // ─── Orders ─────────────────────────────────────────────────────────────
  async getOrders(params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<Order>> {
    const res = await client.get<ApiResponse<PaginatedResponse<Order>>>('/admin/orders', { params })
    return res.data.data
  },

  async getOrder(id: string): Promise<Order> {
    const res = await client.get<ApiResponse<Order>>(`/admin/orders/${id}`)
    return res.data.data
  },

  async confirmPayment(id: string, note?: string): Promise<Order> {
    const res = await client.put<ApiResponse<Order>>(`/admin/orders/${id}/confirm`, note ? { note } : {})
    return res.data.data
  },

  async rejectPayment(id: string, note: string): Promise<Order> {
    const res = await client.put<ApiResponse<Order>>(`/admin/orders/${id}/reject`, { note })
    return res.data.data
  },

  // ─── Association Registrations ───────────────────────────────────────────
  async getAssociationRegistrations(params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<Registration>> {
    const res = await client.get<ApiResponse<PaginatedResponse<Registration>>>('/admin/registrations', { params })
    return res.data.data
  },

  async getAssociationRegistration(id: string): Promise<Registration> {
    const res = await client.get<ApiResponse<Registration>>(`/admin/registrations/${id}`)
    return res.data.data
  },

  async updateAssociationRegistrationStatus(id: string, status: 'accepted' | 'rejected', note?: string): Promise<Registration> {
    const res = await client.patch<ApiResponse<Registration>>(`/admin/registrations/${id}/status`, { status, ...(note ? { note } : {}) })
    return res.data.data
  },

  // ─── Sub User Requests ──────────────────────────────────────────────────
  async getSubUserRequests(params?: PaginationParams & { search?: string }): Promise<PaginatedResponse<SubUserRequest>> {
    const res = await client.get<ApiResponse<PaginatedResponse<SubUserRequest>>>('/admin/sub-user-requests', { params })
    return res.data.data
  },

  async updateSubUserRequest(id: string, status: 'approved' | 'rejected'): Promise<SubUserRequest> {
    const res = await client.patch<ApiResponse<SubUserRequest>>(`/admin/sub-user-requests/${id}`, { status })
    return res.data.data
  },

  async handleSubUserRequest(id: string, data: { action: 'approve' | 'reject' }): Promise<SubUserRequest> {
    const res = await client.patch<ApiResponse<SubUserRequest>>(`/admin/sub-user-requests/${id}`, data)
    return res.data.data
  },

  // ─── Admin Users ────────────────────────────────────────────────────────
  async getAdminUsers(params?: PaginationParams): Promise<PaginatedResponse<AdminUser>> {
    const res = await client.get<ApiResponse<PaginatedResponse<AdminUser>>>('/admin/users', { params })
    return res.data.data
  },

  async createAdminUser(data: { email: string; first_name: string; last_name: string; role: string; password: string }): Promise<AdminUser> {
    const res = await client.post<ApiResponse<AdminUser>>('/admin/users', data)
    return res.data.data
  },

  async updateAdminUserStatus(id: string, data: { is_active: boolean }): Promise<AdminUser> {
    const res = await client.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, data)
    return res.data.data
  },

  // ─── Activity Logs ──────────────────────────────────────────────────────
  async getActivityLogs(params?: PaginationParams & { search?: string; category?: string }): Promise<PaginatedResponse<ActivityLog>> {
    const res = await client.get<ApiResponse<PaginatedResponse<ActivityLog>>>('/admin/activity-logs', { params })
    return res.data.data
  },

  // ─── Member Companies ───────────────────────────────────────────────────
  async getMemberCompanies(params?: PaginationParams): Promise<PaginatedResponse<MemberCompany>> {
    const res = await client.get<ApiResponse<PaginatedResponse<MemberCompany>>>('/admin/member-companies', { params })
    return res.data.data
  },

  async getMemberCompany(id: string): Promise<MemberCompany> {
    const res = await client.get<ApiResponse<MemberCompany>>(`/admin/member-companies/${id}`)
    return res.data.data
  },

  async createMemberCompany(data: FormData): Promise<MemberCompany> {
    const res = await client.post<ApiResponse<MemberCompany>>('/admin/member-companies', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async updateMemberCompany(id: string, data: FormData): Promise<MemberCompany> {
    const res = await client.put<ApiResponse<MemberCompany>>(`/admin/member-companies/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async deleteMemberCompany(id: string): Promise<void> {
    await client.delete(`/admin/member-companies/${id}`)
  },

  async toggleMemberCompanyStatus(id: string, is_active: boolean): Promise<MemberCompany> {
    const res = await client.patch<ApiResponse<MemberCompany>>(`/admin/member-companies/${id}/status`, { is_active })
    return res.data.data
  },

  // ─── Tutors ─────────────────────────────────────────────────────────────
  async getTutors(params?: PaginationParams): Promise<PaginatedResponse<Tutor>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await client.get<any>('/admin/tutors', { params })
    const raw = res.data
    return {
      data: (raw.data?.data ?? raw.data ?? []).map(normalizeTutor),
      pagination: {
        page: raw.data?.page ?? raw.meta?.page ?? 1,
        page_size: raw.data?.page_size ?? raw.meta?.per_page ?? 20,
        total_items: raw.data?.total_items ?? raw.meta?.total ?? 0,
        total_pages: raw.data?.total_pages ?? raw.meta?.total_pages ?? 1,
      },
    }
  },

  async getTutor(id: string): Promise<Tutor> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await client.get<any>(`/admin/tutors/${id}`)
    return normalizeTutor(res.data.data)
  },

  async createTutor(data: FormData): Promise<Tutor> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await client.post<any>('/admin/tutors', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeTutor(res.data.data)
  },

  async updateTutor(id: string, data: FormData): Promise<Tutor> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await client.put<any>(`/admin/tutors/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeTutor(res.data.data)
  },

  async deleteTutor(id: string): Promise<void> {
    await client.delete(`/admin/tutors/${id}`)
  },

  async toggleTutorStatus(id: string, is_active: boolean): Promise<Tutor> {
    const res = await client.patch<ApiResponse<Tutor>>(`/admin/tutors/${id}/status`, { is_active })
    return res.data.data
  },

  // ─── User Logs ──────────────────────────────────────────────────────────
  async getUserLogs(params?: PaginationParams & { search?: string; date_from?: string; date_to?: string }): Promise<PaginatedResponse<UserLog>> {
    const res = await client.get<ApiResponse<PaginatedResponse<UserLog>>>('/admin/user-logs', { params })
    return res.data.data
  },

  // ─── Membership Plans ───────────────────────────────────────────────────
  async getMembershipPlans(): Promise<MembershipPlan[]> {
    const res = await client.get<ApiResponse<MembershipPlan[]>>('/admin/membership-plans')
    return res.data.data
  },

  async updateMembershipPlan(id: string, data: Partial<MembershipPlan>): Promise<MembershipPlan> {
    const res = await client.put<ApiResponse<MembershipPlan>>(`/admin/membership-plans/${id}`, data)
    return res.data.data
  },
}
