'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/lib/api/services/public.service'
import { enrollCourse } from '@/lib/api/services/member.service'
import type { CourseSession } from '@/types'

// ─── Date helpers ────────────────────────────────────────────────────────────

const THAI_MONTHS_SHORT = [
  'ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
  'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.',
]
const THAI_MONTHS_FULL = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม',
]

function formatThaiShort(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`
}

function formatThaiFull(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${THAI_MONTHS_FULL[d.getMonth()]} ${d.getFullYear() + 543}`
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} – ${e.getDate()} ${THAI_MONTHS_FULL[s.getMonth()]} ${s.getFullYear() + 543}`
  }
  return `${formatThaiShort(start)} – ${formatThaiShort(end)}`
}

function formatPrice(n: number) {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function getEnrollmentStatus(s: CourseSession): 'open' | 'upcoming' | 'closed' | 'cancelled' {
  if (s.is_cancelled) return 'cancelled'
  const now = Date.now()
  const start = new Date(s.enrollment_start).getTime()
  const end = new Date(s.enrollment_end).getTime()
  if (now < start) return 'upcoming'
  if (now > end) return 'closed'
  return 'open'
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CalendarIcon({ color = '#1f4488', size = 40 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
      <rect x="5" y="8" width="30" height="27" rx="3" stroke={color} strokeWidth="1.8"/>
      <path d="M5 16h30" stroke={color} strokeWidth="1.8"/>
      <path d="M13 5v6M27 5v6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="10" y="22" width="6" height="6" rx="1" fill={color}/>
      <rect x="17" y="22" width="6" height="6" rx="1" fill={color}/>
    </svg>
  )
}

function EnrollCalendarIcon({ color = '#1f4488', size = 40 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
      <rect x="5" y="8" width="30" height="27" rx="3" stroke={color} strokeWidth="1.8"/>
      <path d="M5 16h30" stroke={color} strokeWidth="1.8"/>
      <path d="M13 5v6M27 5v6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="20" cy="27" r="5" stroke="#126f38" strokeWidth="1.5"/>
      <path d="M20 24v1M20 30v1" stroke="#126f38" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 26.5c0-1.1.9-2 2-2" stroke="#126f38" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function MarkerIcon({ color = '#1f4488', size = 40 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
      <path d="M20 5C14.477 5 10 9.477 10 15c0 7.778 10 20 10 20S30 22.778 30 15c0-5.523-4.477-10-10-10z" stroke={color} strokeWidth="1.8"/>
      <circle cx="20" cy="15" r="4" stroke={color} strokeWidth="1.8"/>
    </svg>
  )
}

function ClockIcon({ color = '#1f4488', size = 40 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r="14" stroke={color} strokeWidth="1.8"/>
      <path d="M20 11v9l5 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ArrowRightIcon({ color = '#fff' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <path d="M4 10h12M10 5l5 5-5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function DownloadIcon({ color = '#0a0a0a' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <path d="M10 3v10M6 9l4 4 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <path d="M10 8h6.5l3 8-3.5 2.5a26 26 0 0012.5 12.5L31 27.5l8 3V37a2 2 0 01-2 2C18 39 8 29 8 17a2 2 0 012-2V8z" stroke="#126f38" strokeWidth="2" fill="none" strokeLinejoin="round"/>
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <rect x="6" y="12" width="36" height="26" rx="3" stroke="#126f38" strokeWidth="2"/>
      <path d="M6 14l18 13L42 14" stroke="#126f38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <rect width="48" height="48" rx="8" fill="#126f38"/>
      <path d="M28 12h-4a6 6 0 00-6 6v4h-4v6h4v12h6V28h4l1-6h-5v-4a1 1 0 011-1h4v-5z" fill="#fff"/>
    </svg>
  )
}

function LineIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <rect width="48" height="48" rx="10" fill="#126f38"/>
      <path d="M24 10C16.268 10 10 15.6 10 22.5c0 4.2 2.3 7.9 5.9 10.3l-1 3.7 4.3-2.3c1.5.4 3 .6 4.8.6 7.732 0 14-5.6 14-12.3C38 15.6 31.732 10 24 10z" fill="#fff"/>
      <path d="M17 25v-4M17 21h3M17 25h3M22 21v4M22 21l3 4V21" stroke="#126f38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <path d="M10 2C6.69 2 4 4.69 4 8c0 5.25 6 10 6 10s6-4.75 6-10c0-3.31-2.69-6-6-6z" fill="#1f4488"/>
      <circle cx="10" cy="8" r="2.5" fill="#fff"/>
    </svg>
  )
}

// ─── Enrollment Session Picker Modal ──────────────────────────────────────────

interface EnrollModalProps {
  onClose: () => void
  sessions: CourseSession[]
  courseTitle: string
  priceGeneral: number
  priceAssociation?: number | null
  priceType: string
}

function EnrollModal({ onClose, sessions, courseTitle, priceGeneral, priceAssociation, priceType }: EnrollModalProps) {
  const router = useRouter()
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)

  const openSessions = sessions.filter(s => {
    if (s.is_cancelled) return false
    const now = Date.now()
    const end = new Date(s.enrollment_end).getTime()
    return end >= now
  })

  const selectedSession = openSessions.find(s => s.session_id === selectedSessionId)

  const handleConfirm = async () => {
    if (!selectedSessionId) {
      setEnrollError('กรุณาเลือกรอบการอบรม')
      return
    }
    setIsEnrolling(true)
    setEnrollError(null)
    try {
      await enrollCourse(selectedSessionId)
      router.push('/member/payments')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setEnrollError(msg ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
      setIsEnrolling(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff', borderRadius: 20,
          padding: 40, maxWidth: 560, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 22, color: '#1f4488', margin: 0, lineHeight: '28px' }}>
              เลือกรอบการอบรม
            </h2>
            <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', margin: '4px 0 0' }}>{courseTitle}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#7b7b7b', fontSize: 24, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Session list */}
        {openSessions.length === 0 ? (
          <div style={{
            backgroundColor: '#fff8e6', borderRadius: 12, padding: '16px 20px',
            fontFamily: 'var(--font-thai)', fontSize: 15, color: '#92610b', marginBottom: 24,
          }}>
            ขณะนี้ไม่มีรอบที่เปิดรับสมัคร กรุณาติดตามประกาศจาก TIBA
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {openSessions.map((s, idx) => {
              const isSelected = selectedSessionId === s.session_id
              const status = getEnrollmentStatus(s)
              return (
                <button
                  key={s.session_id}
                  onClick={() => setSelectedSessionId(s.session_id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                    padding: '16px 20px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    border: isSelected ? '2px solid #1f4488' : '1.5px solid #e5e7eb',
                    backgroundColor: isSelected ? '#f0f4ff' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 15, color: '#1f4488' }}>
                      {s.session_label || `รุ่นที่ ${idx + 1}`}
                    </span>
                    <SessionBadge status={status} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#374151' }}>
                    อบรม: {formatDateRange(s.training_start, s.training_end)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b' }}>
                    รับสมัครถึง: {formatThaiShort(s.enrollment_end)}
                  </span>
                  {s.location && (
                    <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b' }}>
                      สถานที่: {s.location}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Price preview */}
        {selectedSession && (
          <div style={{ backgroundColor: '#f0f4ff', borderRadius: 12, padding: '14px 20px', marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 13, color: '#1f4488', margin: '0 0 8px' }}>
              ค่าลงทะเบียน
            </p>
            {priceType === 'dual' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-thai)', fontSize: 15 }}>
                  <span style={{ color: '#444' }}>สมาชิกทั่วไป</span>
                  <span style={{ fontWeight: 700, color: '#0a0a0a' }}>{formatPrice(priceGeneral)} บาท</span>
                </div>
                {priceAssociation != null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-thai)', fontSize: 15 }}>
                    <span style={{ color: '#444' }}>สมาชิกสมาคม</span>
                    <span style={{ fontWeight: 700, color: '#126f38' }}>{formatPrice(priceAssociation)} บาท</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-thai)', fontSize: 16 }}>
                <span style={{ color: '#444' }}>ราคา</span>
                <span style={{ fontWeight: 700, color: '#0a0a0a', fontSize: 20 }}>{formatPrice(priceGeneral)} บาท</span>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {enrollError && (
          <div style={{
            backgroundColor: '#fee2e2', borderRadius: 10, padding: '12px 16px',
            fontFamily: 'var(--font-thai)', fontSize: 14, color: '#dc2626', marginBottom: 16,
          }}>
            {enrollError}
          </div>
        )}

        {/* Confirm button */}
        {openSessions.length > 0 && (
          <button
            onClick={handleConfirm}
            disabled={isEnrolling || !selectedSessionId}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '14px 24px', borderRadius: 10, border: 'none',
              cursor: isEnrolling || !selectedSessionId ? 'not-allowed' : 'pointer',
              background: isEnrolling || !selectedSessionId
                ? '#d1d5db'
                : 'linear-gradient(135deg, #126f38 0%, #1f4488 100%)',
              fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 16, color: '#fff',
              transition: 'background 0.15s',
            }}
          >
            {isEnrolling ? 'กำลังลงทะเบียน...' : 'ยืนยันการลงทะเบียน'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Payment Modal (shown when no member_token) ────────────────────────────────

interface PaymentModalProps {
  onClose: () => void
  priceGeneral: number
  priceAssociation?: number
  priceType: string
  courseTitle: string
}

function PaymentModal({ onClose, priceGeneral, priceAssociation, priceType, courseTitle }: PaymentModalProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff', borderRadius: 20,
          padding: 40, maxWidth: 520, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 22, color: '#1f4488', margin: 0, lineHeight: '28px' }}>
              ข้อมูลการชำระเงิน
            </h2>
            <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', margin: '4px 0 0' }}>{courseTitle}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#7b7b7b', fontSize: 24, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Prices */}
        <div style={{ backgroundColor: '#f0f4ff', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 14, color: '#1f4488', margin: '0 0 12px' }}>ค่าลงทะเบียน</p>
          {priceType === 'dual' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-thai)', fontSize: 16 }}>
                <span style={{ color: '#444' }}>สมาชิกทั่วไป</span>
                <span style={{ fontWeight: 700, color: '#0a0a0a' }}>{formatPrice(priceGeneral)} บาท</span>
              </div>
              {priceAssociation != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-thai)', fontSize: 16 }}>
                  <span style={{ color: '#444' }}>สมาชิกสมาคม</span>
                  <span style={{ fontWeight: 700, color: '#126f38' }}>{formatPrice(priceAssociation)} บาท</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-thai)', fontSize: 18 }}>
              <span style={{ color: '#444' }}>ราคา</span>
              <span style={{ fontWeight: 700, color: '#0a0a0a', fontSize: 22 }}>{formatPrice(priceGeneral)} บาท</span>
            </div>
          )}
        </div>

        {/* Bank info */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 14, color: '#444', margin: '0 0 12px' }}>ชำระเงินผ่านการโอนเงินธนาคาร</p>
          <div style={{
            border: '1px solid #dfdfdf', borderRadius: 12, padding: 16,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', gap: 8, fontFamily: 'var(--font-thai)', fontSize: 15 }}>
              <span style={{ color: '#7b7b7b', minWidth: 100 }}>ธนาคาร</span>
              <span style={{ fontWeight: 600, color: '#0a0a0a' }}>ไทยพาณิชย์ (SCB)</span>
            </div>
            <div style={{ display: 'flex', gap: 8, fontFamily: 'var(--font-thai)', fontSize: 15 }}>
              <span style={{ color: '#7b7b7b', minWidth: 100 }}>ชื่อบัญชี</span>
              <span style={{ fontWeight: 600, color: '#0a0a0a' }}>สมาคม TIBA</span>
            </div>
            <div style={{ display: 'flex', gap: 8, fontFamily: 'var(--font-thai)', fontSize: 15 }}>
              <span style={{ color: '#7b7b7b', minWidth: 100 }}>เลขบัญชี</span>
              <span style={{ fontWeight: 600, color: '#0a0a0a' }}>xxx-x-xxxxx-x</span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff8e6', borderRadius: 10, padding: '12px 16px',
          fontFamily: 'var(--font-thai)', fontSize: 13, color: '#92610b', marginBottom: 24,
          lineHeight: '20px',
        }}>
          หลังโอนเงินแล้ว กรุณาส่งหลักฐานการชำระเงินมาที่อีเมล ibathai@gmail.com หรือ Line: @961lmkof
        </div>

        <Link
          href="/login"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 24px', borderRadius: 10, textDecoration: 'none',
            background: 'linear-gradient(135deg, #126f38 0%, #1f4488 100%)',
            fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 16, color: '#fff',
          }}
        >
          เข้าสู่ระบบเพื่อลงทะเบียน
          <ArrowRightIcon color="#fff" />
        </Link>
      </div>
    </div>
  )
}

// ─── Session Status Badge ─────────────────────────────────────────────────────

function SessionBadge({ status }: { status: ReturnType<typeof getEnrollmentStatus> }) {
  const map = {
    open:      { label: 'เปิดรับสมัคร', color: '#15803d', bg: '#dcfce7' },
    upcoming:  { label: 'เร็ว ๆ นี้', color: '#1d4ed8', bg: '#dbeafe' },
    closed:    { label: 'ปิดรับสมัคร', color: '#6b7280', bg: '#f3f4f6' },
    cancelled: { label: 'ยกเลิก', color: '#dc2626', bg: '#fee2e2' },
  }
  const { label, color, bg } = map[status]
  return (
    <span style={{
      display: 'inline-block', padding: '3px 12px', borderRadius: 999,
      fontSize: 13, fontWeight: 600, color, backgroundColor: bg,
      fontFamily: 'var(--font-thai)',
    }}>
      {label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal]   = useState(false)
  const [memberToken, setMemberToken] = useState<string | null>(null)

  // Read member_token from localStorage on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMemberToken(localStorage.getItem('member_token'))
    }
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['public-course', id],
    queryFn: () => publicService.getCourse(id),
    enabled: !!id,
  })

  const course = data?.course
  const sessions = data?.sessions ?? []

  // Open the right modal depending on auth state
  const handleEnrollClick = () => {
    if (memberToken && sessions.length > 0) {
      setShowEnrollModal(true)
    } else {
      setShowPaymentModal(true)
    }
  }

  // Find the next upcoming or open session
  const now = Date.now()
  const upcomingSessions = sessions
    .filter(s => !s.is_cancelled && new Date(s.enrollment_end).getTime() >= now)
    .sort((a, b) => new Date(a.training_start).getTime() - new Date(b.training_start).getTime())

  const featuredSession = upcomingSessions[0] ?? sessions[0]

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid #e5e7eb',
            borderTopColor: '#1f4488',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontFamily: 'var(--font-thai)', color: '#7b7b7b', fontSize: 15 }}>กำลังโหลด...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <p style={{ fontFamily: 'var(--font-thai)', color: '#7b7b7b', fontSize: 16, marginBottom: 16 }}>ไม่พบหลักสูตรนี้</p>
        <Link href="/courses" style={{ color: '#1f4488', fontFamily: 'var(--font-thai)', fontSize: 16 }}>← กลับหน้าหลักสูตร</Link>
      </div>
    )
  }

  const contentWidth = { maxWidth: 1200, margin: '0 auto', padding: '0 80px' }
  const cardWidth = 820

  return (
    <div>

      {/* ── 1. BANNER ─────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes bannerScroll {
          0%   { transform: scale(1.08) translateX(0%); }
          100% { transform: scale(1.08) translateX(-4%); }
        }
        @keyframes bannerScrollFallback {
          0%   { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
      <section style={{ height: 420, position: 'relative', overflow: 'hidden', backgroundColor: '#132953' }}>
        {course.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail_url}
            alt={course.title}
            style={{
              width: '104%', height: '100%', objectFit: 'cover',
              animation: 'bannerScroll 12s ease-in-out alternate infinite',
              transformOrigin: 'left center',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #132953 0%, #1f4488 40%, #126f38 70%, #132953 100%)',
            backgroundSize: '300% 100%',
            animation: 'bannerScrollFallback 10s ease-in-out alternate infinite',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 96,
              color: 'rgba(255,255,255,0.10)', letterSpacing: '-3px', userSelect: 'none',
            }}>
              TIBA
            </span>
          </div>
        )}
        {/* Bottom gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(19,41,83,0) 30%, rgba(19,41,83,0.75) 100%)',
          pointerEvents: 'none',
        }} />
        {/* Course title overlay at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0 80px 32px',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 36,
            color: '#fff', margin: 0, lineHeight: '46px',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            maxWidth: 820,
          }}>
            {course.title}
          </h1>
        </div>
      </section>

      {/* ── 2. PAGE NAME / BREADCRUMB ─────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#132953' }}>
        <div style={{ ...contentWidth, padding: '18px 80px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/home" style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>หน้าหลัก</Link>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>/</span>
            <Link href="/courses" style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>คอร์สอบรม</Link>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>/</span>
            <span style={{
              fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 15, color: '#fff',
              maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {course.title}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. COURSE SCHEDULE CARD (blue bg) ─────────────────────────────────── */}
      <section style={{ backgroundColor: '#1f4488', padding: '72px 0' }}>
        <div style={{ ...contentWidth, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: cardWidth, borderRadius: 20,
            boxShadow: '0 8px 40px rgba(0,0,0,0.20)',
            overflow: 'hidden',
          }}>

            {/* Card top info */}
            <div style={{ backgroundColor: '#fff', padding: '40px 48px 32px', borderBottom: '1px solid #e8edf5' }}>

              {/* Section label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(180deg, #126f38 0%, #1f4488 100%)' }} />
                <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 22, color: '#132953' }}>
                  ตารางการอบรม
                </span>
              </div>

              {/* 2x2 info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 40px' }}>

                {/* วันที่อบรม */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <CalendarIcon />
                  <div>
                    <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', display: 'block', marginBottom: 4 }}>วันที่อบรม</span>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 20, color: '#0a0a0a', lineHeight: '26px' }}>
                      {featuredSession
                        ? formatDateRange(featuredSession.training_start, featuredSession.training_end)
                        : '–'}
                    </span>
                  </div>
                </div>

                {/* สถานที่ */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <MarkerIcon />
                  <div>
                    <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', display: 'block', marginBottom: 4 }}>สถานที่อบรม</span>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 20, color: '#0a0a0a', lineHeight: '26px' }}>
                      {featuredSession?.location || (course.format === 'online' ? 'ออนไลน์' : '–')}
                    </span>
                  </div>
                </div>

                {/* วันเปิดรับสมัคร */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <EnrollCalendarIcon />
                  <div>
                    <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', display: 'block', marginBottom: 4 }}>วันเปิดรับสมัคร</span>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 20, color: '#0a0a0a', lineHeight: '26px' }}>
                      {featuredSession
                        ? `${formatThaiFull(featuredSession.enrollment_start)} – ${formatThaiFull(featuredSession.enrollment_end)}`
                        : '–'}
                    </span>
                  </div>
                </div>

                {/* รูปแบบ / ชั่วโมง */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <ClockIcon />
                  <div>
                    <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', display: 'block', marginBottom: 4 }}>รูปแบบ / ชั่วโมงอบรม</span>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 20, color: '#0a0a0a', lineHeight: '26px' }}>
                      {course.format === 'online' ? 'ออนไลน์' : 'ออนไซต์'}
                      {course.total_hours ? ` · ${course.total_hours} ชั่วโมง` : ''}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Action buttons */}
            <div style={{
              backgroundColor: '#fff', padding: '20px 48px 28px',
              display: 'flex', gap: 16,
            }}>
              <button
                onClick={() => handleEnrollClick()}
                style={{
                  flex: 1, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
                  padding: '14px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #126f38 0%, #1f4488 100%)',
                  fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 18, color: '#fff',
                  transition: 'opacity 0.15s',
                }}
              >
                ลงทะเบียนเรียน
                <ArrowRightIcon color="#fff" />
              </button>

              {course.thumbnail_url ? (
                <a
                  href={course.thumbnail_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
                    padding: '14px 20px', borderRadius: 10, textDecoration: 'none',
                    border: '1.5px solid #dfdfdf', backgroundColor: '#fff', cursor: 'pointer',
                    fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 18, color: '#0a0a0a',
                  }}
                >
                  ดาวน์โหลดโบชัวร์
                  <DownloadIcon color="#0a0a0a" />
                </a>
              ) : (
                <button
                  disabled
                  style={{
                    flex: 1, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
                    padding: '14px 20px', borderRadius: 10,
                    border: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'not-allowed',
                    fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 18, color: '#9ca3af',
                  }}
                >
                  ดาวน์โหลดโบชัวร์
                  <DownloadIcon color="#9ca3af" />
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. ALL SESSIONS TABLE (if more than 1) ────────────────────────────── */}
      {sessions.length > 1 && (
        <section style={{ backgroundColor: '#f7f8fc', padding: '72px 0' }}>
          <div style={{ ...contentWidth }}>
            <h2 style={{
              fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 30,
              color: '#1f4488', margin: '0 0 32px', textAlign: 'center',
            }}>
              ตารางการอบรม
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sessions.map((s, idx) => {
                const status = getEnrollmentStatus(s)
                return (
                  <div
                    key={s.session_id}
                    style={{
                      backgroundColor: '#fff', borderRadius: 16,
                      padding: '24px 32px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
                      borderLeft: status === 'open' ? '4px solid #126f38' : status === 'upcoming' ? '4px solid #1f4488' : '4px solid #e5e7eb',
                    }}
                  >
                    {/* Session label */}
                    <div style={{ minWidth: 80 }}>
                      <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 18, color: '#1f4488' }}>
                        {s.session_label || `รุ่นที่ ${idx + 1}`}
                      </span>
                    </div>

                    {/* Dates */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b', display: 'block', marginBottom: 2 }}>วันที่อบรม</span>
                      <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 15, color: '#0a0a0a' }}>
                        {formatDateRange(s.training_start, s.training_end)}
                      </span>
                    </div>

                    {/* Enrollment dates */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b', display: 'block', marginBottom: 2 }}>เปิดรับสมัคร</span>
                      <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 15, color: '#0a0a0a' }}>
                        {formatThaiShort(s.enrollment_start)} – {formatThaiShort(s.enrollment_end)}
                      </span>
                    </div>

                    {/* Location */}
                    {s.location && (
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b', display: 'block', marginBottom: 2 }}>สถานที่</span>
                        <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 15, color: '#0a0a0a' }}>{s.location}</span>
                      </div>
                    )}

                    {/* Status + button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 130 }}>
                      <SessionBadge status={status} />
                      {(status === 'open' || status === 'upcoming') && (
                        <button
                          onClick={() => handleEnrollClick()}
                          style={{
                            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #126f38 0%, #1f4488 100%)',
                            fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 14, color: '#fff',
                          }}
                        >
                          สมัครรุ่นนี้
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. COURSE EXPECTATION ─────────────────────────────────────────────── */}
      {course.description && (() => {
        const lines = course.description.split('\n').map(l => l.trim()).filter(Boolean)
        return (
          <section style={{ backgroundColor: '#f7f8fc', padding: '72px 0' }}>
            <div style={{ ...contentWidth }}>
              <h2 style={{
                fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 30,
                color: '#1f4488', margin: '0 0 40px', textAlign: 'center',
              }}>
                สิ่งที่จะได้จากคอร์สนี้
              </h2>
              <div style={{
                maxWidth: cardWidth, margin: '0 auto',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                {lines.map((line, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#fff', borderRadius: 16, padding: '24px 28px',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    display: 'flex', alignItems: 'flex-start', gap: 20,
                  }}>
                    {/* Green checkmark circle */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #126f38 0%, #1f4488 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M4 9l4 4 6-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-thai)', fontSize: 17, lineHeight: '28px',
                      color: '#1a1a2e', margin: 0, paddingTop: 4,
                    }}>
                      {line}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ── 6. ABOUT COURSE ───────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#fff', padding: '72px 0' }}>
        <div style={{ ...contentWidth }}>
          <h2 style={{
            fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 30,
            color: '#1f4488', margin: '0 0 40px', textAlign: 'center',
          }}>
            เกี่ยวกับคอร์สนี้
          </h2>
          <div style={{ maxWidth: cardWidth, margin: '0 auto' }}>

            {/* Course detail cards — format, hours, sessions, price type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{
                backgroundColor: '#f7f8fc', borderRadius: 14, padding: '20px 24px',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b' }}>รูปแบบการอบรม</span>
                <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 18, color: '#1f4488' }}>
                  {course.format === 'online' ? 'ออนไลน์ (Online)' : 'ออนไซต์ (On-Site)'}
                </span>
              </div>
              {course.total_hours ? (
                <div style={{
                  backgroundColor: '#f7f8fc', borderRadius: 14, padding: '20px 24px',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b' }}>จำนวนชั่วโมงอบรม</span>
                  <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 18, color: '#1f4488' }}>
                    {course.total_hours} ชั่วโมง
                  </span>
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#f7f8fc', borderRadius: 14, padding: '20px 24px',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b' }}>จำนวนรุ่น</span>
                  <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 18, color: '#1f4488' }}>
                    {course.sessions_count ?? '–'} รุ่น
                  </span>
                </div>
              )}
            </div>

            {course.format === 'online' && course.online_link && (
              <div style={{
                backgroundColor: '#e8f0fe', borderRadius: 12, padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#1f4488', fontWeight: 600 }}>🔗 ลิงก์การอบรม:</span>
                <a href={course.online_link} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-eng)', fontSize: 14, color: '#1f4488', textDecoration: 'underline' }}>
                  {course.online_link}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 7. ABOUT TUTOR ────────────────────────────────────────────────────── */}
      {course.tutors && course.tutors.length > 0 && (
        <section style={{ backgroundColor: '#fff', padding: '72px 0' }}>
          <div style={{ ...contentWidth }}>

            {/* Centered heading */}
            <h2 style={{
              fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 30,
              color: '#1f4488', margin: '0 0 40px', textAlign: 'center',
            }}>
              เกี่ยวกับผู้สอน
            </h2>

            {/* 2-column grid — horizontal cards */}
            <div style={{
              maxWidth: cardWidth, margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: course.tutors.length === 1 ? '1fr' : '1fr 1fr',
              gap: 20,
            }}>
              {course.tutors.map(t => (
                <div key={t.tutor_id} style={{
                  backgroundColor: '#fff', borderRadius: 16,
                  padding: '20px 24px',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                  border: '1px solid #f0f4ff',
                  display: 'flex', alignItems: 'center', gap: 20,
                }}>
                  {/* Circular photo */}
                  {t.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.photo_url}
                      alt={t.name}
                      style={{
                        width: 80, height: 80, borderRadius: '50%',
                        objectFit: 'cover', flexShrink: 0,
                        border: '3px solid #e8f0fe',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #126f38 0%, #1f4488 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-thai)',
                    }}>
                      {t.name.charAt(0)}
                    </div>
                  )}
                  {/* Name + position */}
                  <div>
                    <p style={{
                      fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 17,
                      color: '#0a0a0a', margin: '0 0 4px', lineHeight: '22px',
                    }}>
                      {t.name}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-thai)', fontSize: 14,
                      color: '#7b7b7b', margin: 0, lineHeight: '20px',
                    }}>
                      {t.position}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LOCATION TRAINING (kept with correct numbering) ─────────────────── */}
      {sessions.some(s => s.location) && (
        <section style={{ backgroundColor: '#fff', padding: '72px 0' }}>
          <div style={{ ...contentWidth, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: cardWidth }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{ width: 5, height: 40, borderRadius: 3, background: 'linear-gradient(180deg, #126f38 0%, #1f4488 100%)' }} />
                <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 28, color: '#1f4488', margin: 0 }}>
                  สถานที่อบรม
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Array.from(new Set(sessions.filter(s => s.location).map(s => s.location))).map((loc, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#f7f8fc', borderRadius: 14, padding: '20px 24px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        backgroundColor: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <MapPinIcon />
                      </div>
                      <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#0a0a0a' }}>
                        {loc}
                      </span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc ?? '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                        border: '1.5px solid #1f4488',
                        fontFamily: 'var(--font-thai)', fontSize: 14, fontWeight: 600, color: '#1f4488',
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}
                    >
                      ดูแผนที่
                      <ArrowRightIcon color="#1f4488" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 8. COURSE PRICING ────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#1f4488', padding: '72px 0' }}>
        <div style={{ ...contentWidth, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: cardWidth }}>

            <h2 style={{
              fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 30,
              color: '#fff', margin: '0 0 32px', textAlign: 'center',
            }}>
              ค่าลงทะเบียน
            </h2>

            {/* Price cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: course.price_type === 'dual' && course.price_association != null ? '1fr 1fr' : '1fr',
              gap: 20,
              marginBottom: 28,
            }}>
              {/* General price */}
              <div style={{
                backgroundColor: '#fff', borderRadius: 20, padding: '32px 36px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', fontWeight: 600 }}>
                  {course.price_type === 'dual' ? 'สมาชิกทั่วไป' : 'ค่าลงทะเบียน'}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{
                    fontFamily: 'var(--font-eng)', fontWeight: 800, fontSize: 44,
                    color: '#1f4488', lineHeight: 1,
                  }}>
                    {formatPrice(course.price_general)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 18, color: '#444' }}>บาท</span>
                </div>
              </div>

              {/* Association price */}
              {course.price_type === 'dual' && course.price_association != null && (
                <div style={{
                  backgroundColor: '#126f38', borderRadius: 20, padding: '32px 36px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                }}>
                  <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                    สมาชิกสมาคม
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{
                      fontFamily: 'var(--font-eng)', fontWeight: 800, fontSize: 44,
                      color: '#fff', lineHeight: 1,
                    }}>
                      {formatPrice(course.price_association)}
                    </span>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 18, color: 'rgba(255,255,255,0.8)' }}>บาท</span>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => handleEnrollClick()}
                style={{
                  flex: 1, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
                  padding: '14px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  backgroundColor: '#fff',
                  fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 17, color: '#1f4488',
                }}
              >
                ลงทะเบียนเรียน
                <ArrowRightIcon color="#1f4488" />
              </button>

              {course.thumbnail_url ? (
                <a
                  href={course.thumbnail_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
                    padding: '14px 20px', borderRadius: 12, textDecoration: 'none',
                    border: '1.5px solid rgba(255,255,255,0.5)', backgroundColor: 'transparent',
                    fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 17, color: '#fff',
                  }}
                >
                  ดาวน์โหลดโบชัวร์
                  <DownloadIcon color="#fff" />
                </a>
              ) : (
                <button
                  disabled
                  style={{
                    flex: 1, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
                    padding: '14px 20px', borderRadius: 12,
                    border: '1.5px solid rgba(255,255,255,0.3)', backgroundColor: 'transparent',
                    fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 17, color: 'rgba(255,255,255,0.5)',
                    cursor: 'not-allowed',
                  }}
                >
                  ดาวน์โหลดโบชัวร์
                  <DownloadIcon color="rgba(255,255,255,0.5)" />
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── 9. COURSE CONTACT ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#fff', padding: '72px 0' }}>
        <div style={{ ...contentWidth, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>

          <h2 style={{
            fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 30,
            color: '#1f4488', margin: 0, textAlign: 'center',
          }}>
            สอบถามข้อมูลเพิ่มเติม
          </h2>

          <div style={{ width: cardWidth, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Row 1: Phone + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Phone */}
              <div style={{
                backgroundColor: '#fff', borderRadius: 16, padding: '28px 28px',
                boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
                display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <PhoneIcon />
                  <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 26, color: '#126f38' }}>Contact Number</span>
                </div>
                <div style={{ display: 'flex', gap: 20, fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 15 }}>
                  <a href="tel:026451133" style={{ color: '#555', textDecoration: 'none' }}>Call : 02 645 1133</a>
                  <span style={{ color: '#555' }}>Fax : 02 645 1134</span>
                </div>
              </div>

              {/* Email */}
              <div style={{
                backgroundColor: '#fff', borderRadius: 16, padding: '28px 28px',
                boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
                display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <EmailIcon />
                  <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 26, color: '#126f38' }}>Email</span>
                </div>
                <a href="mailto:ibathai@gmail.com" style={{
                  fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 15, color: '#555',
                  textDecoration: 'none',
                }}>
                  ibathai@gmail.com
                </a>
              </div>
            </div>

            {/* Row 2: Facebook + Line */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Facebook */}
              <div style={{
                backgroundColor: '#fff', borderRadius: 16, padding: '28px 28px',
                boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
                display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <FacebookIcon />
                  <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 26, color: '#126f38' }}>Facebook</span>
                </div>
                <a
                  href="https://www.facebook.com/IBATHAI/?ref=embed_page#"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 15, color: '#555', textDecoration: 'none' }}
                >
                  facebook.com/IBATHAI
                </a>
              </div>

              {/* Line */}
              <div style={{
                backgroundColor: '#fff', borderRadius: 16, padding: '28px 28px',
                boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
                display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <LineIcon />
                  <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 26, color: '#126f38' }}>Line</span>
                </div>
                <a
                  href="https://line.me/R/ti/p/@961lmkof"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 15, color: '#555', textDecoration: 'none' }}
                >
                  @961lmkof
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Enrollment Modal (logged-in member with sessions) ─────────────────── */}
      {showEnrollModal && (
        <EnrollModal
          onClose={() => setShowEnrollModal(false)}
          sessions={sessions}
          courseTitle={course.title}
          priceGeneral={course.price_general}
          priceAssociation={course.price_association}
          priceType={course.price_type}
        />
      )}

      {/* ── Payment Info Modal (guest / no token) ─────────────────────────────── */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          priceGeneral={course.price_general}
          priceAssociation={course.price_association}
          priceType={course.price_type}
          courseTitle={course.title}
        />
      )}

    </div>
  )
}
