// ─── Auth & Users ───────────────────────────────────────────────────────────

export interface User {
  user_id: string
  email: string
  role: 'admin' | 'member' | 'sub_user'
  first_name: string
  last_name: string
  phone?: string
  is_active: boolean
  created_at: string
}

export interface AdminUser {
  user_id: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
  member_type: 'general' | 'association'
  company_name?: string
  tax_id?: string
  address?: string
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export interface Course {
  course_id: string
  title: string
  description: string
  format: 'onsite' | 'online'
  online_link?: string
  price_type: 'single' | 'dual'
  price_general: number
  price_association?: number
  thumbnail_url?: string
  total_hours?: number
  is_published: boolean
  sessions_count?: number
  // Enriched from next upcoming session (public list only)
  next_training_start?: string
  next_training_end?: string
  next_enrollment_start?: string
  next_enrollment_end?: string
  tutors?: CourseTutor[]
  created_at: string
  updated_at: string
}

export interface CourseSession {
  session_id: string
  course_id: string
  session_label: string
  location: string
  seat_capacity: number
  enrolled_count?: number
  enrollment_start: string
  enrollment_end: string
  training_start: string
  training_end: string
  is_cancelled: boolean
  created_at: string
}

// ─── Content ─────────────────────────────────────────────────────────────────

export interface Article {
  news_id: string
  title: string
  slug: string
  article_type: 'news' | 'blog'
  excerpt?: string
  content?: string
  thumbnail_url?: string
  is_published: boolean
  published_at: string
  created_at: string
  updated_at: string
}

export interface Banner {
  banner_id: string
  image_url: string
  link_url?: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Ad {
  ad_id: string
  image_url: string
  link_url?: string
  position: 'top' | 'sidebar' | 'bottom' | 'popup'
  active_from: string
  active_until: string
  is_active: boolean
  created_at: string
}

export interface Partner {
  partner_id: string
  name: string
  logo_url?: string
  website_url?: string
  display_order: number
  is_active: boolean
}

export interface Executive {
  executive_id: string
  full_name: string
  position_title: string
  photo_url?: string
  display_order: number
  is_active: boolean
}

export interface Statistic {
  stat_id: string
  title: string
  description?: string
  pdf_url?: string
  published_year: number
  is_published: boolean
  created_at: string
}

export interface ContactInfo {
  contact_id: string
  address: string
  phone: string
  email: string
  line_id?: string
  facebook_url?: string
  map_embed_url?: string
  updated_at: string
}

export interface Company {
  company_id: string
  name: string
  logo_url?: string
  website_url?: string
  description?: string
  display_order: number
  is_active: boolean
}

export interface PricePlan {
  plan_id: string
  plan_type: 'general' | 'association_corporate' | 'association_individual'
  label: string
  annual_fee: number
  conditions: PriceCondition[]
}

export interface PriceCondition {
  condition_id: string
  plan_id: string
  condition_text: string
  display_order: number
}

// ─── Members & Registrations ────────────────────────────────────────────────

export interface Member {
  member_id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  member_type: 'general' | 'association'
  company_name?: string
  tax_id?: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  created_at: string
}

export interface Registration {
  registration_id: string
  member_id: string
  member_name: string
  member_email: string
  course_id: string
  course_title: string
  session_id: string
  session_label: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'paid' | 'refunded'
  registered_at: string
}

export interface Order {
  order_id: string
  member_id: string
  member_name: string
  registration_id: string
  course_title: string
  amount: number
  payment_method?: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  slip_url?: string
  created_at: string
  paid_at?: string
}

export interface SubUserRequest {
  request_id: string
  parent_member_id: string
  parent_member_name: string
  sub_user_email: string
  sub_user_name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_members: number
  pending_registrations: number
  pending_payments: number
  active_courses: number
  pending_sub_user_requests: number
}

export interface MonthlyEnrollment {
  month: string
  count: number
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
  }
}

export interface PaginationParams {
  page?: number
  page_size?: number
  search?: string
  [key: string]: string | number | boolean | undefined
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export interface ActivityLog {
  log_id: string
  admin_id: string
  admin_name?: string
  action_category: string
  action_verb: string
  target_table?: string
  target_id?: string
  description?: string
  ip_address?: string
  created_at: string
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// ─── Member Companies ─────────────────────────────────────────────────────────

export interface MemberCompanyProduct {
  product_id: string
  company_id: string
  product_name: string
  product_type: string
  description?: string
}

export interface MemberCompanyAward {
  award_id: string
  company_id: string
  award_name: string
  award_type: string
  year: number
  description?: string
  image_url?: string
}

export interface MemberCompany {
  company_id: string
  name: string
  logo_url?: string
  company_type: string
  address?: string
  phone?: string
  email?: string
  website_url?: string
  is_active: boolean
  created_at: string
  products?: MemberCompanyProduct[]
  awards?: MemberCompanyAward[]
}

// ─── Tutors ───────────────────────────────────────────────────────────────────

export interface CourseTutor {
  tutor_id: string
  course_id: string
  name: string
  position: string
  photo_url?: string
  display_order?: number
}

export interface Tutor {
  tutor_id: string
  name: string
  position: string
  photo_url?: string
  is_active: boolean
  created_at: string
}

export interface CourseDocument {
  id: string
  course_id: string
  name: string
  file_path: string
  display_order: number
  created_at: string
}

// ─── User Logs ────────────────────────────────────────────────────────────────

export interface UserLog {
  log_id: string
  user_id: string
  user_name?: string
  action: string
  description?: string
  device?: string
  ip_address?: string
  created_at: string
}

// ─── Membership Plan ──────────────────────────────────────────────────────────

export interface MembershipPlan {
  plan_id: string
  plan_type: 'general' | 'association'
  title: string
  subtitle: string
  description: string
  price?: number
  benefits: string[]
  updated_at: string
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  event_id: string
  title: string
  date: string
  type: 'enrollment' | 'training'
  course_title: string
  session_label: string
}
