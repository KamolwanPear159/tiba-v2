'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronLeft, Download, Share2 } from 'lucide-react'
import { courseService } from '@/lib/api/services/course.service'
import { adminService } from '@/lib/api/services/admin.service'

const FONT = 'var(--font-thai)'

// ─── Color palette ────────────────────────────────────────────────────────────

const COLORS = {
  male:        '#2196F3',
  female:      '#F06292',
  general:     '#1f6b36',
  association: '#c8a04a',
  pass:        '#1f6b36',
  fail:        '#E53935',
}

// ─── Custom Pie Label ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  const pct = Math.round(percent * 100)
  if (pct < 6) return null
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 15, fontWeight: 700, fontFamily: FONT }}>
      {pct}%
    </text>
  )
}

// ─── Donut Card ───────────────────────────────────────────────────────────────

function DonutCard({ title, data, total, legend }: {
  title: string
  data: { value: number; color: string }[]
  total: number
  legend: { label: string; color: string; value: number }[]
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
      <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', fontFamily: FONT, marginBottom: 8 }}>{title}</p>
      <PieChart width={220} height={220}>
        <Pie data={data} cx={105} cy={105} innerRadius={60} outerRadius={100}
          dataKey="value" startAngle={90} endAngle={-270}
          labelLine={false} label={PieLabel}
        >
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
      </PieChart>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {legend.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: l.color }} />
            <span style={{ fontSize: 14, color: '#374151', fontFamily: FONT }}>{l.label} : {l.value} คน</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

function formatDate(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

// ─── Mock enrollment trend data ───────────────────────────────────────────────

const TREND_DATA = [
  { date: '01/04', enrollments: 12 },
  { date: '05/04', enrollments: 28 },
  { date: '10/04', enrollments: 45 },
  { date: '15/04', enrollments: 38 },
  { date: '20/04', enrollments: 62 },
  { date: '25/04', enrollments: 55 },
  { date: '30/04', enrollments: 80 },
]

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CourseSummaryPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const { data: course, isLoading } = useQuery({
    queryKey: ['admin-course', courseId],
    queryFn: () => courseService.getCourse(courseId),
  })

  const { data: sessions = [] } = useQuery({
    queryKey: ['admin-sessions', courseId],
    queryFn: () => courseService.getSessions(courseId),
  })

  const { data: regData } = useQuery({
    queryKey: ['admin-registrations-summary', courseId],
    queryFn: () => adminService.getRegistrations({ page: 1, page_size: 100 } as Parameters<typeof adminService.getRegistrations>[0]),
  })

  if (isLoading) {
    return <div style={{ padding: 42, textAlign: 'center', color: '#9ca3af', fontFamily: FONT }}>กำลังโหลด...</div>
  }

  const session = sessions[0]
  const registrations = regData?.data || []
  const totalEnrolled = registrations.length
  const totalAttended = Math.floor(totalEnrolled * 0.96)
  const totalAbsent = totalEnrolled - totalAttended
  const totalRevenue = totalEnrolled * (course?.price_general ?? 0)

  const maleCount = Math.floor(totalEnrolled * 0.59)
  const femaleCount = totalEnrolled - maleCount
  const generalCount = Math.floor(totalEnrolled * 0.76)
  const assocCount = totalEnrolled - generalCount
  const passCount = Math.floor(totalAttended * 0.96)
  const failCount = totalAttended - passCount

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid #e5e6f0',
    padding: '20px 24px',
    marginBottom: 20,
  }

  const thStyle: React.CSSProperties = {
    padding: '12px 12px',
    fontSize: 15,
    fontWeight: 600,
    color: '#6b7280',
    borderBottom: '1px solid #f3f4f6',
    backgroundColor: '#f9fafb',
    fontFamily: FONT,
    whiteSpace: 'nowrap',
  }
  const tdStyle: React.CSSProperties = {
    padding: '12px 12px',
    fontSize: 15,
    color: '#374151',
    borderBottom: '1px solid #f3f4f6',
    fontFamily: FONT,
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 0 40px', fontFamily: FONT }}>
      {/* Back + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          onClick={() => router.push('/admin/courses')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280', fontFamily: FONT }}
        >
          <ChevronLeft size={16} />
          ย้อนกลับ
        </button>
        <span style={{ fontSize: 15, color: '#9ca3af', fontFamily: FONT }}>จัดการคอร์สอบรม / ข้อมูลคอร์สอบรม</span>
      </div>

      {/* Course overview card */}
      <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 20, alignItems: 'start' }}>
        {course?.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.thumbnail_url} alt="" style={{ width: '100%', borderRadius: 10, aspectRatio: '4/3', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 10, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>ไม่มีรูป</span>
          </div>
        )}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', fontFamily: FONT, marginBottom: 12 }}>{course?.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <span style={{ fontSize: 14, color: '#9ca3af', fontFamily: FONT, display: 'block', marginBottom: 2 }}>ราคาสมาชิกทั่วไป</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#111827', fontFamily: FONT }}>฿ {formatCurrency(course?.price_general ?? 0)}</span>
            </div>
            {course?.price_type === 'dual' && (
              <div>
                <span style={{ fontSize: 14, color: '#9ca3af', fontFamily: FONT, display: 'block', marginBottom: 2 }}>ราคาสมาชิกสมาคม</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#111827', fontFamily: FONT }}>฿ {formatCurrency(course?.price_association ?? 0)}</span>
              </div>
            )}
            {session && (
              <>
                <div>
                  <span style={{ fontSize: 14, color: '#9ca3af', fontFamily: FONT, display: 'block', marginBottom: 2 }}>วันที่อบรม</span>
                  <span style={{ fontSize: 15, color: '#374151', fontFamily: FONT }}>
                    {formatDate(session.training_start)} - {formatDate(session.training_end)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 14, color: '#9ca3af', fontFamily: FONT, display: 'block', marginBottom: 2 }}>สถานที่</span>
                  <span style={{ fontSize: 15, color: '#374151', fontFamily: FONT }}>{session.location || '-'}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: FONT, color: '#374151' }}>
            ดูตัวอย่าง
          </button>
          <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', backgroundColor: '#1f4488', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
            แก้ไข
          </button>
        </div>
      </div>

      {/* Summary header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', fontFamily: FONT }}>สรุปผลการการอบรม</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: FONT, color: '#374151' }}>
            <Share2 size={14} />
            แสดงข้อมูล
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', backgroundColor: '#1f4488', color: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: FONT }}>
            <Download size={14} />
            ดาวน์โหลดรายงาน
          </button>
        </div>
      </div>

      {/* Enrollment trend */}
      <div style={cardStyle}>
        <p style={{ fontSize: 17, fontWeight: 700, color: '#1f4488', fontFamily: FONT, marginBottom: 16 }}>การลงทะเบียน</p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          {['สมาชิกทั่วไป', 'สมาชิกสมาคม', 'Share'].map((label, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: '#374151', fontFamily: FONT, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: COLORS.general }} />
              {label}
            </label>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={TREND_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 14, fontFamily: FONT }} />
            <YAxis tick={{ fontSize: 14, fontFamily: FONT }} />
            <Tooltip contentStyle={{ fontFamily: FONT, fontSize: 14 }} />
            <Line type="monotone" dataKey="enrollments" stroke={COLORS.general} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.general }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two donuts: gender + member type */}
      <div style={{ ...cardStyle, display: 'flex', gap: 0 }}>
        <p style={{ position: 'absolute', fontSize: 17, fontWeight: 700, color: '#111827', fontFamily: FONT }}>ผู้สมัคร</p>
        <div style={{ display: 'flex', width: '100%', paddingTop: 26 }}>
          <DonutCard
            title="เพศ"
            data={[{ value: maleCount, color: COLORS.male }, { value: femaleCount, color: COLORS.female }]}
            total={totalEnrolled}
            legend={[{ label: 'ชาย', color: COLORS.male, value: maleCount }, { label: 'หญิง', color: COLORS.female, value: femaleCount }]}
          />
          <div style={{ width: 1, backgroundColor: '#f3f4f6', margin: '20px 0' }} />
          <DonutCard
            title="ประเภทสมาชิก"
            data={[{ value: generalCount, color: COLORS.general }, { value: assocCount, color: COLORS.association }]}
            total={totalEnrolled}
            legend={[{ label: 'ทั่วไป', color: COLORS.general, value: generalCount }, { label: 'สมาคม', color: COLORS.association, value: assocCount }]}
          />
        </div>
      </div>

      {/* Pass/Fail donut */}
      <div style={cardStyle}>
        <p style={{ fontSize: 17, fontWeight: 700, color: '#111827', fontFamily: FONT, marginBottom: 8 }}>ผลการอบรม</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DonutCard
            title=""
            data={[{ value: passCount, color: COLORS.pass }, { value: failCount, color: COLORS.fail }]}
            total={totalAttended}
            legend={[{ label: 'ผ่าน', color: COLORS.pass, value: passCount }, { label: 'ไม่ผ่าน', color: COLORS.fail, value: failCount }]}
          />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ ...cardStyle }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: 'none' }}>
          {[
            { label: 'จำนวนผู้สมัคร', value: totalEnrolled.toString() },
            { label: 'จำนวนผู้เข้าร่วมคอร์ส', value: totalAttended.toString() },
            { label: 'จำนวนผู้ไม่เข้าร่วมคอร์ส', value: totalAbsent.toString() },
            { label: 'รายได้รวม', value: formatCurrency(totalRevenue) },
          ].map((s, i) => (
            <div key={i} style={{ padding: '16px 20px', borderRight: i < 3 ? '1px solid #f3f4f6' : 'none' }}>
              <span style={{ fontSize: 15, color: '#6b7280', fontFamily: FONT, display: 'block', marginBottom: 6 }}>{s.label}</span>
              <span style={{ fontSize: 26, fontWeight: 700, color: '#111827', fontFamily: FONT }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Enrollment table */}
        <div style={{ marginTop: 20, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['เพศ', 'คำนำหน้า', 'ชื่อสมาชิก', 'ประเภทสมาชิก', 'เข้าร่วมคอร์ส', 'ผลการอบรม', 'ใบประกาศฯ', 'วันที่สมัครคอร์ส', 'การจัดการ'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrations.slice(0, 8).map((reg, i) => (
                <tr key={i}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={tdStyle}>
                    <span style={{ fontSize: 20 }}>{i % 2 === 0 ? '♂' : '♀'}</span>
                  </td>
                  <td style={tdStyle}>นาย/นางสาว</td>
                  <td style={tdStyle}>{reg.member_name}</td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: 14, fontWeight: 600, color: '#15803d', backgroundColor: '#dcfce7', fontFamily: FONT }}>
                      ทั่วไป
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: 14, fontWeight: 600, color: '#15803d', backgroundColor: '#dcfce7', fontFamily: FONT }}>
                      เข้าร่วม
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: 14, fontWeight: 600, color: i % 7 === 0 ? '#dc2626' : '#15803d', backgroundColor: i % 7 === 0 ? '#fee2e2' : '#dcfce7', fontFamily: FONT }}>
                      {i % 7 === 0 ? 'ไม่ผ่าน' : 'ผ่าน'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: FONT, color: '#374151' }}>
                      ดาวน์โหลด
                    </button>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: '#6b7280', fontSize: 14 }}>{formatDate(reg.registered_at)}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button style={{ width: 30, height: 30, border: '1px solid #e5e6f0', borderRadius: 6, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      <span style={{ fontSize: 18, color: '#6b7280', lineHeight: 1 }}>⋮</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, color: '#6b7280', fontFamily: FONT }}>แสดง 1 ถึง {Math.min(8, registrations.length)} จาก {registrations.length} รายการ</span>
          </div>
        </div>
      </div>

      {/* Feedback section */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#111827', fontFamily: FONT }}>ความพึงพอใจ</p>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: FONT, color: '#374151' }}>
            <Share2 size={13} />
            Share
          </button>
        </div>

        {/* Sentiment bars */}
        <div style={{ padding: '16px 20px', backgroundColor: '#f9fafb', borderRadius: 10, marginBottom: 20 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: '#e5e6f0', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '10%', backgroundColor: '#E53935' }} />
              <div style={{ width: '27%', backgroundColor: '#FFB300' }} />
              <div style={{ width: '63%', backgroundColor: '#1f6b36' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { label: 'ไม่พึงพอใจ', icon: '😞', count: 16, color: '#E53935' },
              { label: 'เฉยๆ', icon: '😐', count: 45, color: '#FFB300' },
              { label: 'พึงพอใจ', icon: '😊', count: 149, color: '#1f6b36' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '12px 20px' }}>
                <span style={{ fontSize: 14, color: '#6b7280', fontFamily: FONT, marginBottom: 4 }}>{s.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: FONT }}>{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', fontFamily: FONT, marginBottom: 12 }}>ความคิดเห็น (34 รายการ)</p>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 38, borderRadius: '50%', backgroundColor: '#e5e6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, color: '#6b7280' }}>👤</span>
              </div>
              <div>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#111827', fontFamily: FONT }}>สมาชิก 00{i}</span>
                <span style={{ fontSize: 14, color: '#9ca3af', fontFamily: FONT, marginLeft: 8 }}>20/04/2025</span>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                {'⭐'.repeat(5)}
              </div>
            </div>
            <p style={{ fontSize: 15, color: '#374151', fontFamily: FONT, lineHeight: 1.7, margin: 0, paddingLeft: 48 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
