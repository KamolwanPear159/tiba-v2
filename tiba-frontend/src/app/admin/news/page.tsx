'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Search, Calendar, SlidersHorizontal, Plus, ChevronLeft, ChevronRight, FileText, Pin, Image as ImageIcon, Eye, Pencil, Trash2 } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'
import type { Article } from '@/types'

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

// ─── Confirm Delete ───────────────────────────────────────────────────────────
function ConfirmDelete({ item, onClose, onConfirm, loading }: { item: Article; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 400, padding: '32px 28px', textAlign: 'center', fontFamily: F }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>ลบข่าวสาร</h3>
        <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 24 }}>คุณต้องการลบ &quot;{item.title}&quot; หรือไม่?</p>
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminNewsPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteItem, setDeleteItem] = useState<Article | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['news', page, search],
    queryFn: () => contentService.getNews({ page, page_size: 10, search }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteNews(id),
    onSuccess: () => {
      toast.success('ลบสำเร็จ')
      qc.invalidateQueries({ queryKey: ['news'] })
      setDeleteItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const articles = data?.data ?? []
  const pagination = data?.pagination

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 15, fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap', fontFamily: F, backgroundColor: '#f9fafb' }
  const tdStyle: React.CSSProperties = { padding: '14px 16px', fontSize: 16, color: '#374151', fontFamily: F, borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }

  const formatDt = (s: string) => {
    try {
      return new Date(s).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch { return s }
  }

  return (
    <div style={{ fontFamily: F }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20, fontFamily: F }}>ข่าวสารและบทความ</h1>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="ค้นหาหัวข้อ..."
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
          onClick={() => router.push('/admin/news/create')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 18px', borderRadius: 8, border: 'none', backgroundColor: PRIMARY, color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}
        >
          <Plus size={15} /> สร้างข่าวสาร
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 18px', borderRadius: 8, border: `1px solid ${PRIMARY}`, backgroundColor: '#fff', color: PRIMARY, fontSize: 16, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
          <Plus size={15} /> สร้างแท็ก
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 48, textAlign: 'center' }}>ปักหมุด</th>
                <th style={thStyle}>ชื่อบทความ</th>
                <th style={{ ...thStyle, textAlign: 'center', width: 100 }}>สถานะ</th>
                <th style={{ ...thStyle, width: 100 }}>ประเภท</th>
                <th style={{ ...thStyle, width: 130 }}>วันที่</th>
                <th style={{ ...thStyle, textAlign: 'center', width: 120 }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>กำลังโหลด...</td></tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#9ca3af' }}>
                      <FileText size={40} strokeWidth={1.2} />
                      <span style={{ fontFamily: F, fontSize: 16 }}>ยังไม่มีข่าวสาร</span>
                    </div>
                  </td>
                </tr>
              ) : articles.map((item, idx) => (
                <tr
                  key={item.news_id}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <Pin size={15} color={idx === 0 ? PRIMARY : '#d1d5db'} style={{ cursor: 'pointer' }} />
                  </td>
                  <td style={tdStyle}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onClick={() => router.push(`/admin/news/${item.news_id}`)}
                    >
                      {item.thumbnail_url
                        ? <img src={item.thumbnail_url} alt="" style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 56, height: 56, borderRadius: 6, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ImageIcon size={20} color="#9ca3af" /></div>
                      }
                      <span style={{ fontWeight: 500, color: '#111827', maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: F, backgroundColor: item.is_published ? '#dcfce7' : '#f3f4f6', color: item.is_published ? '#16a34a' : '#6b7280' }}>
                      {item.is_published ? 'เผยแพร่' : 'ร่าง'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: F, backgroundColor: item.article_type === 'news' ? '#dbeafe' : '#ede9fe', color: item.article_type === 'news' ? '#1d4ed8' : '#7c3aed' }}>
                      {item.article_type === 'news' ? 'ข่าว' : 'บทความ'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#6b7280', fontSize: 15, whiteSpace: 'nowrap' }}>
                    {formatDt(item.published_at || item.created_at)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button
                        onClick={() => router.push(`/admin/news/${item.news_id}`)}
                        title="ดู"
                        style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Eye size={14} color="#6b7280" />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/news/${item.news_id}/edit`)}
                        title="แก้ไข"
                        style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Pencil size={14} color="#6b7280" />
                      </button>
                      <button
                        onClick={() => setDeleteItem(item)}
                        title="ลบ"
                        style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #fee2e2', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
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

      {deleteItem && (
        <ConfirmDelete
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => deleteMutation.mutate(deleteItem.news_id)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
