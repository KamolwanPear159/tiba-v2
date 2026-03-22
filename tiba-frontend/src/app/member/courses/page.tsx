'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PublicHeader from '@/components/layout/PublicHeader'
import PublicFooter from '@/components/layout/PublicFooter'
import { getMyEnrollments } from '@/lib/api/services/member.service'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Enrollment {
  id: string
  course_title?: string
  session_start_date?: string
  session_end_date?: string
  session_location?: string
  status: string
  created_at?: string
  course?: { title?: string; name?: string }
  session?: {
    start_date?: string
    end_date?: string
    location?: string
    course?: { title?: string; name?: string }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

function formatThaiDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
}

function getEnrollmentTitle(e: Enrollment): string {
  return (
    e.course_title ||
    e.course?.title ||
    e.course?.name ||
    e.session?.course?.title ||
    e.session?.course?.name ||
    'คอร์สอบรม'
  )
}

function getSessionDates(e: Enrollment): string {
  const start = e.session_start_date || e.session?.start_date
  const end = e.session_end_date || e.session?.end_date
  if (!start) return '—'
  return `${formatThaiDate(start)}${end ? ' – ' + formatThaiDate(end) : ''}`
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  pending_payment:    { label: 'รอชำระ',     bg: '#fffbea', color: '#d97706' },
  slip_uploaded:      { label: 'รอยืนยัน',   bg: '#eff6ff', color: '#1d4ed8' },
  payment_confirmed:  { label: 'ยืนยันแล้ว', bg: '#f0fdf4', color: '#16a34a' },
  confirmed:          { label: 'ยืนยันแล้ว', bg: '#f0fdf4', color: '#16a34a' },
  cancelled:          { label: 'ยกเลิก',     bg: '#fef2f2', color: '#dc2626' },
  completed:          { label: 'เสร็จสิ้น',  bg: '#f0fdf4', color: '#16a34a' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, bg: '#f5f5f5', color: '#555' }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 99,
        background: s.bg,
        color: s.color,
        fontFamily: 'var(--font-thai)',
        fontWeight: 600,
        fontSize: 13,
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyCoursesPage() {
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('member_token')
    if (!token) {
      router.replace('/login')
      return
    }
    getMyEnrollments()
      .then(data => {
        const list = Array.isArray(data) ? data : data?.items ?? data?.enrollments ?? []
        setEnrollments(list)
      })
      .catch(err => {
        if (err?.response?.status === 401) {
          router.replace('/login')
        } else {
          setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
        }
      })
      .finally(() => setIsLoading(false))
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <PublicHeader />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Link
            href="/member/profile"
            style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#1f4488', textDecoration: 'none' }}
          >
            โปรไฟล์
          </Link>
          <span style={{ color: '#ccc' }}>/</span>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#555' }}>คอร์สของฉัน</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: 'var(--font-thai)',
              fontWeight: 700,
              fontSize: 28,
              color: '#132953',
              margin: '0 0 4px',
            }}
          >
            คอร์สของฉัน
          </h1>
          <p style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: '#7b7b7b', margin: 0 }}>
            รายการคอร์สที่ท่านลงทะเบียนไว้
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 200,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '3px solid #e5e7eb',
                borderTopColor: '#1f4488',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        ) : error ? (
          <div
            style={{
              background: '#fff5f5',
              border: '1px solid #fecaca',
              borderRadius: 12,
              padding: 24,
              textAlign: 'center',
              color: '#dc2626',
              fontFamily: 'var(--font-thai)',
              fontSize: 15,
            }}
          >
            {error}
          </div>
        ) : enrollments.length === 0 ? (
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              padding: 64,
              textAlign: 'center',
            }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              style={{ margin: '0 auto 16px', display: 'block' }}
            >
              <rect x="8" y="12" width="48" height="40" rx="4" stroke="#d1d5db" strokeWidth="2" />
              <path d="M8 22h48" stroke="#d1d5db" strokeWidth="2" />
              <path d="M20 8v8M44 8v8" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 34h20M22 42h14" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p
              style={{
                fontFamily: 'var(--font-thai)',
                fontSize: 18,
                fontWeight: 600,
                color: '#555',
                margin: '0 0 8px',
              }}
            >
              ยังไม่ได้ลงทะเบียนคอร์สใด
            </p>
            <p
              style={{
                fontFamily: 'var(--font-thai)',
                fontSize: 15,
                color: '#9ca3af',
                margin: '0 0 24px',
              }}
            >
              เลือกคอร์สที่สนใจและลงทะเบียนได้เลย
            </p>
            <Link
              href="/courses"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 44,
                padding: '0 24px',
                borderRadius: 8,
                background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)',
                color: '#fff',
                fontFamily: 'var(--font-thai)',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              ดูคอร์สทั้งหมด
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {enrollments.map(e => (
              <div
                key={e.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  flexWrap: 'wrap',
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: '#eef3fb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#1f4488" strokeWidth="1.5" />
                    <path d="M3 9h18" stroke="#1f4488" strokeWidth="1.5" />
                    <path d="M8 2v3M16 2v3" stroke="#1f4488" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M7 14h10M7 18h6" stroke="#1f4488" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-thai)',
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#132953',
                      margin: '0 0 4px',
                    }}
                  >
                    {getEnrollmentTitle(e)}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-thai)',
                      fontSize: 14,
                      color: '#7b7b7b',
                      margin: 0,
                    }}
                  >
                    {getSessionDates(e)}
                  </p>
                </div>

                {/* Status */}
                <StatusBadge status={e.status} />

                {/* Action: go to payment if pending */}
                {(e.status === 'pending_payment' || e.status === 'slip_uploaded') && (
                  <Link
                    href="/member/payments"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      height: 36,
                      padding: '0 16px',
                      borderRadius: 8,
                      background: '#1f4488',
                      color: '#fff',
                      fontFamily: 'var(--font-thai)',
                      fontWeight: 600,
                      fontSize: 13,
                      textDecoration: 'none',
                    }}
                  >
                    {e.status === 'pending_payment' ? 'ชำระเงิน' : 'ดูสลิป'}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
