'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { adminService } from '@/lib/api/services/admin.service'
import { formatDateTime } from '@/lib/utils/format'
import type { Registration } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'pending' | 'confirmed' | 'cancelled'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'ทั้งหมด' },
  { key: 'pending',   label: 'รอดำเนินการ' },
  { key: 'confirmed', label: 'อนุมัติแล้ว' },
  { key: 'cancelled', label: 'ปฏิเสธแล้ว' },
]

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: 'รอดำเนินการ', color: '#92610b', bg: '#fff8e6' },
    confirmed: { label: 'อนุมัติแล้ว', color: '#166534', bg: '#dcfce7' },
    cancelled: { label: 'ปฏิเสธแล้ว', color: '#991b1b', bg: '#fee2e2' },
    completed: { label: 'เสร็จสิ้น',  color: '#1d4ed8', bg: '#dbeafe' },
  }
  const s = map[status] ?? { label: status, color: '#6b7280', bg: '#f3f4f6' }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 12px', borderRadius: 999,
      fontSize: 13, fontWeight: 600,
      color: s.color, backgroundColor: s.bg,
      fontFamily: 'var(--font-thai)',
    }}>
      {s.label}
    </span>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminRegistrationsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const statusParam = activeTab === 'all' ? undefined : activeTab

  const { data, isLoading } = useQuery({
    queryKey: ['admin-association-registrations', page, activeTab, search],
    queryFn: () => adminService.getAssociationRegistrations({ page, page_size: 10, search, status: statusParam }),
  })

  const regs: Registration[] = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div style={{ fontFamily: 'var(--font-thai)', padding: '32px 40px', backgroundColor: '#f8f9fc', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1f4488', margin: 0 }}>
          คำขอสมัครสมาชิกสมาคม
        </h1>
        <p style={{ fontSize: 14, color: '#7b7b7b', margin: '6px 0 0' }}>
          ตรวจสอบและอนุมัติคำขอสมัครสมาชิกสมาคม TIBA
        </p>
      </div>

      {/* Search + Tabs */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 16, padding: '20px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24,
      }}>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="ค้นหาชื่อ / อีเมล..."
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '1.5px solid #e5e7eb', borderRadius: 10,
            padding: '10px 16px', fontSize: 15,
            fontFamily: 'var(--font-thai)', outline: 'none', marginBottom: 16,
          }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setPage(1) }}
              style={{
                padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 14,
                backgroundColor: activeTab === t.key ? '#1f4488' : '#f0f4ff',
                color: activeTab === t.key ? '#fff' : '#1f4488',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden',
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid #e5e7eb', borderTopColor: '#1f4488',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : regs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'var(--font-thai)', color: '#9ca3af', fontSize: 16 }}>ไม่พบข้อมูลคำขอสมาชิก</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f4ff', borderBottom: '1px solid #e5e7eb' }}>
                  {['ชื่อ', 'ประเภท', 'อีเมล', 'วันที่', 'สถานะ', 'การจัดการ'].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 16px', textAlign: 'left',
                        fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 13,
                        color: '#1f4488', whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regs.map(reg => (
                  <tr
                    key={reg.registration_id}
                    style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafbff')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                  >
                    {/* ชื่อ */}
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 15, color: '#0a0a0a', margin: 0 }}>
                        {reg.member_name}
                      </p>
                    </td>

                    {/* ประเภท */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 12px', borderRadius: 999,
                        fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-thai)',
                        backgroundColor: '#f0f4ff', color: '#1f4488',
                      }}>
                        สมาชิกสมาคม
                      </span>
                    </td>

                    {/* อีเมล */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#374151' }}>
                        {reg.member_email}
                      </span>
                    </td>

                    {/* วันที่ */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#9ca3af' }}>
                        {formatDateTime(reg.registered_at)}
                      </span>
                    </td>

                    {/* สถานะ */}
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={reg.status} />
                    </td>

                    {/* การจัดการ */}
                    <td style={{ padding: '14px 16px' }}>
                      <Link
                        href={`/admin/registrations/${reg.registration_id}`}
                        style={{
                          display: 'inline-block', padding: '7px 18px', borderRadius: 8,
                          border: '1.5px solid #1f4488', textDecoration: 'none',
                          fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 13, color: '#1f4488',
                          transition: 'all 0.15s',
                        }}
                      >
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderTop: '1px solid #f3f4f6',
            flexWrap: 'wrap', gap: 12,
          }}>
            <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b' }}>
              ทั้งหมด {pagination.total_items.toLocaleString()} รายการ
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 14,
                    backgroundColor: p === page ? '#1f4488' : '#f0f4ff',
                    color: p === page ? '#fff' : '#1f4488',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
