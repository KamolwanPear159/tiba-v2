'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Search, Calendar, SlidersHorizontal, Plus, X, ChevronLeft, ChevronRight, Image as ImageIcon, Pin } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'
import type { Article } from '@/types'

const F = 'var(--font-thai)'
const BTN_PRIMARY = '#132953'

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', backgroundColor: value ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

// ─── Action Menu ──────────────────────────────────────────────────────────────
function ActionMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, color: '#6b7280', fontSize: 22, lineHeight: 1, letterSpacing: 1 }}>⋮</button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', minWidth: 130, padding: '4px 0' }}>
          <button onClick={() => { onEdit(); setOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#374151', fontFamily: F }}>แก้ไข</button>
          <button onClick={() => { onDelete(); setOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#ef4444', fontFamily: F }}>ลบ</button>
        </div>
      )}
    </div>
  )
}

// ─── News Modal ───────────────────────────────────────────────────────────────
function NewsModal({ item, onClose, onSave }: { item: Article | null; onClose: () => void; onSave: (fd: FormData) => void }) {
  const isEdit = !!item
  const [title, setTitle] = useState(item?.title ?? '')
  const [type, setType] = useState<'news' | 'blog'>(item?.article_type ?? 'news')
  const [excerpt, setExcerpt] = useState(item?.excerpt ?? '')
  const [content, setContent] = useState(item?.content ?? '')
  const [isPublished, setIsPublished] = useState(item?.is_published ?? false)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [preview, setPreview] = useState(item?.thumbnail_url ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setThumbnail(f); setPreview(URL.createObjectURL(f))
  }
  const handleSubmit = () => {
    if (!title.trim()) { toast.error('กรุณากรอกหัวข้อ'); return }
    const fd = new FormData()
    fd.append('title', title); fd.append('article_type', type)
    fd.append('excerpt', excerpt); fd.append('content', content)
    fd.append('is_published', String(isPublished))
    if (thumbnail) fd.append('thumbnail', thumbnail)
    onSave(fd)
  }
  const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: F, boxSizing: 'border-box', backgroundColor: '#fff' }
  const lbl: React.CSSProperties = { fontSize: 15, color: '#374151', fontFamily: F, display: 'block', marginBottom: 4, fontWeight: 500 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 540, maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', fontFamily: F }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{isEdit ? 'แก้ไขข่าวสาร' : 'สร้างข่าวสาร/บทความ'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>รูปหน้าปก</label>
          <div onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 160, border: '2px dashed #e5e7eb', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
            {preview ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ textAlign: 'center', color: '#9ca3af' }}><ImageIcon size={32} style={{ marginBottom: 8 }} /><div style={{ fontSize: 15 }}>คลิกเพื่ออัปโหลดรูป</div></div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>หัวข้อ <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inp} placeholder="หัวข้อข่าวสาร..." />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>ประเภท</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['news', 'blog'] as const).map(t => (
              <button key={t} onClick={() => setType(t)} style={{ flex: 1, height: 38, borderRadius: 8, border: `1px solid ${type === t ? BTN_PRIMARY : '#e5e7eb'}`, backgroundColor: type === t ? BTN_PRIMARY : '#fff', color: type === t ? '#fff' : '#374151', fontSize: 15, fontFamily: F, cursor: 'pointer' }}>
                {t === 'news' ? 'ข่าวสาร' : 'บทความ'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>สรุปย่อ</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' }} placeholder="สรุปเนื้อหา..." />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>เนื้อหา</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' }} placeholder="เนื้อหาบทความ..." />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Toggle value={isPublished} onChange={setIsPublished} />
          <span style={{ fontSize: 16, color: '#374151' }}>เผยแพร่</span>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F, color: '#374151' }}>ยกเลิก</button>
          <button onClick={handleSubmit} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: BTN_PRIMARY, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>บันทึก</button>
        </div>
      </div>
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
          <button onClick={onClose} style={{ padding: '9px 24px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F }}>ยกเลิก</button>
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
    <button onClick={action} disabled={disabled} style={{ minWidth: 32, height: 32, borderRadius: 6, border: active ? 'none' : '1px solid #e5e7eb', backgroundColor: active ? BTN_PRIMARY : '#fff', color: active ? '#fff' : disabled ? '#d1d5db' : '#374151', fontSize: 15, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
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
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalItem, setModalItem] = useState<Article | null | 'new'>(null)
  const [deleteItem, setDeleteItem] = useState<Article | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-news', page, search],
    queryFn: () => contentService.getNews({ page, page_size: 10, search }),
  })

  const saveMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      if (modalItem && modalItem !== 'new') return contentService.updateNews((modalItem as Article).news_id, fd)
      return contentService.createNews(fd)
    },
    onSuccess: () => { toast.success('บันทึกสำเร็จ'); qc.invalidateQueries({ queryKey: ['admin-news'] }); setModalItem(null) },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ item, val }: { item: Article; val: boolean }) => {
      const fd = new FormData(); fd.append('is_published', String(val))
      return contentService.updateNews(item.news_id, fd)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-news'] }),
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteNews(id),
    onSuccess: () => { toast.success('ลบสำเร็จ'); qc.invalidateQueries({ queryKey: ['admin-news'] }); setDeleteItem(null) },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const articles = data?.data ?? []
  const pagination = data?.pagination

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 15, fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap', fontFamily: F, backgroundColor: '#f9fafb' }
  const tdStyle: React.CSSProperties = { padding: '14px 16px', fontSize: 16, color: '#374151', fontFamily: F, borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }

  const formatDt = (s: string) => { try { return new Date(s).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date(s).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) } catch { return s } }

  return (
    <div style={{ fontFamily: F }}>
      {/* Page title */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20, fontFamily: F }}>ข่าวสารและบทความ</h1>

      {/* Controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="ค้นหาหัวข้อ..."
            style={{ width: '100%', height: 42, paddingLeft: 16, paddingRight: 42, borderRadius: 8, border: 'none', backgroundColor: '#f5f5f5', fontSize: 16, color: '#374151', outline: 'none', boxSizing: 'border-box', fontFamily: F }} />
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
          <Calendar size={16} color="#6b7280" /> เลือกวันที่
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
          <SlidersHorizontal size={16} color="#6b7280" /> ฟิลเตอร์
        </button>
        <div style={{ flex: 1 }} />
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 18px', borderRadius: 8, border: 'none', backgroundColor: '#4b5563', color: '#fff', fontSize: 16, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
          <Plus size={15} /> สร้างแท็ก
        </button>
        <button onClick={() => setModalItem('new')} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 18px', borderRadius: 8, border: 'none', backgroundColor: BTN_PRIMARY, color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
          <Plus size={15} /> สร้างข่าวสารและบทความ
        </button>
      </div>

      {/* Table card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 40 }}>ปักหมุด</th>
                <th style={thStyle}>ข่าวสารและบทความ</th>
                <th style={{ ...thStyle, textAlign: 'center', width: 90 }}>สถานะ</th>
                <th style={thStyle}>แท็กบทความ</th>
                <th style={thStyle}>ผู้สร้าง</th>
                <th style={thStyle}>วันที่</th>
                <th style={{ ...thStyle, textAlign: 'center', width: 80 }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>กำลังโหลด...</td></tr>
              ) : articles.length === 0 ? (
                <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>ไม่พบข้อมูล</td></tr>
              ) : articles.map((item, idx) => (
                <tr key={item.news_id}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <Pin size={15} color={idx === 0 ? '#16a34a' : '#d1d5db'} style={{ cursor: 'pointer' }} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {item.thumbnail_url
                        ? <img src={item.thumbnail_url} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 48, height: 48, borderRadius: 6, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ImageIcon size={18} color="#9ca3af" /></div>
                      }
                      <span style={{ fontWeight: 500, color: '#111827', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Toggle value={item.is_published} onChange={val => toggleMutation.mutate({ item, val })} />
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: '#6b7280', fontSize: 15 }}>
                    {item.article_type === 'news' ? 'ข่าว' : 'บทความ'}
                  </td>
                  <td style={{ ...tdStyle, color: '#374151', fontSize: 15 }}>Admin</td>
                  <td style={{ ...tdStyle, color: '#6b7280', fontSize: 15, whiteSpace: 'nowrap' }}>
                    {formatDt(item.published_at || item.created_at)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <ActionMenu onEdit={() => setModalItem(item)} onDelete={() => setDeleteItem(item)} />
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

      {modalItem !== null && (
        <NewsModal item={modalItem === 'new' ? null : modalItem as Article} onClose={() => setModalItem(null)} onSave={fd => saveMutation.mutate(fd)} />
      )}
      {deleteItem && (
        <ConfirmDelete item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteMutation.mutate(deleteItem.news_id)} loading={deleteMutation.isPending} />
      )}
    </div>
  )
}
