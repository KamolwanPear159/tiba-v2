import client from '../client'
import type {
  Article, Banner, Ad, Partner, Executive, Statistic,
  ContactInfo, Company, PricePlan, PriceCondition,
  ApiResponse, PaginatedResponse, PaginationParams
} from '@/types'

// ─── Go sql.NullString normalizer ─────────────────────────────────────────────
function fromNullStr(val: unknown): string | undefined {
  if (typeof val === 'string') return val || undefined
  if (val && typeof val === 'object' && 'Valid' in val && 'String' in val) {
    const ns = val as { Valid: boolean; String: string }
    return ns.Valid ? ns.String || undefined : undefined
  }
  return undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBanner(b: any): Banner {
  return {
    ...b,
    link_url: fromNullStr(b.link_url),
    image_url: fromNullStr(b.image_url) ?? b.image_url ?? '',
  }
}

export const contentService = {
  // ─── News ───────────────────────────────────────────────────────────────
  async getNews(params?: PaginationParams): Promise<PaginatedResponse<Article>> {
    const res = await client.get<ApiResponse<PaginatedResponse<Article>>>('/admin/news', { params })
    return res.data.data
  },

  async createNews(data: FormData): Promise<Article> {
    const res = await client.post<ApiResponse<Article>>('/admin/news', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async updateNews(id: string, data: FormData): Promise<Article> {
    const res = await client.put<ApiResponse<Article>>(`/admin/news/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async deleteNews(id: string): Promise<void> {
    await client.delete(`/admin/news/${id}`)
  },

  // ─── Banners ──────────────────────────────────────────────────────────
  async getBanners(): Promise<Banner[]> {
    const res = await client.get<ApiResponse<Banner[]>>('/admin/banners')
    const data = res.data.data
    if (!data) return []
    return data.map(normalizeBanner)
  },

  async createBanner(data: FormData): Promise<Banner> {
    const res = await client.post<ApiResponse<Banner>>('/admin/banners', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeBanner(res.data.data)
  },

  async updateBanner(id: string, data: FormData): Promise<Banner> {
    const res = await client.put<ApiResponse<Banner>>(`/admin/banners/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeBanner(res.data.data)
  },

  async deleteBanner(id: string): Promise<void> {
    await client.delete(`/admin/banners/${id}`)
  },

  async toggleBannerStatus(id: string, is_active: boolean): Promise<Banner> {
    const res = await client.patch<ApiResponse<Banner>>(`/admin/banners/${id}/status`, { is_active })
    return normalizeBanner(res.data.data)
  },

  // ─── Ads ───────────────────────────────────────────────────────────────
  async getAds(params?: PaginationParams): Promise<PaginatedResponse<Ad>> {
    const res = await client.get<ApiResponse<PaginatedResponse<Ad>>>('/admin/ads', { params })
    return res.data.data
  },

  async createAd(data: FormData): Promise<Ad> {
    const res = await client.post<ApiResponse<Ad>>('/admin/ads', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async updateAd(id: string, data: FormData): Promise<Ad> {
    const res = await client.put<ApiResponse<Ad>>(`/admin/ads/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async deleteAd(id: string): Promise<void> {
    await client.delete(`/admin/ads/${id}`)
  },

  // ─── Partners ─────────────────────────────────────────────────────────
  async getPartners(): Promise<Partner[]> {
    const res = await client.get<ApiResponse<Partner[]>>('/admin/partners')
    return res.data.data
  },

  async createPartner(data: FormData): Promise<Partner> {
    const res = await client.post<ApiResponse<Partner>>('/admin/partners', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async updatePartner(id: string, data: FormData): Promise<Partner> {
    const res = await client.put<ApiResponse<Partner>>(`/admin/partners/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async deletePartner(id: string): Promise<void> {
    await client.delete(`/admin/partners/${id}`)
  },

  // ─── Executives ───────────────────────────────────────────────────────
  async getExecutives(): Promise<Executive[]> {
    const res = await client.get<ApiResponse<Executive[]>>('/admin/executives')
    return res.data.data
  },

  async createExecutive(data: FormData): Promise<Executive> {
    const res = await client.post<ApiResponse<Executive>>('/admin/executives', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async updateExecutive(id: string, data: FormData): Promise<Executive> {
    const res = await client.put<ApiResponse<Executive>>(`/admin/executives/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async deleteExecutive(id: string): Promise<void> {
    await client.delete(`/admin/executives/${id}`)
  },

  // ─── Statistics ───────────────────────────────────────────────────────
  async getStatistics(params?: PaginationParams): Promise<PaginatedResponse<Statistic>> {
    const res = await client.get<ApiResponse<PaginatedResponse<Statistic>>>('/admin/statistics', { params })
    return res.data.data
  },

  async createStatistic(data: FormData): Promise<Statistic> {
    const res = await client.post<ApiResponse<Statistic>>('/admin/statistics', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async updateStatistic(id: string, data: FormData): Promise<Statistic> {
    const res = await client.put<ApiResponse<Statistic>>(`/admin/statistics/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async deleteStatistic(id: string): Promise<void> {
    await client.delete(`/admin/statistics/${id}`)
  },

  // ─── Contact ──────────────────────────────────────────────────────────
  async getContact(): Promise<ContactInfo> {
    const res = await client.get<ApiResponse<ContactInfo>>('/admin/contact')
    return res.data.data
  },

  async updateContact(data: Partial<ContactInfo>): Promise<ContactInfo> {
    const res = await client.put<ApiResponse<ContactInfo>>('/admin/contact', data)
    return res.data.data
  },

  // ─── Companies ────────────────────────────────────────────────────────
  async getCompanies(params?: PaginationParams): Promise<PaginatedResponse<Company>> {
    const res = await client.get<ApiResponse<PaginatedResponse<Company>>>('/admin/companies', { params })
    return res.data.data
  },

  async createCompany(data: FormData): Promise<Company> {
    const res = await client.post<ApiResponse<Company>>('/admin/companies', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async updateCompany(id: string, data: FormData): Promise<Company> {
    const res = await client.put<ApiResponse<Company>>(`/admin/companies/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async deleteCompany(id: string): Promise<void> {
    await client.delete(`/admin/companies/${id}`)
  },

  // ─── Price & Benefits ─────────────────────────────────────────────────
  async getPriceBenefits(): Promise<PricePlan[]> {
    const res = await client.get<ApiResponse<PricePlan[]>>('/admin/price-plans')
    return res.data.data
  },

  async updatePlan(id: string, data: Partial<PricePlan>): Promise<PricePlan> {
    const res = await client.put<ApiResponse<PricePlan>>(`/admin/price-plans/${id}`, data)
    return res.data.data
  },

  async getConditions(planId: string): Promise<PriceCondition[]> {
    const res = await client.get<ApiResponse<PriceCondition[]>>(`/admin/price-plans/${planId}/conditions`)
    return res.data.data
  },

  async createCondition(planId: string, data: Partial<PriceCondition>): Promise<PriceCondition> {
    const res = await client.post<ApiResponse<PriceCondition>>(`/admin/price-plans/${planId}/conditions`, data)
    return res.data.data
  },

  async updateCondition(planId: string, cId: string, data: Partial<PriceCondition>): Promise<PriceCondition> {
    const res = await client.put<ApiResponse<PriceCondition>>(`/admin/price-plans/${planId}/conditions/${cId}`, data)
    return res.data.data
  },

  async deleteCondition(planId: string, cId: string): Promise<void> {
    await client.delete(`/admin/price-plans/${planId}/conditions/${cId}`)
  },
}
