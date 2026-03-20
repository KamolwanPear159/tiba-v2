import client from '../client'
import type { Course, CourseSession, CalendarEvent, ApiResponse, PaginatedResponse, PaginationParams } from '@/types'

function fromNullStr(val: unknown): string | undefined {
  if (typeof val === 'string') return val || undefined
  if (val && typeof val === 'object' && 'Valid' in val && 'String' in val) {
    const ns = val as { Valid: boolean; String: string }
    return ns.Valid ? ns.String || undefined : undefined
  }
  return undefined
}

function fromNullFloat(val: unknown): number | undefined {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'Valid' in val && 'Float64' in val) {
    const nf = val as { Valid: boolean; Float64: number }
    return nf.Valid ? nf.Float64 : undefined
  }
  return undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCourse(c: any): Course {
  return {
    course_id: c.id ?? c.course_id,
    title: c.title,
    description: fromNullStr(c.description) ?? '',
    format: c.format,
    online_link: fromNullStr(c.online_meeting_link) ?? fromNullStr(c.online_link),
    price_type: c.price_type,
    price_general: fromNullFloat(c.price_general) ?? 0,
    price_association: fromNullFloat(c.price_association) ?? c.price_association,
    thumbnail_url: fromNullStr(c.thumbnail_path) ?? fromNullStr(c.thumbnail_url),
    is_published: c.is_published,
    sessions_count: c.sessions_count,
    created_at: c.created_at,
    updated_at: c.updated_at,
  }
}

export const courseService = {
  async getCourses(params?: PaginationParams): Promise<PaginatedResponse<Course>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await client.get<any>('/admin/courses', { params })
    const raw = res.data
    return {
      data: (raw.data ?? []).map(normalizeCourse),
      pagination: {
        page: raw.meta?.page ?? 1,
        page_size: raw.meta?.per_page ?? 9,
        total_items: raw.meta?.total ?? 0,
        total_pages: raw.meta?.total_pages ?? 1,
      },
    }
  },

  async getCourse(id: string): Promise<Course> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await client.get<ApiResponse<any>>(`/admin/courses/${id}`)
    return normalizeCourse(res.data.data)
  },

  async createCourse(data: FormData): Promise<Course> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await client.post<ApiResponse<any>>('/admin/courses', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeCourse(res.data.data)
  },

  async updateCourse(id: string, data: FormData): Promise<Course> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await client.put<ApiResponse<any>>(`/admin/courses/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeCourse(res.data.data)
  },

  async deleteCourse(id: string): Promise<void> {
    await client.delete(`/admin/courses/${id}`)
  },

  async updateCourseStatus(id: string, status: { is_published: boolean }): Promise<Course> {
    const res = await client.patch<ApiResponse<Course>>(`/admin/courses/${id}/status`, status)
    return res.data.data
  },

  async getSessions(courseId: string): Promise<CourseSession[]> {
    const res = await client.get<ApiResponse<CourseSession[]>>(`/admin/courses/${courseId}/sessions`)
    return res.data.data
  },

  async createSession(courseId: string, data: Partial<CourseSession>): Promise<CourseSession> {
    const res = await client.post<ApiResponse<CourseSession>>(`/admin/courses/${courseId}/sessions`, data)
    return res.data.data
  },

  async updateSession(id: string, data: Partial<CourseSession>): Promise<CourseSession> {
    const res = await client.put<ApiResponse<CourseSession>>(`/admin/sessions/${id}`, data)
    return res.data.data
  },

  async deleteSession(id: string): Promise<void> {
    await client.delete(`/admin/sessions/${id}`)
  },

  async getCalendarEnrollments(month: number, year: number): Promise<CalendarEvent[]> {
    const res = await client.get<ApiResponse<CalendarEvent[]>>('/admin/calendar/enrollments', {
      params: { month, year },
    })
    return res.data.data
  },

  async getCalendarTraining(month: number, year: number): Promise<CalendarEvent[]> {
    const res = await client.get<ApiResponse<CalendarEvent[]>>('/admin/calendar/training', {
      params: { month, year },
    })
    return res.data.data
  },
}
