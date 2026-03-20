'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Search, Calendar, Plus, X, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'
import type { Statistic } from '@/types'

const F = 'var(--font-thai)'

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', backgroundColor: value ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

// ─── Action Menu ──────────────────────────────────────────────────────────────
function ActionMenu({ onEdit, onDelete, pdfUrl }: { onEdit: () => void; onDelete: () => void; pdfUrl?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#6b7280', fontSize: 20, lineHeight: 1 }}>
        ⋮
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e6f0', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', minWidth: 140, padding: '4px 0' }}>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 15, color: '#2563eb', fontFamily: F, textDecoration: 'none' }}>ดูไฟล์ PDF</a>
          )}
          <button onClick={() => { onEdit(); setOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#374151', fontFamily: F }}>แก้ไข</button>
          <button onClick={() => { onDelete(); setOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#ef4444', fontFamily: F }}>ลบ</button>
        </div>
      )}
    </div>
  )
}

// ─── Statistic Modal ──────────────────────────────────────────────────────────
function StatisticModal({ item, onClose, onSave }: { item: Statistic | null; onClose: () => void; onSave: (fd: FormData) => void }) {
  const isEdit = !!item
  const [title, setTitle] = useState(item?.title ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [year, setYear] = useState(item?.published_year ?? new Date().getFullYear() + 543)
  const [isPublished, setIsPublished] = useState(item?.is_published ?? false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setPdfFile(f)
  }

  const handleSubmit = () => {
    if (!title.trim()) { toast.error('กรุณากรอกชื่อเอกสาร'); return }
    const fd = new FormData()
    fd.append('title', title)
    fd.append('description', description)
    fd.append('published_year', String(year))
    fd.append('is_published', String(isPublished))
    if (pdfFile) fd.append('pdf', pdfFile)
    onSave(fd)
  }

  const inputStyle: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e6f0', borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: F, boxSizing: 'border-box', backgroundColor: '#fff' }
  const labelStyle: React.CSSProperties = { fontSize: 15, color: '#374151', fontFamily: F, display: 'block', marginBottom: 4, fontWeight: 500 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 500, padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', fontFamily: F }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{isEdit ? 'แก้ไขสถิติ' : 'สร้างสถิติ'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>ชื่อสถิติ <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="ชื่อสถิติ..." />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>คำอธิบาย</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
            style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' }}
            placeholder="คำอธิบายสั้นๆ..." />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>ปีข้อมูล (พ.ศ.)</label>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} style={inputStyle} min={2500} max={2600} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>ไฟล์ PDF</label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ width: '100%', padding: '18px', border: '2px dashed #e5e6f0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', backgroundColor: '#f9fafb', boxSizing: 'border-box' }}
          >
            <div style={{ width: 40, height: 42, borderRadius: 8, backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={20} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontSize: 16, color: '#374151', fontWeight: 500 }}>{pdfFile ? pdfFile.name : (item?.pdf_url ? 'มีไฟล์แนบอยู่แล้ว — คลิกเพื่อเปลี่ยน' : 'คลิกเพื่ออัปโหลดไฟล์ PDF')}</div>
              <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 2 }}>รองรับไฟล์ PDF ขนาดไม่เกิน 20MB</div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Toggle value={isPublished} onChange={setIsPublished} />
          <span style={{ fontSize: 16, color: '#374151' }}>เผยแพร่</span>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F, color: '#374151' }}>ยกเลิก</button>
          <button onClick={handleSubmit} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: '#132953', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>บันทึก</button>
        </div>
      </div>
    </div>
  )
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({ item, onClose, onConfirm, loading }: { item: Statistic; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 400, padding: '32px 28px', textAlign: 'center', fontFamily: F }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <X size={22} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>ลบสถิติ</h3>
        <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 24 }}>คุณต้องการลบ &quot;{item.title}&quot; หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={onClose} style={{ padding: '9px 24px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F }}>ยกเลิก</button>
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
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 15, color: '#9ca3af', fontFamily: F }}>แสดง {from} ถึง {to} จาก {totalItems} รายการ</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e6f0', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}><ChevronLeft size={14} /></button>
        {pages.map(p => (
          <button key={p} onClick={() => onPageChange(p)} style={{ width: 32, height: 32, borderRadius: 6, border: p === page ? 'none' : '1px solid #e5e6f0', backgroundColor: p === page ? '#132953' : '#fff', color: p === page ? '#fff' : '#374151', fontSize: 15, cursor: 'pointer', fontFamily: F }}>{p}</button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e6f0', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}><ChevronRight size={14} /></button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminStatisticsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalItem, setModalItem] = useState<Statistic | null | 'new'>(null)
  const [deleteItem, setDeleteItem] = useState<Statistic | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-statistics', page, search],
    queryFn: () => contentService.getStatistics({ page, page_size: 10, search }),
  })

  const saveMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      if (modalItem && modalItem !== 'new') return contentService.updateStatistic((modalItem as Statistic).stat_id, fd)
      return contentService.createStatistic(fd)
    },
    onSuccess: () => {
      toast.success(modalItem !== 'new' ? 'แก้ไขสำเร็จ' : 'สร้างสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-statistics'] })
      setModalItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ item, val }: { item: Statistic; val: boolean }) => {
      const fd = new FormData()
      fd.append('is_published', String(val))
      return contentService.updateStatistic(item.stat_id, fd)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-statistics'] }),
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteStatistic(id),
    onSuccess: () => {
      toast.success('ลบสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-statistics'] })
      setDeleteItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const stats = data?.data ?? []
  const pagination = data?.pagination

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 15, color: '#6b7280', fontWeight: 500, fontFamily: F, borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', whiteSpace: 'nowrap' }
  const tdStyle: React.CSSProperties = { padding: '14px 16px', fontSize: 16, color: '#374151', fontFamily: F, borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }

  const formatDate = (s: string) => { try { return new Date(s).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return s } }

  return (
    <div style={{ fontFamily: F }}>
      {/* 1. Page title */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20, fontFamily: F }}>สถิติประกันภัย</h1>

      {/* 2. Controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="ค้นหา..."
            style={{ width: '100%', height: 42, paddingLeft: 16, paddingRight: 42, borderRadius: 8, border: 'none', backgroundColor: '#f5f5f5', fontSize: 16, color: '#374151', outline: 'none', boxSizing: 'border-box', fontFamily: F }}
          />
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
          <Calendar size={16} color="#6b7280" /> เลือกวันที่
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setModalItem('new')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 20px', borderRadius: 8, border: 'none', backgroundColor: '#132953', color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}
        >
          <Plus size={16} /> สร้างสถิติ
        </button>
      </div>

      {/* 3. Table card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 62, textAlign: 'center', color: '#9ca3af', fontFamily: F }}>กำลังโหลด...</div>
        ) : stats.length === 0 ? (
          <div style={{ padding: 62, textAlign: 'center', color: '#9ca3af', fontFamily: F }}>ไม่พบข้อมูล</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 60 }}>ลำดับ</th>
                  <th style={thStyle}>ชื่อสถิติ</th>
                  <th style={{ ...thStyle, textAlign: 'center', width: 100 }}>ปีข้อมูล</th>
                  <th style={{ ...thStyle, width: 120 }}>ประเภท</th>
                  <th style={{ ...thStyle, textAlign: 'center', width: 100 }}>สถานะ</th>
                  <th style={thStyle}>วันที่อัปโหลด</th>
                  <th style={{ ...thStyle, textAlign: 'center', width: 80 }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((item, idx) => (
                  <tr key={item.stat_id}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', fontSize: 15 }}>{(page - 1) * 10 + idx + 1}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 38, borderRadius: 6, backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={16} color="#ef4444" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{item.title}</div>
                          {item.description && <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 1 }}>{item.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>{item.published_year}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 14, fontWeight: 500, fontFamily: F, backgroundColor: '#fee2e2', color: '#b91c1c' }}>PDF</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Toggle value={item.is_published} onChange={val => toggleMutation.mutate({ item, val })} />
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: '#9ca3af', fontSize: 15 }}>{formatDate(item.created_at)}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <ActionMenu onEdit={() => setModalItem(item)} onDelete={() => setDeleteItem(item)} pdfUrl={item.pdf_url} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <Pagination page={page} totalPages={pagination.total_pages} totalItems={pagination.total_items} pageSize={10} onPageChange={setPage} />
        )}
      </div>

      {modalItem !== null && (
        <StatisticModal item={modalItem === 'new' ? null : modalItem as Statistic} onClose={() => setModalItem(null)} onSave={fd => saveMutation.mutate(fd)} />
      )}
      {deleteItem && (
        <ConfirmDeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteMutation.mutate(deleteItem.stat_id)} loading={deleteMutation.isPending} />
      )}
    </div>
  )
}
