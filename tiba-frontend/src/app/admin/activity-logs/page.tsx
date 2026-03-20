'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Calendar, SlidersHorizontal, ChevronLeft, ChevronRight, Activity } from 'lucide-react'
import { adminService } from '@/lib/api/services/admin.service'
import type { ActivityLog } from '@/types'

const F = 'var(--font-thai)'

const CATEGORY_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  user_management:       { label: 'จัดการผู้ใช้',    bg: '#dbeafe', color: '#1d4ed8' },
  registration_review:   { label: 'ตรวจสอบสมัคร',  bg: '#fef3c7', color: '#b45309' },
  payment_confirm:       { label: 'ยืนยันชำระเงิน', bg: '#dcfce7', color: '#15803d' },
  course_management:     { label: 'จัดการคอร์ส',    bg: '#f3e8ff', color: '#7e22ce' },
  enrollment_management: { label: 'จัดการลงทะเบียน',bg: '#fff7ed', color: '#c2410c' },
  content_management:    { label: 'จัดการเนื้อหา',  bg: '#f0fdf4', color: '#166534' },
  system:                { label: 'ระบบ',           bg: '#f1f5f9', color: '#475569' },
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }: { page: number; totalPages: number; totalItems: number; pageSize: number; onPageChange: (p: number) => void }) {
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)
  const pages: (number | '...')[] = []
  if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i) }
  else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 15, color: '#6b7280', fontFamily: F }}>แสดง {from} ถึง {to} จาก {totalItems} รายการ</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}>
          <ChevronLeft size={14} />
        </button>
        {pages.map((p, i) => p === '...'
          ? <span key={`e${i}`} style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 15 }}>...</span>
          : <button key={p} onClick={() => onPageChange(p as number)} style={{ width: 32, height: 32, borderRadius: 6, border: p === page ? 'none' : '1px solid #e5e7eb', backgroundColor: p === page ? '#132953' : '#fff', color: p === page ? '#fff' : '#374151', fontSize: 15, cursor: 'pointer', fontFamily: F }}>{p}</button>
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ActivityLogsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs', page, search, category],
    queryFn: () => adminService.getActivityLogs({
      page, page_size: 20, search,
      ...(category !== 'all' ? { category } : {}),
    }),
  })

  const logs: ActivityLog[] = data?.data ?? []
  const pagination = data?.pagination

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 15, fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap', fontFamily: F, backgroundColor: '#f9fafb' }
  const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: 15, color: '#374151', fontFamily: F, borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }

  const formatDt = (s: string) => {
    try {
      return new Date(s).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch { return s }
  }

  return (
    <div style={{ fontFamily: F }}>
      {/* Page title */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20, fontFamily: F }}>บันทึกกิจกรรม</h1>

      {/* Controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="ค้นหากิจกรรม..."
            style={{ width: '100%', height: 42, paddingLeft: 16, paddingRight: 42, borderRadius: 8, border: 'none', backgroundColor: '#f5f5f5', fontSize: 16, color: '#374151', outline: 'none', boxSizing: 'border-box', fontFamily: F }} />
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
          <Calendar size={16} color="#6b7280" /> เลือกวันที่
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
          <SlidersHorizontal size={16} color="#6b7280" /> ฟิลเตอร์
        </button>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['all', 'ทั้งหมด'], ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => [k, v.label])].map(([val, lbl]) => (
            <button key={val} onClick={() => { setCategory(val); setPage(1) }} style={{
              height: 38, padding: '0 14px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: F,
              border: `1px solid ${category === val ? '#132953' : '#e5e7eb'}`,
              backgroundColor: category === val ? '#132953' : '#fff',
              color: category === val ? '#fff' : '#374151',
              fontWeight: category === val ? 600 : 400,
            }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>วันที่-เวลา</th>
                <th style={thStyle}>ผู้ดำเนินการ</th>
                <th style={thStyle}>ประเภท</th>
                <th style={thStyle}>การกระทำ</th>
                <th style={thStyle}>รายละเอียด</th>
                <th style={thStyle}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>กำลังโหลด...</td></tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#9ca3af' }}>
                      <Activity size={36} style={{ opacity: 0.3 }} />
                      <span style={{ fontFamily: F, fontSize: 16 }}>ไม่พบบันทึกกิจกรรม</span>
                    </div>
                  </td>
                </tr>
              ) : logs.map(log => {
                const cat = CATEGORY_CONFIG[log.action_category] ?? { label: log.action_category, bg: '#f1f5f9', color: '#475569' }
                return (
                  <tr key={log.log_id}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ ...tdStyle, color: '#6b7280', fontSize: 14, whiteSpace: 'nowrap' }}>
                      {formatDt(log.created_at)}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#132953', flexShrink: 0 }}>
                          {(log.admin_name ?? 'A').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 15, color: '#374151' }}>{log.admin_name ?? log.admin_id}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 13, fontWeight: 500, fontFamily: F, backgroundColor: cat.bg, color: cat.color, whiteSpace: 'nowrap' }}>
                        {cat.label}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{log.action_verb}</td>
                    <td style={{ ...tdStyle, color: '#6b7280', maxWidth: 280 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.description ?? '-'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#9ca3af', fontSize: 14, fontFamily: 'var(--font-eng)' }}>
                      {log.ip_address ?? '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {pagination && pagination.total_pages >= 1 && (
          <Pagination page={page} totalPages={pagination.total_pages} totalItems={pagination.total_items} pageSize={20} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}
