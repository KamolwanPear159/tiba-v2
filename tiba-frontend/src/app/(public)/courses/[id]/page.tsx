'use client'

import React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/lib/api/services/public.service'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatThaiDate(iso: string) {
  const d = new Date(iso)
  const months = [
    'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
    'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CalendarDayIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <rect x="6" y="10" width="36" height="32" rx="4" stroke="#1f4488" strokeWidth="2"/>
      <path d="M6 20h36" stroke="#1f4488" strokeWidth="2"/>
      <path d="M16 6v8M32 6v8" stroke="#1f4488" strokeWidth="2" strokeLinecap="round"/>
      <rect x="12" y="26" width="7" height="7" rx="1" fill="#1f4488"/>
      <rect x="21" y="26" width="7" height="7" rx="1" fill="#1f4488"/>
    </svg>
  )
}

function PayrollCalendarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <rect x="6" y="10" width="36" height="32" rx="4" stroke="#1f4488" strokeWidth="2"/>
      <path d="M6 20h36" stroke="#1f4488" strokeWidth="2"/>
      <path d="M16 6v8M32 6v8" stroke="#1f4488" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="32" r="6" stroke="#126f38" strokeWidth="1.5"/>
      <path d="M24 28v1M24 35v1" stroke="#126f38" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M21.5 31c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5" stroke="#126f38" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function MarkerIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <path d="M24 6C18.477 6 14 10.477 14 16c0 7.778 10 22 10 22s10-14.222 10-22C34 10.477 29.523 6 24 6z" stroke="#1f4488" strokeWidth="2"/>
      <circle cx="24" cy="16" r="4" stroke="#1f4488" strokeWidth="2"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="24" cy="24" r="16" stroke="#1f4488" strokeWidth="2"/>
      <path d="M24 14v10l6 4" stroke="#1f4488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ArrowRightIcon({ color = '#fff' }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params

  const { data: course, isLoading } = useQuery({
    queryKey: ['public-course', id],
    queryFn: () => publicService.getCourse(id),
    enabled: !!id,
  })

  const { data: sessions } = useQuery({
    queryKey: ['public-course-sessions', id],
    queryFn: () => publicService.getCourseSessions(id),
    enabled: !!id,
  })

  const firstSession = sessions?.[0]

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <span style={{ fontFamily: 'var(--font-thai)', color: '#7b7b7b', fontSize: 16 }}>กำลังโหลด...</span>
      </div>
    )
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ fontFamily: 'var(--font-thai)', color: '#7b7b7b', fontSize: 16, marginBottom: 16 }}>ไม่พบหลักสูตรนี้</p>
        <Link href="/courses" style={{ color: '#1f4488', fontFamily: 'var(--font-thai)', fontSize: 16 }}>กลับหน้าหลักสูตร</Link>
      </div>
    )
  }

  return (
    <div>
      {/* ── Banner Image ── */}
      <section style={{ height: 350, position: 'relative', overflow: 'hidden' }}>
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(225deg, #126f38 0%, #1f4488 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 64, color: 'rgba(255,255,255,0.3)' }}>
              {course.title.charAt(0)}
            </span>
          </div>
        )}
      </section>

      {/* ── Breadcrumb ── */}
      <div style={{ backgroundColor: '#132953', padding: '16px 80px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/home" style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff', textDecoration: 'none' }}>หน้าหลัก</Link>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>/</span>
          <Link href="/courses" style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#fff', textDecoration: 'none' }}>คอร์สอบรม</Link>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#fff' }}>{course.title}</span>
        </div>
      </div>

      {/* ── Info Card Section (blue bg) ── */}
      <div style={{
        backgroundColor: '#1f4488',
        padding: '80px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ width: 820, boxShadow: '0px 0px 24px rgba(0,0,0,0.10)', borderRadius: 16 }}>

          {/* Top info */}
          <div style={{
            background: '#fff', borderRadius: '16px 16px 0 0',
            borderBottom: '1px solid #dfdfdf',
            padding: 48, display: 'flex', flexDirection: 'column', gap: 32,
          }}>
            <p style={{
              fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 32,
              lineHeight: '40px', letterSpacing: '-0.16px', color: '#0a0a0a', margin: 0,
            }}>
              {course.title}
            </p>

            <div style={{ display: 'flex', gap: 48 }}>
              {/* Left col */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 48 }}>
                {/* วันที่เรียน */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <CalendarDayIcon />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#7b7b7b' }}>วันที่เรียน</span>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#0a0a0a' }}>
                      {firstSession ? formatThaiDate(firstSession.training_start) : '-'}
                    </span>
                  </div>
                </div>
                {/* วันเปิดจำหน่าย */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <PayrollCalendarIcon />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#7b7b7b' }}>วันเปิดจำหน่าย</span>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#0a0a0a' }}>
                      {firstSession ? formatThaiDate(firstSession.enrollment_start) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right col */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 48 }}>
                {/* สถานที่จัดเรียน */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <MarkerIcon />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#7b7b7b' }}>สถานที่จัดเรียน</span>
                    <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 24, lineHeight: '25px', letterSpacing: '-0.08px', color: '#0a0a0a' }}>
                      {firstSession ? firstSession.location : (course.format === 'online' ? 'Online' : 'On-Site')}
                    </span>
                  </div>
                </div>
                {/* รูปแบบ */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <ClockIcon />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#7b7b7b' }}>รูปแบบ</span>
                    <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#0a0a0a' }}>
                      {course.format === 'online' ? 'ออนไลน์' : 'ออนไซต์'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            background: '#fff', borderRadius: '0 0 16px 16px',
            padding: 24, display: 'flex', gap: 24, alignItems: 'stretch', height: 110, overflow: 'hidden',
          }}>
            <Link
              href="/login"
              style={{
                flex: 1, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
                padding: 16, borderRadius: 8, textDecoration: 'none',
                background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)',
                fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#fff',
              }}
            >
              ลงทะเบียนเรียน
              <ArrowRightIcon color="#fff" />
            </Link>
            <button
              style={{
                flex: 1, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
                padding: 16, borderRadius: 8, border: '1px solid #dfdfdf', background: '#fff', cursor: 'default',
                fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#0a0a0a',
              }}
            >
              ดาวน์โหลดโบชัวร์
              <ArrowRightIcon color="#0a0a0a" />
            </button>
          </div>

        </div>
      </div>

      {/* ── About Course ── */}
      {course.description && (
        <div style={{
          backgroundColor: '#fff',
          padding: '80px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40,
        }}>
          <p style={{
            fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32,
            color: '#1f4488', margin: 0, textAlign: 'center', width: '100%',
          }}>
            เกี่ยวกับคอร์สนี้
          </p>
          <div style={{ width: 820, fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#0a0a0a' }}>
            {course.description}
          </div>
        </div>
      )}

      {/* ── Contact Section ── */}
      <div style={{
        backgroundColor: '#fff',
        padding: '80px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40,
      }}>
        <p style={{
          fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32,
          color: '#1f4488', margin: 0, textAlign: 'center',
        }}>
          สอบถามข้อมูลเพิ่มเติม
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 820 }}>
          {/* Row 1 */}
          <div style={{ display: 'flex', gap: 16 }}>
            {/* Phone */}
            <div style={{
              flex: 1, background: '#fff', borderRadius: 16,
              boxShadow: '0px 0px 24px rgba(0,0,0,0.10)',
              padding: 24, height: 200, display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M10 8h6.5l3 8-3.5 2.5a26 26 0 0012.5 12.5L31 27.5l8 3V37a2 2 0 01-2 2C18 39 8 29 8 17a2 2 0 012-2V8z" stroke="#126f38" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 32, lineHeight: '40px', letterSpacing: '-0.16px', color: '#126f38' }}>Contact Number</span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#7b7b7b' }}>
                <span>Call : 02 645 1133</span>
                <span>Fax : 02 645 1134</span>
              </div>
            </div>
            {/* Email */}
            <div style={{
              flex: 1, background: '#fff', borderRadius: 16,
              boxShadow: '0px 0px 24px rgba(0,0,0,0.10)',
              padding: 24, height: 200, display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
                  <rect x="6" y="12" width="36" height="26" rx="3" stroke="#126f38" strokeWidth="2"/>
                  <path d="M6 14l18 13L42 14" stroke="#126f38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 32, lineHeight: '40px', letterSpacing: '-0.16px', color: '#126f38' }}>Email</span>
              </div>
              <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#7b7b7b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>ibathai@gmail.com</span>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'flex', gap: 16 }}>
            {/* Facebook */}
            <div style={{
              flex: 1, background: '#fff', borderRadius: 16,
              boxShadow: '0px 0px 24px rgba(0,0,0,0.10)',
              padding: 24, height: 200, display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
                  <rect width="48" height="48" rx="8" fill="#126f38"/>
                  <path d="M28 12h-4a6 6 0 00-6 6v4h-4v6h4v12h6V28h4l1-6h-5v-4a1 1 0 011-1h4v-5z" fill="#fff"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 32, lineHeight: '40px', letterSpacing: '-0.16px', color: '#126f38' }}>Facebook</span>
              </div>
              <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#7b7b7b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>facebook.com/IBATHAI</span>
            </div>
            {/* Line */}
            <div style={{
              flex: 1, background: '#fff', borderRadius: 16,
              boxShadow: '0px 0px 24px rgba(0,0,0,0.10)',
              padding: 24, height: 200, display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
                  <rect width="48" height="48" rx="10" fill="#126f38"/>
                  <path d="M24 10C16.268 10 10 15.6 10 22.5c0 4.2 2.3 7.9 5.9 10.3l-1 3.7 4.3-2.3c1.5.4 3 .6 4.8.6 7.732 0 14-5.6 14-12.3C38 15.6 31.732 10 24 10z" fill="#fff"/>
                  <path d="M17 25v-4M17 21h3M17 25h3M22 21v4M22 21l3 4V21" stroke="#126f38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 32, lineHeight: '40px', letterSpacing: '-0.16px', color: '#126f38' }}>Line</span>
              </div>
              <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#7b7b7b' }}>@TIBA</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
