'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { courseService } from '@/lib/api/services/course.service'
import { mockSessions } from '@/lib/api/mock/courses'
import type { CalendarEvent } from '@/types'

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const THAI_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

function getMockEvents(type: 'enrollment' | 'training', year: number, month: number): CalendarEvent[] {
  return mockSessions
    .filter(s => {
      const dateStr = type === 'enrollment' ? s.enrollment_start : s.training_start
      const d = new Date(dateStr)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
    .map(s => ({
      event_id: s.session_id,
      title: s.session_label,
      date: type === 'enrollment' ? s.enrollment_start.slice(0, 10) : s.training_start,
      type,
      course_title: 'หลักสูตร',
      session_label: s.session_label,
    }))
}

export default function AdminCalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [tab, setTab] = useState<'enrollment' | 'training'>('enrollment')

  const { data: events = [] } = useQuery<CalendarEvent[]>({
    queryKey: ['calendar', tab, year, month],
    queryFn: () => {
      if (useMock) return getMockEvents(tab, year, month)
      return tab === 'enrollment'
        ? courseService.getCalendarEnrollments(month, year)
        : courseService.getCalendarTraining(month, year)
    },
  })

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)
  while (cells.length % 7 !== 0) cells.push(null)

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date.startsWith(dateStr))
  }

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear()

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { value: 'enrollment' as const, label: 'จัดการจอง' },
          { value: 'training' as const, label: 'จัดอบรม' },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.value ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold text-text-main">
            {THAI_MONTHS[month - 1]} {year + 543}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {THAI_DAYS.map((d, i) => (
            <div key={d} className={`py-2 text-center text-xs font-semibold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dayEvents = day ? getEventsForDay(day) : []
            const isWeekend = idx % 7 === 0 || idx % 7 === 6
            return (
              <div
                key={idx}
                className={`
                  min-h-[80px] p-1.5 border-b border-r border-gray-50
                  ${idx % 7 === 6 ? 'border-r-0' : ''}
                  ${!day ? 'bg-gray-50/50' : isWeekend ? 'bg-gray-50/30' : ''}
                `}
              >
                {day && (
                  <>
                    <div className={`
                      w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1 font-medium
                      ${isToday(day) ? 'bg-primary text-white' : isWeekend ? 'text-gray-400' : 'text-gray-700'}
                    `}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.event_id}
                          title={`${e.course_title} - ${e.session_label}`}
                          className={`
                            text-[10px] px-1.5 py-0.5 rounded truncate font-medium
                            ${tab === 'enrollment' ? 'bg-accent/15 text-accent-dark' : 'bg-primary/15 text-primary'}
                          `}
                        >
                          {e.session_label}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-gray-400 px-1">+{dayEvents.length - 2} รายการ</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded ${tab === 'enrollment' ? 'bg-accent/30' : 'bg-primary/30'}`} />
          {tab === 'enrollment' ? 'รอบรับสมัคร' : 'วันอบรม'}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary" />
          วันนี้
        </div>
      </div>
    </div>
  )
}
