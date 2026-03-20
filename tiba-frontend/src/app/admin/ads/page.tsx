'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Search, Calendar, SlidersHorizontal, Plus, ChevronLeft, ChevronRight, Image as ImageIcon, MoreVertical } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'
import type { Ad } from '@/types'

const F = 'var(--font-thai)'
const PRIMARY = '#1f4488'

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', backgroundColor: value ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

// ─── 3-dot Menu ───────────────────────────────────────────────────────────────
function DotMenu({ onView, onEdit, onDelete }: { onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const item = (label: string, color: string, action: () => void) => (
    <button onClick={() => { action(); setOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color, fontFamily: F }}>
      {label}
    </button>
  )
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, color: '#6b7280', display: 'flex', alignItems: 'center' }}>
        <MoreVertical size={17} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', minWidth: 140, padding: '4px 0' }}>
          {item('ดูรายละเอียด', '#374151', onView)}
          {item('แก้ไข', '#374151', onEdit)}
          {item('ลบ', '#ef4444', onDelete)}
        </div>
      )}
    </div>
  )
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────
function ConfirmDelete({ item, onClose, onConfirm, loading }: { item: Ad; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 400, padding: '32px 28px', textAlign: 'center', fontFamily: F }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>ลบโฆษณา</h3>
        <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 24 }}>คุณต้องการลบโฆษณาตำแหน่ง &quot;{item.position}&quot; หรือไม่?</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={onClose} style={{ padding: '9px 24px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F, color: '#374151' }}>ยกเลิก</button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: '9px 24px', borderRadius: 8, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F, opacity: loading ? 0.7 : 1 }}>ลบ</button>
        </div>
      </div>
    </div>
  )
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
  const btn = (child: React.ReactNode, disabled: boolean, action: () => void, active = false): React.ReactElement => (
    <button onClick={action} disabled={disabled} style={{ minWidth: 32, height: 32, borderRadius: 6, border: active ? 'none' : '1px solid #e5e7eb', backgroundColor: active ? PRIMARY : '#fff', color: active ? '#fff' : disabled ? '#d1d5db' : '#374151', fontSize: 15, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
      {child}
    </button>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 15, color: '#6b7280', fontFamily: F }}>แสดง {from} ถึง {to} จาก {totalItems} รายการ</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {btn(<ChevronLeft size={14} />, page === 1, () => onPageChange(page - 1))}
        {pages.map((p, i) => p === '...' ? <span key={`e${i}`} style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 15 }}>...</span> : btn(p, false, () => onPageChange(p as number), p === page))}
        {btn(<ChevronRight size={14} />, page === totalPages, () => onPageChange(page + 1))}
      </div>
    </div>
  )
}

const POSITION_LABEL: Record<string, string> = { top: 'ด้านบน', sidebar: 'แถบข้าง', bottom: 'ด้านล่าง', popup: 'ป๊อปอัพ' }
const POSITION_COLOR: Record<string, { bg: string; color: string }> = {
  top: { bg: '#dbeafe', color: '#1d4ed8' },
  sidebar: { bg: '#dcfce7', color: '#16a34a' },
  bottom: { bg: '#fef9c3', color: '#b45309' },
  popup: { bg: '#ede9fe', color: '#7c3aed' },
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminAdsPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteItem, setDeleteItem] = useState<Ad | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['ads', page, search],
    queryFn: () => contentService.getAds({ page, page_size: 10, search }),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const fd = new FormData()
      fd.append('is_active', String(is_active))
      return contentService.updateAd(id, fd)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ads'] }),
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteAd(id),
    onSuccess: () => {
      toast.success('ลบโฆษณาสำเร็จ')
      qc.invalidateQueries({ queryKey: ['ads'] })
      setDeleteItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const ads = data?.data ?? []
  const pagination = data?.pagination

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 15, fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap', fontFamily: F, backgroundColor: '#f9fafb' }
  const tdStyle: React.CSSProperties = { padding: '14px 16px', fontSize: 16, color: '#374151', fontFamily: F, borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }

  const formatDt = (s: string) => {
    try { return new Date(s).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
    catch { return s }
  }

  return (
    <div style={{ fontFamily: F }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20, fontFamily: F }}>โฆษณา</h1>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="ค้นหาโฆษณา..."
            style={{ width: '100%', height: 42, paddingLeft: 16, paddingRight: 42, borderRadius: 8, border: 'none', backgroundColor: '#f5f5f5', fontSize: 16, color: '#374151', outline: 'none', boxSizing: 'border-box', fontFamily: F }}
          />
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
          <Calendar size={16} color="#6b7280" /> เลือกวันที่
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
          <SlidersHorizontal size={16} color="#6b7280" /> ฟิลเตอร์
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => router.push('/admin/ads/create')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 18px', borderRadius: 8, border: 'none', backgroundColor: PRIMARY, color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}
        >
          <Plus size={15} /> สร้างโฆษณา
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 60, textAlign: 'center' }}>ลำดับ</th>
                <th style={{ ...thStyle, width: 80 }}>รูปโฆษณา</th>
                <th style={thStyle}>แบนเนอร์ลิงค์</th>
                <th style={{ ...thStyle, width: 110 }}>ตำแหน่ง</th>
                <th style={{ ...thStyle, width: 200 }}>วันเริ่ม-สิ้นสุด</th>
                <th style={{ ...thStyle, width: 90, textAlign: 'center' }}>สถานะ</th>
                <th style={{ ...thStyle, width: 70, textAlign: 'center' }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>กำลังโหลด...</td></tr>
              ) : ads.length === 0 ? (
                <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>ไม่พบข้อมูลโฆษณา</td></tr>
              ) : ads.map((ad, idx) => {
                const pos = POSITION_COLOR[ad.position] ?? { bg: '#f3f4f6', color: '#6b7280' }
                return (
                  <tr key={ad.ad_id} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280' }}>{(page - 1) * 10 + idx + 1}</td>
                    <td style={tdStyle}>
                      {ad.image_url
                        ? <img src={ad.image_url} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} />
                        : <div style={{ width: 48, height: 48, borderRadius: 6, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={18} color="#9ca3af" /></div>
                      }
                    </td>
                    <td style={tdStyle}>
                      <a href={ad.link_url} target="_blank" rel="noreferrer" style={{ color: PRIMARY, fontSize: 15, textDecoration: 'none', wordBreak: 'break-all' }}>
                        {ad.link_url || '-'}
                      </a>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: F, backgroundColor: pos.bg, color: pos.color }}>
                        {POSITION_LABEL[ad.position] ?? ad.position}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 15, color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {formatDt(ad.active_from)} – {formatDt(ad.active_until)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Toggle value={ad.is_active} onChange={val => toggleMutation.mutate({ id: ad.ad_id, is_active: val })} />
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <DotMenu
                        onView={() => router.push(`/admin/ads/${ad.ad_id}`)}
                        onEdit={() => router.push(`/admin/ads/${ad.ad_id}/edit`)}
                        onDelete={() => setDeleteItem(ad)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {pagination && pagination.total_pages >= 1 && (
          <Pagination page={page} totalPages={pagination.total_pages} totalItems={pagination.total_items} pageSize={10} onPageChange={setPage} />
        )}
      </div>

      {deleteItem && (
        <ConfirmDelete
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => deleteMutation.mutate(deleteItem.ad_id)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
