'use client'

import React, { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Search, ChevronDown, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { adminService } from '@/lib/api/services/admin.service'
import { formatDate } from '@/lib/utils/format'

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  primary: '#1f4488',
  memberGeneral: '#1f6b36',
  memberAssociation: '#c8a04a',
  courseNotStarted: '#5B4FCF',
  courseUpcoming: '#E9A20A',
  courseInProgress: '#2196F3',
  courseCompleted: '#1f6b36',
  genderMale: '#2196F3',
  genderFemale: '#F06292',
  resultPass: '#1f6b36',
  resultFail: '#E53935',
  stroke: '#e5e6f0',
  wall: '#f9fafe',
  text: '#515151',
}

// ─── Custom donut label (% inside slice) ──────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  const pct = Math.round(percent * 100)
  if (pct < 5) return null
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-thai)' }}>
      {pct}%
    </text>
  )
}

// ─── Reusable Donut Card ──────────────────────────────────────────────────────
function DonutCard({ data, size = 220, legendGap = 20 }: {
  data: { name: string; value: number; color: string }[]
  size?: number
  legendGap?: number
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="border border-[#e5e6f0] rounded-[20px] flex flex-col items-center justify-center py-5 gap-4 flex-1 min-w-0">
      <PieChart width={size} height={size}>
        <Pie data={data} cx={size / 2 - 1} cy={size / 2 - 1}
          innerRadius={size * 0.30} outerRadius={size * 0.47}
          dataKey="value" startAngle={90} endAngle={-270}
          labelLine={false} label={PieLabel}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
      </PieChart>
      <div className="flex items-center justify-center" style={{ gap: legendGap }}>
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="rounded-full shrink-0" style={{ width: 10, height: 10, backgroundColor: d.color }} />
            <span className="text-[14px] text-[#515151] whitespace-nowrap">
              {d.name} : {d.value.toLocaleString('th-TH')} คน
            </span>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div className="text-center">
          <p className="font-semibold text-[32px] text-[#515151] leading-none">{total.toLocaleString('th-TH')}</p>
          <p className="text-[16px] text-[#515151]">คน</p>
        </div>
      )}
    </div>
  )
}

// ─── Member Stats Donut Card ──────────────────────────────────────────────────
function MemberStatsCard({ total }: { total: number }) {
  const general = Math.round(total * 0.76)
  const association = total - general
  const data = [
    { name: 'ทั่วไป', value: general, color: C.memberGeneral },
    { name: 'สมาคม', value: association, color: C.memberAssociation },
  ]
  return (
    <div className="bg-white rounded-[20px] border border-[#e5e6f0] p-5 flex flex-col gap-3">
      <div>
        <p className="font-medium text-[18px] text-[#1f4488]">จำนวนสมาชิก</p>
        <div className="flex gap-6 mt-1">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="rounded-full" style={{ width: 8, height: 8, backgroundColor: d.color }} />
              <span className="text-[14px] text-[#515151]">{d.name} : {d.value} คน</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-[#e5e6f0] rounded-[20px] flex items-center justify-center py-8 flex-1">
        <div className="relative">
          <PieChart width={260} height={260}>
            <Pie data={data} cx={129} cy={129}
              innerRadius={78} outerRadius={128}
              dataKey="value" startAngle={90} endAngle={-270}
              labelLine={false} label={PieLabel}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="font-semibold text-[40px] text-[#515151] leading-none">{total.toLocaleString('th-TH')}</p>
            <p className="text-[18px] text-[#515151]">คน</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Course Stats Bar Card ────────────────────────────────────────────────────
const COURSE_BAR_DATA = [
  { name: 'ยังไม่ถึงกำหนด', value: 48, color: C.courseNotStarted },
  { name: 'ใกล้ถึงกำหนด', value: 70, color: C.courseUpcoming },
  { name: 'ระหว่างอบรม', value: 47, color: C.courseInProgress },
  { name: 'จบการอบรม', value: 60, color: C.courseCompleted },
]

function CourseStatsCard() {
  const [selected, setSelected] = useState('คอร์สทั้งหมด')
  const [open, setOpen] = useState(false)
  const options = ['คอร์สทั้งหมด', 'คอร์สออนไลน์', 'คอร์ส Onsite']
  return (
    <div className="bg-white rounded-[20px] border border-[#e5e6f0] p-5 flex flex-col gap-3">
      <div>
        <p className="font-medium text-[18px] text-[#1f4488]">ข้อมูลคอร์ส</p>
        <div className="flex flex-wrap gap-4 mt-1">
          {COURSE_BAR_DATA.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="rounded-full" style={{ width: 8, height: 8, backgroundColor: d.color }} />
              <span className="text-[14px] text-[#515151]">{d.name}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Filter dropdown */}
      <div className="relative w-48">
        <button onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between border border-[#e5e6f0] rounded-[10px] px-4 py-[6px] text-[15px] text-[#515151] bg-white">
          <span>{selected}</span>
          <ChevronDown className="w-4 h-4 text-[#8c8c8c]" />
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-1 z-10 bg-white border border-[#e5e6f0] rounded-[10px] shadow-md w-full">
            {options.map((opt) => (
              <button key={opt} onClick={() => { setSelected(opt); setOpen(false) }}
                className="block w-full text-left px-4 py-2 text-[15px] text-[#515151] hover:bg-[#f9fafe]">
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Bar chart */}
      <div className="border border-[#e5e6f0] rounded-[16px] flex-1 p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={COURSE_BAR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 14, fill: C.text, fontFamily: 'var(--font-thai)' }}
              axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 13, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: `1px solid ${C.stroke}`, fontSize: 15 }}
              formatter={(v: number) => [`${v} คอร์ส`, 'จำนวน']} />
            <Bar dataKey="value" radius={[8, 8, 8, 8]} maxBarSize={60}>
              {COURSE_BAR_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Enrollment Section (3 donuts) ───────────────────────────────────────────
function EnrollmentSection({ totalMembers }: { totalMembers: number }) {
  const male = Math.round(totalMembers * 0.59)
  const female = totalMembers - male
  const general = Math.round(totalMembers * 0.76)
  const association = totalMembers - general
  const pass = Math.round(totalMembers * 0.96)
  const fail = totalMembers - pass

  const genderData = [
    { name: 'ชาย', value: male, color: C.genderMale },
    { name: 'หญิง', value: female, color: C.genderFemale },
  ]
  const typeData = [
    { name: 'ทั่วไป', value: general, color: C.memberGeneral },
    { name: 'สมาคม', value: association, color: C.memberAssociation },
  ]
  const resultData = [
    { name: 'ผ่าน', value: pass, color: C.resultPass },
    { name: 'ไม่ผ่าน', value: fail, color: C.resultFail },
  ]
  return (
    <div className="flex gap-5 items-start">
      {/* ผู้สมัคร – 2 donuts */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <p className="font-medium text-[18px] text-[#1f4488]">ผู้สมัคร</p>
        <div className="flex gap-5">
          <DonutCard data={genderData} size={220} legendGap={16} />
          <DonutCard data={typeData} size={220} legendGap={16} />
        </div>
      </div>
      {/* ผลการอบรม – 1 donut */}
      <div className="w-[340px] shrink-0 flex flex-col gap-3">
        <p className="font-medium text-[18px] text-[#1f4488]">ผลการอบรม</p>
        <DonutCard data={resultData} size={220} legendGap={16} />
      </div>
    </div>
  )
}

// ─── Course Overview mini-cards ───────────────────────────────────────────────
function CourseOverview({ activeCourses, totalMembers }: { activeCourses: number; totalMembers: number }) {
  const items = [
    { label: 'จำนวนคอร์สทั้งหมด', value: activeCourses },
    { label: 'จำนวนผู้สมัคร', value: totalMembers },
    { label: 'ผ่านอบรม', value: Math.round(totalMembers * 0.96) },
    { label: 'ไม่ผ่านอบรม', value: Math.round(totalMembers * 0.04) },
    { label: 'รายได้รวม', value: (totalMembers * 2300).toLocaleString('th-TH', { minimumFractionDigits: 2 }) },
  ]
  return (
    <div className="grid grid-cols-5 gap-4">
      {items.map((item) => (
        <div key={item.label}
          className="bg-[#f9fafe] border border-[#e5e6f0] rounded-[15px] p-5 h-[87px] flex items-center">
          <div className="flex flex-col gap-1">
            <p className="text-[14px] text-[#515151]">{item.label}</p>
            <p className="font-semibold text-[22px] text-[#1f4488]">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Member Table ─────────────────────────────────────────────────────────────
const MEMBER_TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  general: { label: 'ทั่วไป', bg: '#e6f4ec', text: '#1f6b36' },
  association: { label: 'สมาคม', bg: '#fef3de', text: '#c8a04a' },
}
const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  pending: { label: 'รอดำเนินการ', color: '#8c8c8c' },
  confirmed: { label: 'ยืนยันแล้ว', color: C.memberGeneral },
  cancelled: { label: 'ยกเลิก', color: C.resultFail },
  completed: { label: 'ผ่าน', color: C.memberGeneral },
}

function MemberTable() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-members', page, search],
    queryFn: () => adminService.getMembers({ page, page_size: PAGE_SIZE, search }),
  })

  const members = data?.data ?? []
  const totalPages = data?.pagination?.total_pages ?? 1
  const totalItems = data?.pagination?.total_items ?? 0

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }, [])

  return (
    <div className="bg-white rounded-[20px] border border-[#e5e6f0] overflow-hidden">
      {/* Search + Filter bar */}
      <div className="flex items-center justify-end gap-3 px-5 py-4 border-b border-[#e5e6f0]">
        <button className="flex items-center gap-2 border border-[#e5e6f0] rounded-[10px] px-[17px] py-[6px] text-[15px] text-[#515151] bg-white hover:bg-[#f9fafe]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#515151">
            <path d="M4 6h16M7 12h10M10 18h4" stroke="#515151" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
          ฟิลเตอร์
        </button>
        <div className="flex items-center gap-2 border border-[#e5e6f0] rounded-[10px] px-3 py-[6px] w-64 bg-white">
          <Search className="w-4 h-4 text-[#8c8c8c] shrink-0" />
          <input
            placeholder="ค้นหา..."
            className="flex-1 text-[15px] text-[#515151] outline-none bg-transparent placeholder:text-[#8c8c8c]"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f9fafe] border-b border-[#e5e6f0]">
              {['ชื่อ-นามสกุล', 'อีเมล', 'ประเภทสมาชิก', 'สถานะ', 'บริษัท', 'วันที่สมัคร'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[13px] font-medium text-[#8c8c8c]">{h}</th>
              ))}
              <th className="px-4 py-3 text-center text-[13px] font-medium text-[#8c8c8c]">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f0]">
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
            {!isLoading && members.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-[#8c8c8c]">ไม่พบข้อมูล</td>
              </tr>
            )}
            {!isLoading && members.map((m) => {
              const badge = MEMBER_TYPE_BADGE[m.member_type]
              return (
                <tr key={m.member_id}
                  className="hover:bg-[#f9fafe] cursor-pointer"
                  onClick={() => router.push(`/admin/members/${m.member_id}`)}>
                  <td className="px-4 py-3 font-medium text-[#1f4488]">
                    {m.first_name} {m.last_name}
                  </td>
                  <td className="px-4 py-3 text-[#515151]">{m.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-[13px] font-medium"
                      style={{ backgroundColor: badge?.bg, color: badge?.text }}>
                      {badge?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px]" style={{ color: STATUS_BADGE[m.status]?.color ?? C.text }}>
                      {STATUS_BADGE[m.status]?.label ?? m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#515151] max-w-[160px] truncate">{m.company_name ?? '-'}</td>
                  <td className="px-4 py-3 text-[#8c8c8c] text-xs whitespace-nowrap">{formatDate(m.created_at)}</td>
                  <td className="px-4 py-3 text-center">
                    <FileText className="w-4 h-4 text-[#8c8c8c] inline-block" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#e5e6f0]">
        <p className="text-[13px] text-[#515151]">
          แสดง <span className="text-[#1f4488] font-medium">{(page - 1) * PAGE_SIZE + 1}</span>
          {' '}ถึง{' '}
          <span className="text-[#1f4488] font-medium">{Math.min(page * PAGE_SIZE, totalItems)}</span>
          {' '}จาก <span className="text-[#1f4488] font-medium">{totalItems}</span> รายการ
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#e5e6f0] disabled:opacity-40 hover:bg-[#f9fafe]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = i + 1
            return (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[13px] border"
                style={{
                  borderColor: p === page ? C.primary : C.stroke,
                  backgroundColor: p === page ? C.primary : 'white',
                  color: p === page ? 'white' : C.text,
                }}>
                {p}
              </button>
            )
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#e5e6f0] disabled:opacity-40 hover:bg-[#f9fafe]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => adminService.getDashboardStats(),
  })

  const total = stats?.total_members ?? 244
  const active = stats?.active_courses ?? 23

  return (
    <div className="space-y-5">
      {/* Row 1: Member Donut + Course Stats Bar */}
      <div className="grid grid-cols-2 gap-5">
        {statsLoading
          ? <div className="bg-white rounded-[20px] border border-[#e5e6f0] h-[420px] animate-pulse" />
          : <MemberStatsCard total={total} />}
        <CourseStatsCard />
      </div>

      {/* Row 2: Enrollment 3 donuts */}
      {statsLoading
        ? <div className="bg-white rounded-[20px] border border-[#e5e6f0] h-[320px] animate-pulse" />
        : <EnrollmentSection totalMembers={total} />}

      {/* Row 3: Course Overview mini stats */}
      {statsLoading
        ? <div className="grid grid-cols-5 gap-4">{Array.from({ length: 5 }).map((_, i) =>
          <div key={i} className="bg-[#f9fafe] border border-[#e5e6f0] rounded-[15px] h-[87px] animate-pulse" />)}</div>
        : <CourseOverview activeCourses={active} totalMembers={total} />}

      {/* Row 4: Member Table */}
      <MemberTable />
    </div>
  )
}
