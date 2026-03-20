'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Search, Calendar, SlidersHorizontal, Plus, MoreVertical, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
import { adminService } from '@/lib/api/services/admin.service'
import type { MemberCompany } from '@/types'

const F = 'var(--font-thai)'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
        backgroundColor: checked ? '#15803d' : '#d1d5db', position: 'relative', transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 20 : 3,
        width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s',
      }} />
    </button>
  )
}

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 15, color: '#6b7280', fontFamily: F }}>แสดง {from} ถึง {to} จาก {totalItems} รายการ</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}>
          <ChevronLeft size={14} />
        </button>
        {pages.map((p, i) => p === '...'
          ? <span key={`e${i}`} style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 15 }}>...</span>
          : <button key={p} onClick={() => onPageChange(p as number)} style={{ width: 32, height: 32, borderRadius: 6, border: p === page ? 'none' : '1px solid #e5e7eb', backgroundColor: p === page ? '#1f4488' : '#fff', color: p === page ? '#fff' : '#374151', fontSize: 15, cursor: 'pointer', fontFamily: F }}>{p}</button>
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

export default function MemberCompaniesPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionMenu, setActionMenu] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<MemberCompany | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['member-companies', page, search],
    queryFn: () => adminService.getMemberCompanies({ page, page_size: 10, search }),
  })

  const companies: MemberCompany[] = data?.data ?? []
  const pagination = data?.pagination

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      adminService.toggleMemberCompanyStatus(id, is_active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['member-companies'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteMemberCompany(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['member-companies'] }); setDeleteConfirm(null) },
  })

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 15, fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap', fontFamily: F, backgroundColor: '#f9fafb' }
  const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: 15, color: '#374151', fontFamily: F, borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }

  return (
    <div style={{ fontFamily: F }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20 }}>บริษัทสมาชิก</h1>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="ค้นหาบริษัท..."
            style={{ width: '100%', height: 42, paddingLeft: 16, paddingRight: 42, borderRadius: 8, border: 'none', backgroundColor: '#f5f5f5', fontSize: 16, color: '#374151', outline: 'none', boxSizing: 'border-box', fontFamily: F }} />
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, color: '#374151', cursor: 'pointer', fontFamily: F }}>
          <Calendar size={16} color="#6b7280" /> เลือกวันที่
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, color: '#374151', cursor: 'pointer', fontFamily: F }}>
          <SlidersHorizontal size={16} color="#6b7280" /> ฟิลเตอร์
        </button>
        <button onClick={() => router.push('/admin/member-companies/create')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 18px', borderRadius: 8, border: 'none', backgroundColor: '#1f4488', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F, marginLeft: 'auto' }}>
          <Plus size={16} /> สร้างบริษัทสมาชิก
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>บริษัท</th>
                <th style={thStyle}>ประเภทบริษัท</th>
                <th style={{ ...thStyle, maxWidth: 200 }}>ที่อยู่</th>
                <th style={thStyle}>สถานะ</th>
                <th style={thStyle}>วันที่สร้าง</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>กำลังโหลด...</td></tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#9ca3af' }}>
                      <Building2 size={36} style={{ opacity: 0.3 }} />
                      <span style={{ fontFamily: F, fontSize: 16 }}>ไม่พบข้อมูล</span>
                    </div>
                  </td>
                </tr>
              ) : companies.map(c => (
                <tr key={c.company_id}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {c.logo_url
                        ? <img src={c.logo_url} alt={c.name} style={{ width: 36, height: 38, borderRadius: 8, objectFit: 'cover', border: '1px solid #f3f4f6' }} />
                        : <div style={{ width: 36, height: 38, borderRadius: 8, backgroundColor: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building2 size={18} color="#1f4488" />
                          </div>}
                      <span style={{ fontWeight: 500, color: '#1f4488' }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>{c.company_type || '-'}</td>
                  <td style={{ ...tdStyle, maxWidth: 200 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6b7280' }}>{c.address || '-'}</span>
                  </td>
                  <td style={tdStyle}>
                    <Toggle checked={c.is_active} onChange={v => toggleMutation.mutate({ id: c.company_id, is_active: v })} />
                  </td>
                  <td style={{ ...tdStyle, color: '#6b7280', fontSize: 14 }}>
                    {new Date(c.created_at).toLocaleDateString('th-TH')}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', position: 'relative' }}>
                    <button onClick={() => setActionMenu(actionMenu === c.company_id ? null : c.company_id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4 }}>
                      <MoreVertical size={16} color="#6b7280" />
                    </button>
                    {actionMenu === c.company_id && (
                      <div style={{ position: 'absolute', right: 24, top: '100%', zIndex: 50, backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 140 }}>
                        <button onClick={() => { router.push(`/admin/member-companies/${c.company_id}`); setActionMenu(null) }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px', fontSize: 15, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F }}>ดูรายละเอียด</button>
                        <button onClick={() => { router.push(`/admin/member-companies/${c.company_id}/edit`); setActionMenu(null) }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px', fontSize: 15, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F }}>แก้ไข</button>
                        <button onClick={() => { setDeleteConfirm(c); setActionMenu(null) }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px', fontSize: 15, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F }}>ลบ</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination && pagination.total_pages >= 1 && (
          <Pagination page={page} totalPages={pagination.total_pages} totalItems={pagination.total_items} pageSize={10} onPageChange={setPage} />
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 34, width: 400, textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, fontFamily: F }}>ยืนยันการลบ</p>
            <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 24, fontFamily: F }}>คุณต้องการลบ &quot;{deleteConfirm.name}&quot; ใช่หรือไม่?</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '8px 24px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F }}>ยกเลิก</button>
              <button onClick={() => deleteMutation.mutate(deleteConfirm.company_id)} disabled={deleteMutation.isPending}
                style={{ padding: '8px 24px', borderRadius: 8, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F }}>
                {deleteMutation.isPending ? 'กำลังลบ...' : 'ลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
