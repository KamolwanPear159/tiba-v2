'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PublicHeader from '@/components/layout/PublicHeader'
import PublicFooter from '@/components/layout/PublicFooter'
import { getMyCertificates } from '@/lib/api/services/member.service'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Certificate {
  id: string
  course_title?: string
  issued_at?: string
  certificate_path?: string
  certificate_url?: string
  course?: { title?: string; name?: string }
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

function getCertTitle(c: Certificate): string {
  return c.course_title || c.course?.title || c.course?.name || 'คอร์สอบรม'
}

function getCertDownloadUrl(c: Certificate): string {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
  if (c.certificate_url) return c.certificate_url
  if (c.certificate_path) {
    // If it's already a full URL, use it; otherwise prepend API base
    if (c.certificate_path.startsWith('http')) return c.certificate_path
    const base = API_URL.replace('/api/v1', '')
    return `${base}${c.certificate_path}`
  }
  return '#'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CertificatesPage() {
  const router = useRouter()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('member_token')
    if (!token) { router.replace('/login'); return }

    getMyCertificates()
      .then(data => {
        const list = Array.isArray(data) ? data : data?.items ?? data?.certificates ?? []
        setCertificates(list)
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
          <Link href="/member/profile" style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#1f4488', textDecoration: 'none' }}>
            โปรไฟล์
          </Link>
          <span style={{ color: '#ccc' }}>/</span>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#555' }}>ใบประกาศ</span>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 28, color: '#132953', margin: '0 0 4px' }}>
            ใบประกาศ
          </h1>
          <p style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: '#7b7b7b', margin: 0 }}>
            ใบประกาศนียบัตรที่ท่านได้รับ
          </p>
        </div>

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
        ) : certificates.length === 0 ? (
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
              <rect x="12" y="8" width="40" height="48" rx="4" stroke="#d1d5db" strokeWidth="2" />
              <path d="M20 20h24M20 28h24M20 36h16" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
              <circle cx="44" cy="48" r="8" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
              <path d="M41 48l2 2 4-4" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ fontFamily: 'var(--font-thai)', fontSize: 18, fontWeight: 600, color: '#555', margin: '0 0 8px' }}>
              ยังไม่มีใบประกาศ
            </p>
            <p style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: '#9ca3af', margin: '0 0 24px' }}>
              เมื่อท่านผ่านการอบรม ใบประกาศนียบัตรจะแสดงที่นี่
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {certificates.map(c => {
              const downloadUrl = getCertDownloadUrl(c)
              return (
                <div
                  key={c.id}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Decorative header */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #1f4488 0%, #126f38 100%)',
                      padding: '24px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="1.5" />
                        <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M15 17l1.5 1.5L19 16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-thai)',
                        fontWeight: 700,
                        fontSize: 14,
                        color: '#fff',
                        margin: 0,
                        lineHeight: '20px',
                      }}
                    >
                      ใบประกาศนียบัตร
                    </p>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-thai)',
                        fontWeight: 700,
                        fontSize: 16,
                        color: '#132953',
                        margin: 0,
                        lineHeight: '24px',
                      }}
                    >
                      {getCertTitle(c)}
                    </p>
                    {c.issued_at && (
                      <p style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b', margin: 0 }}>
                        ออกให้เมื่อ {formatThaiDate(c.issued_at)}
                      </p>
                    )}

                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        height: 40,
                        borderRadius: 8,
                        background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)',
                        color: '#fff',
                        fontFamily: 'var(--font-thai)',
                        fontWeight: 600,
                        fontSize: 14,
                        textDecoration: 'none',
                        marginTop: 'auto',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M7 10l5 5 5-5M12 15V3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      ดาวน์โหลดใบประกาศ
                    </a>
                  </div>
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
