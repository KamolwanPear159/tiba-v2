'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
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
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Mock calendar events — replace with API data in production
const MOCK_CALENDAR_EVENTS = [
  { id: '1', dateStart: 19, dateEnd: 20, title: 'อบรมสะสมชั่วโมงออนไลน์ ขอใบอนุญาตเป็นตัวแทนประกันชีวิต', format: 'Online course', paid: 'Paid',  hours: '10 hours', color: '#ee7429' },
  { id: '2', dateStart: 21, dateEnd: 21, title: 'การอบรมเพิ่มส่งเสริมทักษะ',                                  format: 'Online course', paid: 'Paid',  hours: '3 hours',  color: '#1f4488' },
  { id: '3', dateStart: 29, dateEnd: 30, title: 'อบรมอย่างใกล้ชิดกับสมาคม',                                   format: 'On-site',       paid: 'Free', hours: '',         color: '#7b7b7b' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCourseStatus(course: Course): CourseStatus {
  if (!course.next_enrollment_end) return 'ended'
  const now = Date.now()
  const end = new Date(course.next_enrollment_end).getTime()
  if (end < now) return 'ended'
  const daysLeft = Math.ceil((end - now) / 86_400_000)
  return daysLeft <= 7 ? 'urgent' : 'upcoming'
}

function getDaysLeft(course: Course): number | undefined {
  if (!course.next_enrollment_end) return undefined
  const days = Math.ceil((new Date(course.next_enrollment_end).getTime() - Date.now()) / 86_400_000)
  return days > 0 ? days : undefined
}

function getDateRange(course: Course): string | undefined {
  if (!course.next_training_start) return undefined
  const s = new Date(course.next_training_start)
  const e = course.next_training_end ? new Date(course.next_training_end) : s
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} - ${e.getDate()} ${MONTHS_EN[s.getMonth()]} ${s.getFullYear()}`
  }
  return `${s.getDate()} ${MONTHS_EN[s.getMonth()]} - ${e.getDate()} ${MONTHS_EN[e.getMonth()]} ${e.getFullYear()}`
}

function getHours(course: Course): string | undefined {
  return course.total_hours ? `${course.total_hours} ชั่วโมง` : undefined
}

// ─── CalendarSection ─────────────────────────────────────────────────────────

function CalendarSection() {
  const today   = new Date()
  const [calYear,  setCalYear]  = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth()) // 0-based

  const thaiYear   = calYear + 543
  const monthLabel = `${THAI_MONTHS[calMonth]} ${thaiYear}`

  const firstDay     = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth  = new Date(calYear, calMonth + 1, 0).getDate()
  const daysInPrevMo = new Date(calYear, calMonth, 0).getDate()

  type Cell = { day: number; current: boolean; isToday: boolean; eventColor: string | null }
  const cells: Cell[] = []

  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrevMo - i, current: false, isToday: false, eventColor: null })

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && d === today.getDate()
    const ev = MOCK_CALENDAR_EVENTS.find(e => d >= e.dateStart && d <= e.dateEnd)
    cells.push({ day: d, current: true, isToday, eventColor: ev ? ev.color : null })
  }
  const trailing = 42 - cells.length
  for (let d = 1; d <= trailing; d++)
    cells.push({ day: d, current: false, isToday: false, eventColor: null })

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

  const navBtnStyle: React.CSSProperties = {
    width: 40, height: 40,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    border: 'none',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, color: '#7b7b7b',
    flexShrink: 0,
  }

  return (
    <section style={{ paddingLeft: 80, paddingRight: 80, paddingTop: 48, paddingBottom: 40 }}>

      {/* ── Section heading ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="26" height="23" rx="3" stroke="#0a0a0a" strokeWidth="2" fill="none"/>
          <path d="M3 12h26" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
          <path d="M10 3v6M22 3v6" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
          <rect x="8" y="17" width="4" height="4" rx="1" fill="#0a0a0a"/>
          <rect x="14" y="17" width="4" height="4" rx="1" fill="#0a0a0a"/>
          <rect x="20" y="17" width="4" height="4" rx="1" fill="#0a0a0a"/>
          <rect x="8" y="23" width="4" height="3" rx="1" fill="#0a0a0a"/>
          <rect x="14" y="23" width="4" height="3" rx="1" fill="#0a0a0a"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 32, lineHeight: '40px', color: '#0a0a0a' }}>
          ปฏิทินคอร์สอบรม
        </span>
      </div>

      {/* ── Card ── */}
      <div style={{
        borderRadius: 16,
        boxShadow: '0px 0px 24px 0px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'stretch',
      }}>

        {/* ══ LEFT ══ */}
        <div style={{ flex: '0 0 55%', padding: 32, borderRight: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <button onClick={prevMonth} style={navBtnStyle}>‹</button>
            <div style={{
              flex: 1, height: 40, borderRadius: 8,
              backgroundColor: '#f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#0a0a0a',
            }}>
              {monthLabel}
            </div>
            <button onClick={nextMonth} style={navBtnStyle}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {DAY_LABELS.map((d, i) => (
              <div key={d} style={{
                textAlign: 'center',
                fontFamily: 'var(--font-thai)', fontSize: 14, fontWeight: 600,
                color: i === 0 ? '#ee7429' : i === 6 ? '#1f4488' : '#7b7b7b',
                paddingBottom: 8,
              }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2 }}>
            {cells.map((cell, idx) => {
              const col      = idx % 7
              const hasEvent = !!cell.eventColor
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40 }}>
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: cell.isToday ? '50%' : hasEvent ? 8 : '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-thai)', fontSize: 14,
                    fontWeight: cell.isToday || hasEvent ? 600 : 400,
                    backgroundColor: cell.isToday
                      ? '#126f38'
                      : hasEvent
                      ? `${cell.eventColor}22`
                      : 'transparent',
                    color: cell.isToday
                      ? '#fff'
                      : hasEvent
                      ? cell.eventColor!
                      : dayTextColor(col, cell.current),
                    transition: 'background 0.1s',
                  }}>
                    {cell.day}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div style={{
          flex: '0 0 45%',
          overflowY: 'auto',
          maxHeight: 420,
          scrollbarWidth: 'thin',
          scrollbarColor: '#dfdfdf transparent',
        }}>
          {MOCK_CALENDAR_EVENTS.length === 0 ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', minHeight: 200,
              fontFamily: 'var(--font-thai)', color: '#b3b3b3', fontSize: 16,
            }}>
              ไม่มีคอร์สในเดือนนี้
            </div>
          ) : (
            MOCK_CALENDAR_EVENTS.map((ev, evIdx) => (
              <div
                key={ev.id}
                style={{
                  display: 'flex', gap: 20,
                  padding: '24px 28px',
                  borderBottom: evIdx < MOCK_CALENDAR_EVENTS.length - 1 ? '1px solid #f0f0f0' : 'none',
                  alignItems: 'center',
                }}
              >
                {/* Date badge */}
                <div style={{
                  flexShrink: 0,
                  width: 80, minHeight: 80,
                  borderRadius: 12,
                  backgroundColor: `${ev.color}18`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '8px 4px', gap: 2,
                }}>
                  <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, fontWeight: 500, color: ev.color, lineHeight: 1 }}>
                    {THAI_MONTHS_SHORT[calMonth]}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-eng)', fontWeight: 700,
                    fontSize: ev.dateStart === ev.dateEnd ? 28 : 22,
                    color: ev.color, lineHeight: 1.15, letterSpacing: '-0.5px',
                  }}>
                    {ev.dateStart === ev.dateEnd ? ev.dateStart : `${ev.dateStart}-${ev.dateEnd}`}
                  </span>
                </div>

                {/* Event info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 18, color: '#0a0a0a', margin: '0 0 8px', lineHeight: '26px' }}>
                    {ev.title}
                  </p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b' }}>{ev.format}</span>
                    {ev.paid && (<><span style={{ color: '#dfdfdf', fontSize: 14 }}>|</span><span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b' }}>{ev.paid}</span></>)}
                    {ev.hours && (<><span style={{ color: '#dfdfdf', fontSize: 14 }}>|</span><span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b' }}>{ev.hours}</span></>)}
                  </div>
                </div>
              </div>
            ))
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
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        style={{ ...btnBase, background: 'transparent', color: page === 1 ? '#b3b3b3' : '#0a0a0a', fontSize: 20, cursor: page === 1 ? 'default' : 'pointer' }}
      >‹</button>

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
        >{p}</button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        style={{ ...btnBase, background: 'transparent', color: page === totalPages ? '#b3b3b3' : '#0a0a0a', fontSize: 20, cursor: page === totalPages ? 'default' : 'pointer' }}
      >›</button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const now = new Date()

  const [page,          setPage]          = useState(1)
  const [activeTab,     setActiveTab]     = useState('all')
  const [searchInput,   setSearchInput]   = useState('')
  const [search,        setSearch]        = useState('')          // debounced
  const [monthDropOpen, setMonthDropOpen] = useState(false)
  const [filterMonth,   setFilterMonth]   = useState(now.getMonth() + 1)   // 1-12 Gregorian
  const [filterYear,    setFilterYear]    = useState(now.getFullYear())     // Gregorian

  // Debounce search (300 ms)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [searchInput])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [activeTab, filterMonth, filterYear])

  const { data, isLoading } = useQuery({
    queryKey: ['public-courses', page, activeTab, search, filterMonth, filterYear],
    queryFn: () => publicService.getCourses({
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      status: activeTab !== 'all' ? activeTab : undefined,
      month: filterMonth,
      year: filterYear,
    }),
  })

  const courses    = data?.data ?? []
  const totalPages = data?.pagination?.total_pages ?? 1

  // Always fill to 9 slots
  const slots = useMemo<(Course | null)[]>(() => {
    const arr: (Course | null)[] = [...courses]
    while (arr.length < PAGE_SIZE) arr.push(null)
    return arr.slice(0, PAGE_SIZE)
  }, [courses])

  const displayMonth = `${THAI_MONTHS[filterMonth - 1]} ${filterYear + 543}`

  // Build list of selectable months for the dropdown (current year ± 1)
  const monthOptions = useMemo(() => {
    const opts: { month: number; year: number; label: string }[] = []
    for (let y = now.getFullYear() - 1; y <= now.getFullYear() + 1; y++) {
      for (let m = 1; m <= 12; m++) {
        opts.push({ month: m, year: y, label: `${THAI_MONTHS[m - 1]} ${y + 543}` })
      }
    }
    return opts
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* ══ Banner ══ */}
      <section style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
        <img
          src="/assets/course-thumb-1.png"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(31,68,136,0.1) 0%, rgba(31,68,136,0.9) 100%)',
        }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 48, lineHeight: 1, color: '#fff', margin: 0 }}>
            คอร์สอบรม
          </h1>
        </div>
      </section>

      {/* ══ Breadcrumb ══ */}
      <div style={{ backgroundColor: '#132953', paddingLeft: 80, paddingRight: 80, paddingTop: 16, paddingBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/home" style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#fff', textDecoration: 'none' }}>
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

      {/* ══ Search + Month filter (node 1:118842 + 1:118847) ══ */}
      <div style={{ paddingLeft: 80, paddingRight: 80, paddingBottom: 0 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>

          {/* Search — node 1:118842 */}
          <div style={{ flex: 1, position: 'relative' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', flexShrink: 0, pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="7" stroke="#b3b3b3" strokeWidth="1.5"/>
              <path d="M16.5 16.5L21 21" stroke="#b3b3b3" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
                boxSizing: 'border-box',
              }}
            />
            {/* Clear button */}
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#b3b3b3', fontSize: 18, lineHeight: 1, padding: 4,
                }}
              >✕</button>
            )}
          </div>

          {/* Month dropdown — node 1:118847 */}
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
              {displayMonth}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                style={{ transform: monthDropOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s', flexShrink: 0 }}>
                <path d="M6 9l6 6 6-6" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {monthDropOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                width: 220, maxHeight: 320, overflowY: 'auto',
                background: '#fff', borderRadius: 8,
                boxShadow: '0px 4px 16px rgba(0,0,0,0.12)', zIndex: 20, overflow: 'hidden auto',
              }}>
                {monthOptions.map((opt) => {
                  const isActive = opt.month === filterMonth && opt.year === filterYear
                  return (
                    <button
                      key={`${opt.year}-${opt.month}`}
                      onClick={() => { setFilterMonth(opt.month); setFilterYear(opt.year); setMonthDropOpen(false) }}
                      style={{
                        display: 'block', width: '100%', height: 44,
                        padding: '0 16px', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'var(--font-thai)', fontSize: 16,
                        color: isActive ? '#126f38' : '#0a0a0a',
                        fontWeight: isActive ? 600 : 400,
                        background: isActive ? '#f0faf4' : 'transparent',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Filter tabs (node 1:118851) ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid #dfdfdf', marginTop: 24 }}>
          {FILTER_TABS.map((tab) => {
            const active = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => { setActiveTab(tab.value); setPage(1) }}
                style={{
                  flex: 1,
                  height: 48,
                  paddingLeft: 8,
                  paddingRight: 8,
                  border: 'none',
                  borderBottom: active ? '2px solid #0d4e27' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-thai)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 16,
                  lineHeight: '20px',
                  color: active ? '#126f38' : '#7b7b7b',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  marginBottom: -1,
                  transition: 'color 0.15s, border-color 0.15s',
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
        ) : courses.length === 0 ? (
          <div style={{
            minHeight: 320,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 16, color: '#b3b3b3',
          }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect x="8" y="12" width="48" height="44" rx="6" stroke="#dfdfdf" strokeWidth="2.5"/>
              <path d="M8 24h48" stroke="#dfdfdf" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M22 6v10M42 6v10" stroke="#dfdfdf" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M22 36h20M22 44h12" stroke="#dfdfdf" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-thai)', fontSize: 20, fontWeight: 500 }}>
              ไม่พบคอร์สอบรม
            </span>
            <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16 }}>
              ลองเปลี่ยนเดือนหรือคำค้นหาใหม่อีกครั้ง
            </span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {slots.map((course, i) =>
              course ? (
                <CourseCard
                  key={course.course_id}
                  course={course}
                  status={getCourseStatus(course)}
                  daysLeft={getDaysLeft(course)}
                  dateRange={getDateRange(course)}
                  hours={getHours(course)}
                  fallbackThumb={`/assets/course-thumb-${(i % 4) + 1}.png`}
                  instructorName={course.tutors?.[0]?.name}
                  instructorAvatars={course.tutors?.filter(t => t.photo_url).map(t => t.photo_url!) ?? []}
                />
              ) : (
                <EmptyCourseCard key={`empty-${i}`} />
              )
            )}
          </div>
        )}
      </div>

      {/* ══ Pagination (node 1:118876) ══ */}
      <div style={{ paddingLeft: 80, paddingRight: 80 }}>
        <CoursePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
