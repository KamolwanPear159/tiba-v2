'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Course } from '@/types'
import { getImageUrl } from '@/lib/utils/format'

// ─── Status config ─────────────────────────────────────────────────────────────
export type CourseStatus = 'urgent' | 'upcoming' | 'ended' | 'empty'

const HEADER_BG: Record<CourseStatus, string> = {
  urgent:   '#ee7429',
  upcoming: '#1f4488',
  ended:    '#7b7b7b',
  empty:    '#dfdfdf',
}

// ─── Empty placeholder card ────────────────────────────────────────────────────
export function EmptyCourseCard() {
  return (
    <div style={{ borderRadius: 16, boxShadow: '0px 0px 24px 0px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
      {/* Gray header */}
      <div style={{ height: 56, backgroundColor: '#dfdfdf', flexShrink: 0, borderRadius: '16px 16px 0 0' }} />
      {/* Gray thumbnail */}
      <div style={{ height: 186, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#dfdfdf' }}>ยังไม่มีคอร์ส</span>
      </div>
      {/* Skeleton content */}
      <div style={{ padding: 24, borderBottom: '1px solid #f5f5f5', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: 130, height: 20, backgroundColor: '#f5f5f5', borderRadius: 4 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 20, height: 20, backgroundColor: '#f5f5f5', borderRadius: 4 }} />
            <div style={{ width: 64, height: 20, backgroundColor: '#f5f5f5', borderRadius: 4 }} />
          </div>
        </div>
        <div style={{ width: '100%', height: 30, backgroundColor: '#f5f5f5', borderRadius: 4 }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 20, height: 20, backgroundColor: '#f5f5f5', borderRadius: 4 }} />
          <div style={{ width: 116, height: 20, backgroundColor: '#f5f5f5', borderRadius: 4 }} />
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
          <div style={{ flex: 1, height: 78, backgroundColor: 'white', border: '1px solid #f5f5f5', borderRadius: 8 }} />
          <div style={{ flex: 1, height: 78, backgroundColor: '#f5f5f5', borderRadius: 8 }} />
        </div>
      </div>
      {/* Skeleton footer */}
      <div style={{ padding: 24, backgroundColor: '#fff', borderRadius: '0 0 16px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 32, height: 32, backgroundColor: '#f5f5f5', borderRadius: '50%' }} />
        <div style={{ width: 116, height: 20, backgroundColor: '#f5f5f5', borderRadius: 4 }} />
      </div>
    </div>
  )
}

// ─── CourseCard ────────────────────────────────────────────────────────────────
interface CourseCardProps {
  course: Course
  status?: CourseStatus
  daysLeft?: number
  dateRange?: string       // e.g. "10 - 15 Jul 2025"
  hours?: string           // e.g. "50 ชั่วโมง"
  instructorName?: string
  instructorAvatars?: string[]
  fallbackThumb?: string
}

// Fallbacks cycle through the 4 available course thumbnails
const COURSE_FALLBACKS = [
  '/assets/course-thumb-1.png',
  '/assets/course-thumb-2.png',
  '/assets/course-thumb-3.png',
  '/assets/course-thumb-4.png',
]

export default function CourseCard({
  course,
  status = 'upcoming',
  daysLeft,
  dateRange,
  hours,
  instructorName,
  instructorAvatars = [],
  fallbackThumb = '/assets/course-thumb-1.png',
}: CourseCardProps) {
  const isOnsite = course.format === 'onsite'
  const isDual = course.price_type === 'dual'

  // If thumbnail is a local /assets/ or /uploads/ frontend path → use directly.
  // If it looks like a backend upload path → build full URL via getImageUrl.
  const rawThumb = course.thumbnail_url
  const imgSrc: string = (() => {
    if (!rawThumb) return fallbackThumb
    if (rawThumb.startsWith('http://') || rawThumb.startsWith('https://')) return rawThumb
    if (rawThumb.startsWith('/assets/') || rawThumb.startsWith('/images/')) return rawThumb
    // backend-relative path (e.g. /uploads/...)
    return getImageUrl(rawThumb) ?? fallbackThumb
  })()

  return (
    <Link href={`/courses/${course.course_id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="hover:opacity-95 transition-opacity"
        style={{ borderRadius: 16, boxShadow: '0px 0px 24px 0px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}
      >
        {/* ── Status header ── */}
        <div style={{
          height: 56,
          backgroundColor: HEADER_BG[status],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          flexShrink: 0,
          borderRadius: '16px 16px 0 0',
        }}>
          {status === 'urgent' && (
            <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#fff', display: 'flex', gap: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span>คอร์สนี้จะปิดรับสมัครในอีก</span>
              <span style={{ fontWeight: 600 }}>{daysLeft ?? 3} วัน</span>
            </span>
          )}
          {status === 'upcoming' && (
            <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              คอร์สที่กำลังมาถึง
            </span>
          )}
          {status === 'ended' && (
            <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              คอร์สที่ปิดรับสมัครแล้ว
            </span>
          )}
        </div>

        {/* ── Thumbnail ── */}
        <div style={{ height: 186, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <Image src={imgSrc} alt={course.title} fill style={{ objectFit: 'cover' }} />
        </div>

        {/* ── Content ── */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24, borderBottom: '1px solid #dfdfdf', backgroundColor: '#fff', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Course type + hours */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: isOnsite ? '#1f4488' : '#126f38' }}>
                {isOnsite ? 'ONSITE COURSE' : 'ONLINE COURSE'}
              </span>
              {hours && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <ClockIcon />
                  <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#7b7b7b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {hours}
                  </span>
                </div>
              )}
            </div>

            {/* Title — 2-line clamp */}
            <p className="line-clamp-2" style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#0a0a0a', overflow: 'hidden', margin: 0 }}>
              {course.title}
            </p>

            {/* Date range */}
            {dateRange && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: 20 }}>
                <CalendarIcon />
                <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {dateRange}
                </span>
              </div>
            )}
          </div>

          {/* ── Price ── */}
          {isDual ? (
            <div style={{ display: 'flex', gap: 24, alignItems: 'stretch', whiteSpace: 'nowrap' }}>
              {/* สมาชิกทั่วไป */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#fff', border: '1px solid #dfdfdf', borderRadius: 8 }}>
                <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#7b7b7b', overflow: 'hidden', textOverflow: 'ellipsis' }}>สมาชิกทั่วไป</span>
                <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 24, lineHeight: '32px', color: '#0a0a0a' }}>
                  {course.price_general.toLocaleString('th-TH')}.-
                </span>
              </div>
              {/* สมาชิกสมาคม */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center', padding: 12, background: 'linear-gradient(204.394deg, rgb(31,68,136) 0%, rgb(111,138,186) 100%)', borderRadius: 8 }}>
                <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis' }}>สมาชิกสมาคม</span>
                <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 24, lineHeight: '32px', color: '#fff' }}>
                  {(course.price_association ?? course.price_general).toLocaleString('th-TH')}.-
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center', padding: 12, background: 'linear-gradient(191.967deg, rgb(31,68,136) 0%, rgb(111,138,186) 100%)', borderRadius: 8, whiteSpace: 'nowrap' }}>
              <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis' }}>สมาชิกทั่วไป, สมาชิกสมาคม</span>
              <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 24, lineHeight: '32px', color: '#fff' }}>
                {course.price_general.toLocaleString('th-TH')}.-
              </span>
            </div>
          )}
        </div>

        {/* ── Footer: instructors ── */}
        <div style={{ padding: 24, backgroundColor: '#fff', borderRadius: '0 0 16px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Overlapping avatars */}
            {instructorAvatars.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {instructorAvatars.slice(0, 4).map((av, i) => {
                  // Resolve raw upload paths to full URL
                  const avatarSrc = av.startsWith('http') || av.startsWith('/assets') ? av : (getImageUrl(av) ?? av)
                  return (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #fff', marginRight: i < instructorAvatars.length - 1 ? -4 : 0, zIndex: 5 - i, overflow: 'hidden', flexShrink: 0, position: 'relative', backgroundColor: '#e5e7eb' }}>
                      <Image src={avatarSrc} alt="" fill style={{ objectFit: 'cover' }} unoptimized />
                    </div>
                  )
                })}
              </div>
            )}
            {instructorAvatars.length === 0 && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f5f5f5', flexShrink: 0 }} />
            )}
            {instructorName && (
              <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {instructorName}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Inline icon helpers ───────────────────────────────────────────────────────
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="9" stroke="#7b7b7b" strokeWidth="1.5"/>
      <path d="M12 7v5l3 3" stroke="#7b7b7b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5"/>
      <path d="M3 9h18M8 2v4M16 2v4" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
