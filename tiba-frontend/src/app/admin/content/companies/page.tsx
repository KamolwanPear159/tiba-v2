'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Search, Calendar, Plus, X, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'
import type { Company } from '@/types'

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

// ─── Company Modal ────────────────────────────────────────────────────────────
function CompanyModal({ item, onClose, onSave }: { item: Company | null; onClose: () => void; onSave: (fd: FormData) => void }) {
  const isEdit = !!item
  const [name, setName] = useState(item?.name ?? '')
  const [website, setWebsite] = useState(item?.website_url ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [order, setOrder] = useState(item?.display_order ?? 1)
  const [isActive, setIsActive] = useState(item?.is_active ?? true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState(item?.logo_url ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setLogoFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = () => {
    if (!name.trim()) { toast.error('กรุณากรอกชื่อบริษัท'); return }
    const fd = new FormData()
    fd.append('name', name)
    fd.append('website_url', website)
    fd.append('description', description)
    fd.append('display_order', String(order))
    fd.append('is_active', String(isActive))
    if (logoFile) fd.append('logo', logoFile)
    onSave(fd)
  }

  const inputStyle: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e6f0', borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: F, boxSizing: 'border-box', backgroundColor: '#fff' }
  const labelStyle: React.CSSProperties = { fontSize: 15, color: '#374151', fontFamily: F, display: 'block', marginBottom: 4, fontWeight: 500 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 500, padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', fontFamily: F }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{isEdit ? 'แก้ไขบริษัท' : 'เพิ่มบริษัท'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>โลโก้บริษัท</label>
          <div onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 120, border: '2px dashed #e5e6f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
            {preview ? (
              <img src={preview} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: 14 }} />
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                <Building2 size={28} style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 15 }}>คลิกเพื่ออัปโหลดโลโก้</div>
                <div style={{ fontSize: 13, marginTop: 2 }}>PNG, JPG, SVG</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>ชื่อบริษัท <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="ชื่อบริษัท..." />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Website URL</label>
          <input value={website} onChange={e => setWebsite(e.target.value)} style={inputStyle} placeholder="https://..." />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>คำอธิบาย</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
            style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' }}
            placeholder="คำอธิบายสั้นๆ..." />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>ลำดับการแสดง</label>
          <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} style={inputStyle} min={1} />
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
function ConfirmDeleteModal({ item, onClose, onConfirm, loading }: { item: Company; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 400, padding: '32px 28px', textAlign: 'center', fontFamily: F }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <X size={22} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>ลบบริษัท</h3>
        <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 24 }}>คุณต้องการลบ &quot;{item.name}&quot; หรือไม่?</p>
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
export default function AdminCompaniesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalItem, setModalItem] = useState<Company | null | 'new'>(null)
  const [deleteItem, setDeleteItem] = useState<Company | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-companies', page, search],
    queryFn: () => contentService.getCompanies({ page, page_size: 10, search }),
  })

  const saveMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      if (modalItem && modalItem !== 'new') return contentService.updateCompany((modalItem as Company).company_id, fd)
      return contentService.createCompany(fd)
    },
    onSuccess: () => {
      toast.success(modalItem !== 'new' ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-companies'] })
      setModalItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ item, val }: { item: Company; val: boolean }) => {
      const fd = new FormData()
      fd.append('is_active', String(val))
      return contentService.updateCompany(item.company_id, fd)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-companies'] }),
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteCompany(id),
    onSuccess: () => {
      toast.success('ลบสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-companies'] })
      setDeleteItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const companies = data?.data ?? []
  const pagination = data?.pagination

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 15, color: '#6b7280', fontWeight: 500, fontFamily: F, borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', whiteSpace: 'nowrap' }
  const tdStyle: React.CSSProperties = { padding: '14px 16px', fontSize: 16, color: '#374151', fontFamily: F, borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }

  return (
    <div style={{ fontFamily: F }}>
      {/* 1. Page title */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20, fontFamily: F }}>บริษัทสมาชิก</h1>

      {/* 2. Controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="ค้นหาชื่อบริษัท..."
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
          <Plus size={16} /> เพิ่มบริษัท
        </button>
      </div>

      {/* 3. Table card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 62, textAlign: 'center', color: '#9ca3af', fontFamily: F }}>กำลังโหลด...</div>
        ) : companies.length === 0 ? (
          <div style={{ padding: 62, textAlign: 'center', color: '#9ca3af', fontFamily: F }}>ไม่พบข้อมูล</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 60 }}>ลำดับ</th>
                  <th style={{ ...thStyle, width: 80 }}>โลโก้</th>
                  <th style={thStyle}>ชื่อบริษัท + คำอธิบาย</th>
                  <th style={thStyle}>เว็บไซต์</th>
                  <th style={{ ...thStyle, textAlign: 'center', width: 100 }}>สถานะ</th>
                  <th style={{ ...thStyle, textAlign: 'center', width: 80 }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(item => (
                  <tr key={item.company_id}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', fontSize: 15 }}>{item.display_order}</td>
                    <td style={tdStyle}>
                      {item.logo_url ? (
                        <img src={item.logo_url} alt={item.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6 }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 6, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={16} color="#9ca3af" />
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{item.name}</div>
                      {item.description && <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 2 }}>{item.description}</div>}
                    </td>
                    <td style={tdStyle}>
                      {item.website_url ? (
                        <a href={item.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, color: '#2563eb', textDecoration: 'none' }}>{item.website_url}</a>
                      ) : <span style={{ color: '#9ca3af', fontSize: 15 }}>-</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Toggle value={item.is_active} onChange={val => toggleMutation.mutate({ item, val })} />
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <ActionMenu onEdit={() => setModalItem(item)} onDelete={() => setDeleteItem(item)} />
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
        <CompanyModal item={modalItem === 'new' ? null : modalItem as Company} onClose={() => setModalItem(null)} onSave={fd => saveMutation.mutate(fd)} />
      )}
      {deleteItem && (
        <ConfirmDeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteMutation.mutate(deleteItem.company_id)} loading={deleteMutation.isPending} />
      )}
    </div>
  )
}
