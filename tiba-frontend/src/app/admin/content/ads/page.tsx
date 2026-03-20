'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Search, Calendar, Plus, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'
import type { Ad } from '@/types'

const F = 'var(--font-thai)'

const POSITION_LABELS: Record<string, string> = {
  top: 'ด้านบน', sidebar: 'ด้านข้าง', bottom: 'ด้านล่าง', popup: 'Popup',
}
const POSITION_COLORS: Record<string, { bg: string; color: string }> = {
  top:     { bg: '#dbeafe', color: '#1d4ed8' },
  sidebar: { bg: '#dcfce7', color: '#15803d' },
  bottom:  { bg: '#fef3c7', color: '#b45309' },
  popup:   { bg: '#f3e8ff', color: '#7e22ce' },
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', backgroundColor: value ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

// ─── Action Menu ──────────────────────────────────────────────────────────────
function ActionMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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
        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e6f0', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', minWidth: 130, padding: '4px 0' }}>
          <button onClick={() => { onEdit(); setOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#374151', fontFamily: F }}>แก้ไข</button>
          <button onClick={() => { onDelete(); setOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#ef4444', fontFamily: F }}>ลบ</button>
        </div>
      )}
    </div>
  )
}

// ─── Ad Modal ─────────────────────────────────────────────────────────────────
function AdModal({ item, onClose, onSave }: { item: Ad | null; onClose: () => void; onSave: (fd: FormData) => void }) {
  const isEdit = !!item
  const [linkUrl, setLinkUrl] = useState(item?.link_url ?? '')
  const [position, setPosition] = useState<Ad['position']>(item?.position ?? 'top')
  const [activeFrom, setActiveFrom] = useState(item?.active_from?.slice(0, 10) ?? '')
  const [activeUntil, setActiveUntil] = useState(item?.active_until?.slice(0, 10) ?? '')
  const [isActive, setIsActive] = useState(item?.is_active ?? true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState(item?.image_url ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = () => {
    if (!imageFile && !isEdit) { toast.error('กรุณาอัปโหลดรูปโฆษณา'); return }
    const fd = new FormData()
    fd.append('link_url', linkUrl)
    fd.append('position', position)
    fd.append('active_from', activeFrom)
    fd.append('active_until', activeUntil)
    fd.append('is_active', String(isActive))
    if (imageFile) fd.append('image', imageFile)
    onSave(fd)
  }

  const inputStyle: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e6f0', borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: F, boxSizing: 'border-box', backgroundColor: '#fff' }
  const labelStyle: React.CSSProperties = { fontSize: 15, color: '#374151', fontFamily: F, display: 'block', marginBottom: 4, fontWeight: 500 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 500, maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', fontFamily: F }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{isEdit ? 'แก้ไขโฆษณา' : 'สร้างโฆษณา'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>รูปโฆษณา {!isEdit && <span style={{ color: '#ef4444' }}>*</span>}</label>
          <div onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 180, border: '2px dashed #e5e6f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
            {preview ? (
              <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                <ImageIcon size={32} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 15 }}>คลิกเพื่ออัปโหลดรูปโฆษณา</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>PNG, JPG</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>ตำแหน่งแสดง</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(['top', 'sidebar', 'bottom', 'popup'] as const).map(pos => (
              <button key={pos} onClick={() => setPosition(pos)} style={{
                height: 38, borderRadius: 8, border: `1px solid ${position === pos ? '#132953' : '#e5e6f0'}`,
                backgroundColor: position === pos ? '#132953' : '#fff', color: position === pos ? '#fff' : '#374151',
                fontSize: 15, fontFamily: F, cursor: 'pointer', fontWeight: position === pos ? 600 : 400,
              }}>{POSITION_LABELS[pos]}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Link URL</label>
          <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} style={inputStyle} placeholder="https://..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>วันเริ่ม</label>
            <input type="date" value={activeFrom} onChange={e => setActiveFrom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>วันสิ้นสุด</label>
            <input type="date" value={activeUntil} onChange={e => setActiveUntil(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Toggle value={isActive} onChange={setIsActive} />
          <span style={{ fontSize: 16, color: '#374151' }}>เปิดใช้งาน</span>
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
function ConfirmDeleteModal({ onClose, onConfirm, loading }: { onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 380, padding: '32px 28px', textAlign: 'center', fontFamily: F }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <X size={22} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>ลบโฆษณา</h3>
        <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 24 }}>คุณต้องการลบโฆษณานี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
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
        {pages.map(p => <button key={p} onClick={() => onPageChange(p)} style={{ width: 32, height: 32, borderRadius: 6, border: p === page ? 'none' : '1px solid #e5e6f0', backgroundColor: p === page ? '#132953' : '#fff', color: p === page ? '#fff' : '#374151', fontSize: 15, cursor: 'pointer', fontFamily: F }}>{p}</button>)}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e6f0', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}><ChevronRight size={14} /></button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminAdsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalItem, setModalItem] = useState<Ad | null | 'new'>(null)
  const [deleteItem, setDeleteItem] = useState<Ad | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ads', page, search],
    queryFn: () => contentService.getAds({ page, page_size: 10, search }),
  })

  const saveMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      if (modalItem && modalItem !== 'new') return contentService.updateAd((modalItem as Ad).ad_id, fd)
      return contentService.createAd(fd)
    },
    onSuccess: () => {
      toast.success(modalItem !== 'new' ? 'แก้ไขสำเร็จ' : 'สร้างสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-ads'] })
      setModalItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ item, val }: { item: Ad; val: boolean }) => {
      const fd = new FormData()
      fd.append('is_active', String(val))
      return contentService.updateAd(item.ad_id, fd)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-ads'] }),
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteAd(id),
    onSuccess: () => {
      toast.success('ลบสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-ads'] })
      setDeleteItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const rawData = data as unknown
  const ads: Ad[] = Array.isArray(rawData) ? rawData : ((rawData as { data?: Ad[] })?.data ?? [])
  const pagination = (rawData as { pagination?: { total_pages: number; total_items: number } })?.pagination

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 15, color: '#6b7280', fontWeight: 500, fontFamily: F, borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', whiteSpace: 'nowrap' }
  const tdStyle: React.CSSProperties = { padding: '14px 16px', fontSize: 16, color: '#374151', fontFamily: F, borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }

  const formatDate = (s: string) => { try { return new Date(s).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return s } }

  return (
    <div style={{ fontFamily: F }}>
      {/* 1. Page title */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20, fontFamily: F }}>โฆษณา</h1>

      {/* 2. Controls bar - OUTSIDE the white card */}
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
          <Plus size={16} /> สร้างโฆษณา
        </button>
      </div>

      {/* 3. Table card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 62, textAlign: 'center', color: '#9ca3af', fontFamily: F }}>กำลังโหลด...</div>
        ) : ads.length === 0 ? (
          <div style={{ padding: 62, textAlign: 'center', color: '#9ca3af', fontFamily: F }}>ไม่พบข้อมูล</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>ลำดับ</th>
                  <th style={thStyle}>รูป 1</th>
                  <th style={thStyle}>รูป 2</th>
                  <th style={thStyle}>แบนลิงค์</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>สถานะ</th>
                  <th style={thStyle}>ผู้สร้าง</th>
                  <th style={thStyle}>วันที่</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((item, idx) => {
                  const isFirst = idx === 0
                  return (
                    <tr key={item.ad_id}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* ลำดับ - row 1 gets gold star */}
                      <td style={{ ...tdStyle, width: 60 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {isFirst && <span style={{ fontSize: 16 }}>⭐</span>}
                          <span style={{ color: '#6b7280', fontSize: 15 }}>{idx + 1}</span>
                        </div>
                      </td>

                      {/* รูป 1 — small 48×48 thumb */}
                      <td style={{ ...tdStyle, width: 72 }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt="ad-thumb" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 6, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={16} color="#9ca3af" />
                          </div>
                        )}
                      </td>

                      {/* รูป 2 — wide 80×48 banner */}
                      <td style={{ ...tdStyle, width: 104 }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt="ad-banner" style={{ width: 80, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                        ) : (
                          <div style={{ width: 80, height: 48, borderRadius: 6, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={18} color="#9ca3af" />
                          </div>
                        )}
                      </td>

                      {/* แบนลิงค์ — blue clickable */}
                      <td style={{ ...tdStyle, maxWidth: 200 }}>
                        {item.link_url ? (
                          <a href={item.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, color: '#2563eb', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                            {item.link_url}
                          </a>
                        ) : <span style={{ color: '#9ca3af', fontSize: 15 }}>-</span>}
                      </td>

                      {/* สถานะ Toggle */}
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <Toggle value={item.is_active} onChange={val => toggleMutation.mutate({ item, val })} />
                        </div>
                      </td>

                      {/* ผู้สร้าง */}
                      <td style={{ ...tdStyle, color: '#6b7280', fontSize: 15 }}>Admin</td>

                      {/* วันที่ */}
                      <td style={{ ...tdStyle, color: '#6b7280', fontSize: 15 }}>
                        {formatDate(item.active_from)}
                      </td>

                      {/* การจัดการ */}
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <ActionMenu onEdit={() => setModalItem(item)} onDelete={() => setDeleteItem(item)} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <Pagination page={page} totalPages={pagination.total_pages} totalItems={pagination.total_items} pageSize={10} onPageChange={setPage} />
        )}
      </div>

      {modalItem !== null && (
        <AdModal item={modalItem === 'new' ? null : modalItem as Ad} onClose={() => setModalItem(null)} onSave={fd => saveMutation.mutate(fd)} />
      )}
      {deleteItem && (
        <ConfirmDeleteModal onClose={() => setDeleteItem(null)} onConfirm={() => deleteMutation.mutate(deleteItem.ad_id)} loading={deleteMutation.isPending} />
      )}
    </div>
  )
}
