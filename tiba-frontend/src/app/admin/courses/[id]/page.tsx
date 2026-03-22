'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Search, MoreVertical } from 'lucide-react'
import { courseService } from '@/lib/api/services/course.service'
import { adminService } from '@/lib/api/services/admin.service'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FONT = 'var(--font-thai)'

const labelStyle: React.CSSProperties = {
  fontSize: 15,
  color: '#9ca3af',
  fontFamily: FONT,
  marginBottom: 4,
  display: 'block',
}
const valueStyle: React.CSSProperties = {
  fontSize: 16,
  color: '#111827',
  fontFamily: FONT,
  fontWeight: 500,
}

function formatCurrency(n?: number): string {
  if (n == null) return '-'
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function formatDateTime(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${formatDate(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const MEMBER_TYPE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  general:     { label: 'ทั่วไป',  color: '#15803d', bg: '#dcfce7' },
  association: { label: 'สมาคม',  color: '#b45309', bg: '#fef3c7' },
}

const REG_STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'รอยืนยัน', color: '#1d4ed8', bg: '#dbeafe' },
  confirmed: { label: 'ยืนยันแล้ว', color: '#15803d', bg: '#dcfce7' },
  completed: { label: 'สำเร็จ',   color: '#15803d', bg: '#dcfce7' },
  cancelled: { label: 'ยกเลิก',  color: '#dc2626', bg: '#fee2e2' },
}

function Badge({ style: s }: { style: { label: string; color: string; bg: string } }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: 14, fontWeight: 600, color: s.color, backgroundColor: s.bg, fontFamily: FONT }}>
      {s.label}
    </span>
  )
}

// ─── Tab 1: Course Info ───────────────────────────────────────────────────────

function CourseInfoTab({ courseId }: { courseId: string }) {
  const { data: course, isLoading } = useQuery({
    queryKey: ['admin-course', courseId],
    queryFn: () => courseService.getCourse(courseId),
  })
  const { data: sessions = [] } = useQuery({
    queryKey: ['admin-sessions', courseId],
    queryFn: () => courseService.getSessions(courseId),
  })

  if (isLoading) {
    return <div style={{ padding: '42px', textAlign: 'center', color: '#9ca3af', fontFamily: FONT }}>กำลังโหลด...</div>
  }
  if (!course) return null

  const session = sessions[0]

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid #e5e6f0',
    padding: '24px 28px',
    marginBottom: 20,
  }

  return (
    <div>
      {/* Top info card */}
      <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* Thumbnail */}
        <div>
          {course.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', borderRadius: 10, objectFit: 'cover', aspectRatio: '4/3' }} />
          ) : (
            <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 10, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#9ca3af', fontSize: 14, fontFamily: FONT }}>ไม่มีรูปภาพ</span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: FONT, marginBottom: 16 }}>{course.title}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <span style={labelStyle}>ราคาสมาชิกทั่วไป</span>
              <span style={valueStyle}>฿ {formatCurrency(course.price_general)}</span>
            </div>
            {course.price_type === 'dual' && (
              <div>
                <span style={labelStyle}>ราคาสมาชิกสมาคม</span>
                <span style={valueStyle}>฿ {formatCurrency(course.price_association)}</span>
              </div>
            )}
            <div>
              <span style={labelStyle}>รูปแบบ</span>
              <span style={valueStyle}>{course.format === 'online' ? 'ออนไลน์' : 'ออฟไลน์'}</span>
            </div>
          </div>

          {session && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <span style={labelStyle}>วันที่อบรม</span>
                <span style={valueStyle}>{formatDateTime(session.training_start)} - {formatDateTime(session.training_end)}</span>
              </div>
              <div>
                <span style={labelStyle}>วันที่เปิดจอง</span>
                <span style={valueStyle}>{formatDateTime(session.enrollment_start)} - {formatDateTime(session.enrollment_end)}</span>
              </div>
              <div>
                <span style={labelStyle}>สถานที่</span>
                <span style={valueStyle}>{session.location || '-'}</span>
              </div>
              <div>
                <span style={labelStyle}>ที่นั่ง</span>
                <span style={valueStyle}>{session.enrolled_count ?? 0} / {session.seat_capacity}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <div style={cardStyle}>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#111827', fontFamily: FONT, marginBottom: 12 }}>รายละเอียด</p>
          <p style={{ fontSize: 16, color: '#374151', fontFamily: FONT, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{course.description}</p>
        </div>
      )}

      {/* Online link */}
      {course.format === 'online' && course.online_link && (
        <div style={cardStyle}>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#111827', fontFamily: FONT, marginBottom: 8 }}>ลิงก์การอบรม</p>
          <a href={course.online_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 16, color: '#1f4488', fontFamily: FONT }}>
            {course.online_link}
          </a>
        </div>
      )}

      {/* Tutors */}
      {course.tutors && course.tutors.length > 0 && (
        <div style={cardStyle}>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#111827', fontFamily: FONT, marginBottom: 16 }}>ผู้สอน</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {course.tutors.map(t => (
              <div key={t.tutor_id} style={{ display: 'flex', gap: 10, alignItems: 'center', backgroundColor: '#f3f6fb', borderRadius: 10, padding: '10px 16px' }}>
                {t.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#e8f0fd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, color: '#1f4488', fontFamily: FONT }}>
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>{t.name}</p>
                  <p style={{ fontFamily: FONT, fontSize: 13, color: '#6b7280', margin: 0 }}>{t.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab 2: Enrollment History ────────────────────────────────────────────────

function EnrollmentHistoryTab({ courseId }: { courseId: string }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const { data, isLoading } = useQuery({
    queryKey: ['admin-registrations', courseId, page, search],
    queryFn: () => adminService.getRegistrations({ page, page_size: PAGE_SIZE, search, course_id: courseId } as Parameters<typeof adminService.getRegistrations>[0]),
  })

  const registrations = data?.data || []
  const pagination = data?.pagination
  const totalItems = pagination?.total_items || 0
  const totalPages = pagination?.total_pages || 1
  const from = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, totalItems)

  const thStyle: React.CSSProperties = {
    padding: '12px 14px', textAlign: 'left', fontSize: 15, fontWeight: 600,
    color: '#6b7280', backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6',
    fontFamily: FONT, whiteSpace: 'nowrap',
  }
  const tdStyle: React.CSSProperties = {
    padding: '12px 14px', fontSize: 15, color: '#374151',
    borderBottom: '1px solid #f3f4f6', fontFamily: FONT,
  }

  const statCards = [
    { label: 'จำนวนผู้สมัคร', value: totalItems, highlight: true },
    { label: 'รอยืนยัน', value: registrations.filter(r => r.status === 'pending').length },
    { label: 'สำเร็จ', value: registrations.filter(r => r.status === 'completed').length },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', fontFamily: FONT }}>รายชื่อผู้สมัครคอร์ส</h2>
        <div style={{ position: 'relative', width: 240 }}>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="ค้นหา..."
            style={{ width: '100%', height: 38, paddingLeft: 14, paddingRight: 38, border: '1px solid #e5e6f0', borderRadius: 8, fontSize: 15, fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }}
          />
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {statCards.map(c => (
          <div key={c.label} style={{
            backgroundColor: c.highlight ? '#f0f7f0' : '#fff',
            border: c.highlight ? '1.5px solid #16a34a' : '1px solid #e5e6f0',
            borderRadius: 10, padding: '14px 18px',
          }}>
            <p style={{ fontSize: 15, color: '#6b7280', fontFamily: FONT, marginBottom: 4 }}>{c.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: c.highlight ? '#15803d' : '#111827', fontFamily: FONT }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e6f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>รหัสคำสั่งซื้อ</th>
                <th style={thStyle}>สมาชิก</th>
                <th style={thStyle}>สถานะ</th>
                <th style={thStyle}>คอร์ส</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>ยอดรวม</th>
                <th style={thStyle}>วันที่สร้าง</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '42px', color: '#9ca3af' }}>กำลังโหลด...</td></tr>
              ) : registrations.length === 0 ? (
                <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '42px', color: '#9ca3af' }}>ไม่พบข้อมูล</td></tr>
              ) : registrations.map(reg => (
                <tr key={reg.registration_id}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600, color: '#1f4488' }}>{reg.registration_id.slice(0, 12).toUpperCase()}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 14, color: '#374151', fontFamily: FONT }}>A04001</span>
                          <Badge style={MEMBER_TYPE_BADGE['general']} />
                        </div>
                        <span style={{ fontSize: 15, color: '#374151', fontFamily: FONT }}>{reg.member_name}</span>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <Badge style={REG_STATUS_BADGE[reg.status] || REG_STATUS_BADGE.pending} />
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 15 }}>{reg.course_title}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>-</td>
                  <td style={tdStyle}>
                    <span style={{ color: '#6b7280', fontSize: 15 }}>{formatDateTime(reg.registered_at)}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button style={{ width: 30, height: 30, border: '1px solid #e5e6f0', borderRadius: 6, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      <MoreVertical size={14} color="#6b7280" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 15, color: '#6b7280', fontFamily: FONT }}>
              แสดง {from} ถึง {to} จาก {totalItems} รายการ
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, '...', 8, 9, 10].map((p, i) => (
                <button
                  key={i}
                  onClick={() => typeof p === 'number' && setPage(p)}
                  style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #e5e6f0', backgroundColor: p === page ? '#132953' : '#fff', color: p === page ? '#fff' : '#374151', fontSize: 15, cursor: 'pointer', fontFamily: FONT }}
                >{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [activeTab, setActiveTab] = useState<'info' | 'enrollments'>('info')

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: 8,
    border: active ? '1.5px solid #16a34a' : '1px solid #e5e6f0',
    backgroundColor: active ? '#16a34a' : '#fff',
    color: active ? '#fff' : '#374151',
    fontSize: 16,
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    fontFamily: FONT,
  })

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 0 32px', fontFamily: FONT }}>
      {/* Back + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          onClick={() => router.push('/admin/courses')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280', fontFamily: FONT }}
        >
          <ChevronLeft size={16} />
          ย้อนกลับ
        </button>
        <span style={{ fontSize: 15, color: '#9ca3af', fontFamily: FONT }}>
          จัดการคอร์สอบรม / ข้อมูลคอร์สอบรม
        </span>
      </div>

      {/* Tabs + action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={tabStyle(activeTab === 'info')} onClick={() => setActiveTab('info')}>
            ข้อมูลคอร์สอบรม
          </button>
          <button style={tabStyle(activeTab === 'enrollments')} onClick={() => setActiveTab('enrollments')}>
            ประวัติการสมัคร
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => window.open(`/courses/${courseId}`, '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: FONT, color: '#374151' }}
          >
            ดูตัวอย่าง
          </button>
          <button
            onClick={() => router.push(`/admin/courses/${courseId}/edit`)}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', backgroundColor: '#1f4488', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}
          >
            แก้ไข
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'info' ? (
        <CourseInfoTab courseId={courseId} />
      ) : (
        <EnrollmentHistoryTab courseId={courseId} />
      )}
    </div>
  )
}
