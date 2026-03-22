'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PublicHeader from '@/components/layout/PublicHeader'
import PublicFooter from '@/components/layout/PublicFooter'
import { getMyPayments, uploadSlip } from '@/lib/api/services/member.service'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  id: string
  enrollment_id?: string
  amount?: number
  status: string
  created_at?: string
  updated_at?: string
  slip_url?: string
  course_title?: string
  enrollment?: {
    id?: string
    course_title?: string
    session?: { course?: { title?: string; name?: string } }
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

function formatAmount(n?: number) {
  if (n == null) return '—'
  return n.toLocaleString('th-TH') + ' บาท'
}

function getPaymentTitle(p: Payment): string {
  return (
    p.course_title ||
    p.enrollment?.course_title ||
    p.enrollment?.session?.course?.title ||
    p.enrollment?.session?.course?.name ||
    'คอร์สอบรม'
  )
}

function getEnrollmentId(p: Payment): string | undefined {
  return p.enrollment_id || p.enrollment?.id
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  pending:           { label: 'รอชำระเงิน',    bg: '#fffbea', color: '#d97706' },
  slip_uploaded:     { label: 'รอตรวจสอบสลิป', bg: '#eff6ff', color: '#1d4ed8' },
  confirmed:         { label: 'ยืนยันแล้ว',    bg: '#f0fdf4', color: '#16a34a' },
  payment_confirmed: { label: 'ยืนยันแล้ว',    bg: '#f0fdf4', color: '#16a34a' },
  rejected:          { label: 'ปฏิเสธ',        bg: '#fef2f2', color: '#dc2626' },
  cancelled:         { label: 'ยกเลิก',        bg: '#fef2f2', color: '#dc2626' },
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

// ─── Slip upload cell ─────────────────────────────────────────────────────────

function SlipUploader({
  enrollmentId,
  onSuccess,
}: {
  enrollmentId: string
  onSuccess: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      await uploadSlip(enrollmentId, file)
      onSuccess()
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || 'อัปโหลดไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          height: 36,
          padding: '0 14px',
          borderRadius: 8,
          border: '1.5px solid #1f4488',
          background: uploading ? '#f0f4ff' : '#fff',
          color: '#1f4488',
          fontFamily: 'var(--font-thai)',
          fontWeight: 600,
          fontSize: 13,
          cursor: uploading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
        }}
      >
        {uploading ? (
          <>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid #cbd5e1',
                borderTopColor: '#1f4488',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            กำลังอัปโหลด...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#1f4488" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M17 8l-5-5-5 5M12 3v12" stroke="#1f4488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            อัปโหลดสลิป
          </>
        )}
      </button>
      {uploadError && (
        <p style={{ fontFamily: 'var(--font-thai)', fontSize: 12, color: '#dc2626', margin: 0 }}>
          {uploadError}
        </p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const fetchPayments = () => {
    getMyPayments()
      .then(data => {
        const list = Array.isArray(data) ? data : data?.items ?? data?.payments ?? []
        setPayments(list)
      })
      .catch(err => {
        if (err?.response?.status === 401) {
          router.replace('/login')
        } else {
          setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
        }
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    const token = localStorage.getItem('member_token')
    if (!token) { router.replace('/login'); return }
    fetchPayments()
  }, [router])

  const handleSlipSuccess = () => {
    setSuccessMsg('อัปโหลดสลิปสำเร็จ กำลังรอการยืนยัน')
    fetchPayments()
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <PublicHeader />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Link href="/member/profile" style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#1f4488', textDecoration: 'none' }}>
            โปรไฟล์
          </Link>
          <span style={{ color: '#ccc' }}>/</span>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#555' }}>ประวัติการชำระเงิน</span>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 28, color: '#132953', margin: '0 0 4px' }}>
            ประวัติการชำระเงิน
          </h1>
          <p style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: '#7b7b7b', margin: 0 }}>
            รายการการชำระเงินทั้งหมดของท่าน
          </p>
        </div>

        {successMsg && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" fill="#16a34a" fillOpacity="0.15" stroke="#16a34a" strokeWidth="1.5" />
              <path d="M6 10l3 3 5-5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#166534' }}>{successMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
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
        ) : payments.length === 0 ? (
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              padding: 64,
              textAlign: 'center',
            }}
          >
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
              <rect x="8" y="16" width="48" height="32" rx="4" stroke="#d1d5db" strokeWidth="2" />
              <path d="M8 26h48" stroke="#d1d5db" strokeWidth="2" />
              <circle cx="20" cy="36" r="4" stroke="#d1d5db" strokeWidth="2" />
              <path d="M30 34h16M30 38h10" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p style={{ fontFamily: 'var(--font-thai)', fontSize: 18, fontWeight: 600, color: '#555', margin: '0 0 8px' }}>
              ยังไม่มีประวัติการชำระเงิน
            </p>
            <p style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: '#9ca3af', margin: 0 }}>
              เมื่อท่านลงทะเบียนคอร์ส รายการจะแสดงที่นี่
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {payments.map(p => {
              const enrollId = getEnrollmentId(p)
              const showUpload = p.status === 'pending' || p.status === 'slip_uploaded'
              return (
                <div
                  key={p.id}
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
                      background: '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#126f38" strokeWidth="1.5" />
                      <path d="M3 10h18" stroke="#126f38" strokeWidth="1.5" />
                      <circle cx="8" cy="15" r="2" stroke="#126f38" strokeWidth="1.5" />
                      <path d="M13 14h6M13 17h4" stroke="#126f38" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 16, color: '#132953', margin: '0 0 4px' }}>
                      {getPaymentTitle(p)}
                    </p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', margin: 0 }}>
                        {formatThaiDate(p.created_at)}
                      </p>
                      <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, fontWeight: 600, color: '#132953', margin: 0 }}>
                        {formatAmount(p.amount)}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={p.status} />

                  {showUpload && enrollId && (
                    <SlipUploader enrollmentId={enrollId} onSuccess={handleSlipSuccess} />
                  )}

                  {p.slip_url && (
                    <a
                      href={p.slip_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        height: 36,
                        padding: '0 14px',
                        borderRadius: 8,
                        border: '1.5px solid #d1d5db',
                        background: '#fff',
                        color: '#555',
                        fontFamily: 'var(--font-thai)',
                        fontWeight: 600,
                        fontSize: 13,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#555" strokeWidth="1.8" />
                        <circle cx="12" cy="12" r="3" stroke="#555" strokeWidth="1.8" />
                      </svg>
                      ดูสลิป
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      <PublicFooter />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
