import client from '../client'
import type {
  Article, Course, CourseSession, CourseTutor, Banner, Partner, Statistic,
  ContactInfo, Company, PricePlan, Executive, Ad,
  ApiResponse, PaginatedResponse, PaginationParams
} from '@/types'

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

function fromNullInt(val: unknown): number | undefined {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'Valid' in val && 'Int32' in val) {
    const ni = val as { Valid: boolean; Int32: number }
    return ni.Valid ? ni.Int32 : undefined
  }
  return undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSession(s: any): CourseSession {
  return {
    session_id: s.id ?? s.session_id,
    course_id: s.course_id,
    session_label: fromNullStr(s.session_label) ?? '',
    location: fromNullStr(s.location) ?? '',
    seat_capacity: s.seat_capacity ?? 0,
    enrolled_count: s.enrolled_count,
    enrollment_start: s.enrollment_start,
    enrollment_end: s.enrollment_end,
    training_start: s.training_start,
    training_end: s.training_end,
    is_cancelled: s.is_cancelled ?? false,
    created_at: s.created_at,
  }
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
    total_hours: fromNullInt(c.total_hours),
    is_published: c.is_published,
    sessions_count: c.sessions_count,
    // Enriched next-session fields
    next_training_start: c.next_training_start ?? undefined,
    next_training_end: c.next_training_end ?? undefined,
    next_enrollment_start: c.next_enrollment_start ?? undefined,
    next_enrollment_end: c.next_enrollment_end ?? undefined,
    created_at: c.created_at,
    updated_at: c.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBanner(b: any): Banner {
  return { ...b, link_url: fromNullStr(b.link_url), image_url: fromNullStr(b.image_url) ?? b.image_url ?? '' }
}

export const publicService = {
  async getHeroBanners(): Promise<Banner[]> {
    const res = await client.get<ApiResponse<Banner[]>>('/public/banners')
    const data = res.data.data
    if (!data) return []
    return data.map(normalizeBanner)
  },

  async getPartners(): Promise<Partner[]> {
    const res = await client.get<ApiResponse<Partner[]>>('/public/partners')
    return res.data.data ?? []
  },

  async getPricePlans(): Promise<PricePlan[]> {
    const res = await client.get<ApiResponse<PricePlan[]>>('/public/price-benefits')
    return res.data.data ?? []
  },

  async getContact(): Promise<ContactInfo> {
    const res = await client.get<ApiResponse<ContactInfo>>('/public/contact')
    return res.data.data
  },

  async getCompanies(params?: PaginationParams): Promise<PaginatedResponse<Company>> {
    const res = await client.get<ApiResponse<PaginatedResponse<Company>>>('/public/companies', { params })
    return res.data.data
  },

  async getNews(params?: PaginationParams & { article_type?: string }): Promise<PaginatedResponse<Article>> {
    const res = await client.get<ApiResponse<PaginatedResponse<Article>>>('/public/news', { params })
    return res.data.data
  },

  async getNewsDetail(slug: string): Promise<Article> {
    const res = await client.get<ApiResponse<Article>>(`/public/news/${slug}`)
    return res.data.data
  },

  async getCourses(params?: PaginationParams & { month?: number; year?: number; status?: string }): Promise<PaginatedResponse<Course>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await client.get<any>('/public/courses', { params })
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

  async getCourse(id: string): Promise<{ course: Course; sessions: CourseSession[] }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await client.get<ApiResponse<any>>(`/public/courses/${id}`)
    const d = res.data.data
    const tutors = (d.tutors ?? []) as CourseTutor[]
    const courseData = d.course ?? d
    return {
      course: { ...normalizeCourse(courseData), tutors },
      sessions: (d.sessions ?? []).map(normalizeSession),
    }
  },

  async getStatistics(params?: PaginationParams): Promise<PaginatedResponse<Statistic>> {
    const res = await client.get<ApiResponse<PaginatedResponse<Statistic>>>('/public/statistics', { params })
    return res.data.data
  },

  async getExecutives(): Promise<Executive[]> {
    const res = await client.get<ApiResponse<Executive[]>>('/public/executives')
    return res.data.data ?? []
  },

  async getAds(position?: string): Promise<Ad[]> {
    const res = await client.get<ApiResponse<Ad[]>>('/public/ads', { params: position ? { position } : undefined })
    return res.data.data ?? []
  },
}
