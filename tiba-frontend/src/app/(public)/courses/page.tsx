'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import CourseCard, { EmptyCourseCard, type CourseStatus } from '@/components/public/CourseCard'
import { publicService } from '@/lib/api/services/public.service'
import type { Course } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const THAI_MONTHS = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม',
]
const THAI_MONTHS_SHORT = [
  'ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
  'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.',
]
const DAY_LABELS = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.']

const FILTER_TABS = [
  { value: 'all',      label: 'คอร์สทั้งหมด' },
  { value: 'urgent',   label: 'คอร์สที่กำลังปิดรับสมัคร' },
  { value: 'upcoming', label: 'คอร์สที่กำลังมาถึง' },
  { value: 'ended',    label: 'คอร์สที่ปิดรับสมัครแล้ว' },
]

const PAGE_SIZE = 9
const GRID_SIZE  = 9

// Mock calendar events — replace with API data in production
const MOCK_CALENDAR_EVENTS = [
  { id: '1', dateStart: 19, dateEnd: 20, title: 'อบรมสะสมชั่วโมงออนไลน์ ขอใบอนุญาตเป็นตัวแทนประกันชีวิต', format: 'Online course', paid: 'Paid',  hours: '10 hours', color: '#ee7429' },
  { id: '2', dateStart: 21, dateEnd: 21, title: 'การอบรมเพิ่มส่งเสริมทักษะ',                                  format: 'Online course', paid: 'Paid',  hours: '3 hours',  color: '#1f4488' },
  { id: '3', dateStart: 29, dateEnd: 30, title: 'อบรมอย่างใกล้ชิดกับสมาคม',                                   format: 'On-site',       paid: 'Free', hours: '',         color: '#7b7b7b' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCourseStatus(course: Course, idx: number): CourseStatus {
  const statuses: CourseStatus[] = ['urgent', 'upcoming', 'upcoming', 'ended']
  return statuses[idx % statuses.length]
}

// ─── CalendarSection ─────────────────────────────────────────────────────────

function CalendarSection() {
  const today   = new Date()
  const [calYear,  setCalYear]  = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth()) // 0-based

  const thaiYear  = calYear + 543
  const monthLabel = `${THAI_MONTHS[calMonth]} ${thaiYear}`

  // Build grid
  const firstDay      = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth   = new Date(calYear, calMonth + 1, 0).getDate()
  const daysInPrevMo  = new Date(calYear, calMonth, 0).getDate()

  type Cell = { day: number; current: boolean; isToday: boolean; eventColor: string | null }
  const cells: Cell[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMo - i, current: false, isToday: false, eventColor: null })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && d === today.getDate()
    const ev = MOCK_CALENDAR_EVENTS.find(e => d >= e.dateStart && d <= e.dateEnd)
    cells.push({ day: d, current: true, isToday, eventColor: ev ? ev.color : null })
  }
  const trailing = 42 - cells.length
  for (let d = 1; d <= trailing; d++) {
    cells.push({ day: d, current: false, isToday: false, eventColor: null })
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  function dayTextColor(col: number, current: boolean): string {
    if (!current) return '#b3b3b3'
    if (col === 0) return '#ee7429'
    if (col === 6) return '#1f4488'
    return '#0a0a0a'
  }

  return (
    <section style={{ paddingLeft: 80, paddingRight: 80, paddingTop: 48, paddingBottom: 40 }}>
      {/* Section heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <img src="/icon-book.svg" alt="" style={{ width: 32, height: 32 }} />
        <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 32, lineHeight: '40px', color: '#0a0a0a' }}>
          ปฏิทินคอร์สอบรม
        </span>
      </div>

      {/* Card */}
      <div style={{ borderRadius: 16, boxShadow: '0px 0px 24px 0px rgba(0,0,0,0.1)', overflow: 'hidden', backgroundColor: '#fff', display: 'flex' }}>

        {/* Left — month calendar */}
        <div style={{ flexShrink: 0, width: 480, padding: 32, borderRight: '1px solid #f5f5f5' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button onClick={prevMonth} style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20, color: '#7b7b7b', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
              ‹
            </button>
            <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#0a0a0a' }}>
              {monthLabel}
            </span>
            <button onClick={nextMonth} style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20, color: '#7b7b7b', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
              ›
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {DAY_LABELS.map((d, i) => (
              <div key={d} style={{ textAlign: 'center', fontFamily: 'var(--font-thai)', fontSize: 13, fontWeight: 600, color: i === 0 ? '#ee7429' : i === 6 ? '#1f4488' : '#7b7b7b', paddingBottom: 8 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((cell, idx) => {
              const col = idx % 7
              const hasEvent = !!cell.eventColor
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-thai)',
                    fontSize: 13,
                    fontWeight: cell.isToday || hasEvent ? 600 : 400,
                    backgroundColor: cell.isToday
                      ? '#126f38'
                      : hasEvent
                      ? `${cell.eventColor}25`
                      : 'transparent',
                    color: cell.isToday
                      ? '#fff'
                      : hasEvent
                      ? cell.eventColor!
                      : dayTextColor(col, cell.current),
                  }}>
                    {cell.day}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right — event list */}
        <div style={{ flex: 1, overflowY: 'auto', maxHeight: 360 }}>
          {MOCK_CALENDAR_EVENTS.map((ev) => (
            <div key={ev.id} style={{ display: 'flex', gap: 16, padding: '20px 24px', borderBottom: '1px solid #f5f5f5', alignItems: 'flex-start' }}>
              {/* Date badge */}
              <div style={{
                flexShrink: 0,
                width: 72,
                minHeight: 72,
                borderRadius: 8,
                backgroundColor: `${ev.color}20`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}>
                <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: ev.color, fontWeight: 500 }}>
                  {THAI_MONTHS_SHORT[calMonth]}
                </span>
                <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 20, color: ev.color, lineHeight: 1.1 }}>
                  {ev.dateStart === ev.dateEnd ? ev.dateStart : `${ev.dateStart}-${ev.dateEnd}`}
                </span>
              </div>
              {/* Event info */}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 15, color: '#0a0a0a', margin: '0 0 6px', lineHeight: '22px' }}>
                  {ev.title}
                </p>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b' }}>{ev.format}</span>
                  {ev.paid && (
                    <>
                      <span style={{ color: '#dfdfdf' }}>|</span>
                      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b' }}>{ev.paid}</span>
                    </>
                  )}
                  {ev.hours && (
                    <>
                      <span style={{ color: '#dfdfdf' }}>|</span>
                      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b' }}>{ev.hours}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {MOCK_CALENDAR_EVENTS.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, fontFamily: 'var(--font-thai)', color: '#b3b3b3', fontSize: 16 }}>
              ไม่มีคอร์สในเดือนนี้
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function CoursePagination({ page, totalPages, onPageChange }: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const btnBase: React.CSSProperties = {
    width: 40, height: 40, borderRadius: '50%', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 16,
    cursor: 'pointer', flexShrink: 0,
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 48, paddingBottom: 64 }}>
      {/* Prev */}
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        style={{ ...btnBase, background: 'transparent', color: page === 1 ? '#b3b3b3' : '#0a0a0a', fontSize: 20, cursor: page === 1 ? 'default' : 'pointer' }}
      >
        ‹
      </button>

      {pages.map((p, i) => (
        <button
          key={i}
          onClick={() => typeof p === 'number' && onPageChange(p)}
          style={{
            ...btnBase,
            background: p === page
              ? 'linear-gradient(225deg, #126f38 0%, #1f4488 100%)'
              : 'transparent',
            color: p === page ? '#fff' : '#0a0a0a',
            cursor: typeof p === 'number' ? 'pointer' : 'default',
          }}
        >
          {p}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        style={{ ...btnBase, background: 'transparent', color: page === totalPages ? '#b3b3b3' : '#0a0a0a', fontSize: 20, cursor: page === totalPages ? 'default' : 'pointer' }}
      >
        ›
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const now = new Date()

  const [page,          setPage]         = useState(1)
  const [activeTab,     setActiveTab]    = useState('all')
  const [search,        setSearch]       = useState('')
  const [monthDropOpen, setMonthDropOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(`${THAI_MONTHS[now.getMonth()]} ${now.getFullYear() + 543}`)

  const { data, isLoading } = useQuery({
    queryKey: ['public-courses', page],
    queryFn: () => publicService.getCourses({ page, page_size: PAGE_SIZE }),
  })

  const courses    = data?.data ?? []
  const totalPages = data?.pagination?.total_pages ?? 1

  // Always fill to 9 slots
  const slots = useMemo<(Course | null)[]>(() => {
    const arr: (Course | null)[] = [...courses]
    while (arr.length < GRID_SIZE) arr.push(null)
    return arr.slice(0, GRID_SIZE)
  }, [courses])

  return (
    <div>
      {/* ══ Banner ══ */}
      <section style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
        {/* Background photo */}
        <img
          src="/assets/course-thumb-1.png"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(31,68,136,0.1) 0%, rgba(31,68,136,0.9) 100%)',
        }} />
        {/* Centered title */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 48, lineHeight: 1, color: '#fff', margin: 0 }}>
            คอร์สอบรม
          </h1>
        </div>
      </section>

      {/* ══ Breadcrumb ══ */}
      <div style={{ backgroundColor: '#132953', paddingLeft: 80, paddingRight: 80, paddingTop: 16, paddingBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link
            href="/home"
            style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#fff', textDecoration: 'none' }}
          >
            หน้าหลัก
          </Link>
          <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, lineHeight: '20px', color: '#fff' }}>
            คอร์สอบรม
          </span>
        </div>
      </div>

      {/* ══ Calendar ══ */}
      <CalendarSection />

      {/* ══ Search + Month filter ══ */}
      <div style={{ paddingLeft: 80, paddingRight: 80, paddingBottom: 0 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
          {/* Search */}
          <div style={{ flex: 1, position: 'relative' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7" stroke="#b3b3b3" strokeWidth="1.5"/>
              <path d="M16.5 16.5L21 21" stroke="#b3b3b3" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="พิมข้อความค้นหา"
              style={{
                width: '100%',
                height: 48,
                paddingLeft: 52,
                paddingRight: 16,
                fontSize: 16,
                fontFamily: 'var(--font-thai)',
                border: 'none',
                borderRadius: 8,
                outline: 'none',
                color: '#0a0a0a',
                background: '#f5f5f5',
              }}
            />
          </div>

          {/* Month dropdown */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setMonthDropOpen(o => !o)}
              style={{
                height: 48,
                paddingLeft: 32,
                paddingRight: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#f5f5f5',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'var(--font-thai)',
                fontWeight: 600,
                fontSize: 16,
                color: '#0a0a0a',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedMonth}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                style={{ transform: monthDropOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s', flexShrink: 0 }}>
                <path d="M6 9l6 6 6-6" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {monthDropOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                minWidth: 220, background: '#fff', borderRadius: 8,
                boxShadow: '0px 4px 16px rgba(0,0,0,0.12)', zIndex: 20, overflow: 'hidden',
              }}>
                {THAI_MONTHS.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setSelectedMonth(`${m} ${now.getFullYear() + 543}`); setMonthDropOpen(false) }}
                    style={{
                      display: 'block', width: '100%', height: 44,
                      padding: '0 16px', background: 'transparent', border: 'none',
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'var(--font-thai)', fontSize: 16, color: '#0a0a0a',
                    }}
                    className="hover:bg-[#f5f5f5]"
                  >
                    {m} {now.getFullYear() + 543}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid #dfdfdf', marginTop: 24, gap: 0 }}>
          {FILTER_TABS.map((tab) => {
            const active = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => { setActiveTab(tab.value); setPage(1) }}
                style={{
                  height: 48,
                  paddingLeft: 32,
                  paddingRight: 32,
                  border: 'none',
                  borderBottom: active ? '2px solid #0d4e27' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-thai)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 16,
                  lineHeight: '20px',
                  color: active ? '#126f38' : '#7b7b7b',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  marginBottom: -1, // overlap border
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ══ Course grid ══ */}
      <div style={{ paddingLeft: 80, paddingRight: 80, paddingTop: 32 }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {Array.from({ length: 9 }).map((_, i) => <EmptyCourseCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {slots.map((course, i) =>
              course ? (
                <CourseCard
                  key={course.course_id}
                  course={course}
                  status={getCourseStatus(course, i)}
                  daysLeft={3}
                  dateRange="10 - 15 Jul 2025"
                  hours="50 ชั่วโมง"
                />
              ) : (
                <EmptyCourseCard key={`empty-${i}`} />
              )
            )}
          </div>
        )}
      </div>

      {/* ══ Pagination ══ */}
      <div style={{ paddingLeft: 80, paddingRight: 80 }}>
        <CoursePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
