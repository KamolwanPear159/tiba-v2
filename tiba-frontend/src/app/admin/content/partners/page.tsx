'use client'

import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Search, Calendar, Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'
import type { Partner } from '@/types'

const F = 'var(--font-thai)'

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        backgroundColor: checked ? '#1f6b36' : '#d1d5db',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: checked ? 22 : 3,
        width: 18, height: 18,
        borderRadius: '50%', backgroundColor: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </button>
  )
}

// ─── Action Dropdown ─────────────────────────────────────────────────────────
function ActionMenu({ partner, onEdit, onDelete }: {
  partner: Partner
  onEdit: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const itemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
    fontSize: 16, cursor: 'pointer', background: 'none', border: 'none',
    width: '100%', textAlign: 'left', fontFamily: F, color: '#374151',
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#6b7280', fontSize: 20, lineHeight: 1 }}
      >
        ⋮
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, backgroundColor: '#fff', border: '1px solid #e5e6f0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 100, minWidth: 140, overflow: 'hidden' }}>
          <button style={itemStyle} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9fafb')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')} onClick={() => { onEdit(); setOpen(false) }}>
            <Eye size={14} color="#1f4488" /><span style={{ color: '#1f4488' }}>ดูรายการ</span>
          </button>
          <button style={itemStyle} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9fafb')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')} onClick={() => { onEdit(); setOpen(false) }}>
            <Pencil size={14} color="#374151" /><span>แก้ไข</span>
          </button>
          <button style={{ ...itemStyle, color: '#dc2626' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff1f2')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')} onClick={() => { onDelete(); setOpen(false) }}>
            <Trash2 size={14} color="#dc2626" /><span style={{ color: '#dc2626' }}>ลบ</span>
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────
function PartnerModal({ item, onClose }: { item: Partner | null; onClose: () => void }) {
  const qc = useQueryClient()
  const [name, setName] = useState(item?.name ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(item?.website_url ?? '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(item?.logo_url ?? null)
  const [isActive, setIsActive] = useState(item?.is_active ?? true)
  const fileRef = useRef<HTMLInputElement>(null)

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('name', name)
      if (websiteUrl) fd.append('website_url', websiteUrl)
      fd.append('is_active', String(isActive))
      fd.append('display_order', String(item?.display_order ?? 1))
      if (logoFile) fd.append('logo', logoFile)
      return item
        ? contentService.updatePartner(item.partner_id, fd)
        : contentService.createPartner(fd)
    },
    onSuccess: () => {
      toast.success(item ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-partners'] })
      onClose()
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e6f0',
    borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: F, boxSizing: 'border-box',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '28px 32px', width: 560, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', fontFamily: F, margin: 0 }}>
            {item ? 'แก้ไขผู้สนับสนุน' : 'สร้างผู้สนับสนุน'}
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F, color: '#374151' }}>ยกเลิก</button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', backgroundColor: '#132953', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F, opacity: mutation.isPending ? 0.7 : 1 }}>บันทึก</button>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#374151', fontFamily: F, marginBottom: 8 }}>รูป</p>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ width: '100%', height: 180, borderRadius: 12, border: '2px dashed #c7d2e0', backgroundColor: '#f3f6fb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}
          >
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            ) : (
              <>
                <div style={{ width: 40, height: 42, borderRadius: '50%', backgroundColor: '#132953', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Plus size={22} color="#fff" />
                </div>
                <span style={{ fontSize: 16, color: '#6b7280', fontFamily: F }}>อัปโหลดรูปภาพ</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
            const f = e.target.files?.[0]
            if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) }
          }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 16, fontWeight: 500, color: '#374151', fontFamily: F, display: 'block', marginBottom: 6 }}>รายละเอียด</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="ระบุ" style={inputStyle} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 16, fontWeight: 500, color: '#374151', fontFamily: F, display: 'block', marginBottom: 6 }}>เว็บไซต์</label>
          <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://" style={inputStyle} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: 16, fontWeight: 500, color: '#374151', fontFamily: F }}>สถานะ</label>
          <Toggle checked={isActive} onChange={setIsActive} />
        </div>
      </div>
    </div>
  )
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────
function ConfirmDeleteModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '28px 32px', width: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', fontFamily: F, marginBottom: 8 }}>ลบผู้สนับสนุน</h3>
        <p style={{ fontSize: 16, color: '#6b7280', fontFamily: F, marginBottom: 24 }}>คุณต้องการลบ &ldquo;{name}&rdquo; หรือไม่?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F }}>ยกเลิก</button>
          <button onClick={onConfirm} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', backgroundColor: '#dc2626', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>ลบ</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPartnersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalItem, setModalItem] = useState<Partner | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null)

  const { data: partnersRaw, isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: () => contentService.getPartners(),
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const partners: Partner[] = Array.isArray(partnersRaw) ? partnersRaw : ((partnersRaw as any)?.data ?? [])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deletePartner(id),
    onSuccess: () => {
      toast.success('ลบสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-partners'] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ partner, is_active }: { partner: Partner; is_active: boolean }) => {
      const fd = new FormData()
      fd.append('name', partner.name)
      fd.append('is_active', String(is_active))
      fd.append('display_order', String(partner.display_order))
      return contentService.updatePartner(partner.partner_id, fd)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-partners'] }),
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const filtered = partners.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  const thStyle: React.CSSProperties = {
    padding: '12px 16px', textAlign: 'left', fontSize: 15, fontWeight: 600,
    color: '#6b7280', backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6',
    fontFamily: F, whiteSpace: 'nowrap',
  }
  const tdStyle: React.CSSProperties = {
    padding: '14px 16px', fontSize: 16, color: '#374151',
    borderBottom: '1px solid #f3f4f6', fontFamily: F, verticalAlign: 'middle',
  }

  return (
    <>
      <div style={{ fontFamily: F }}>
        {/* 1. Page title */}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20, fontFamily: F }}>ผู้สนับสนุน</h1>

        {/* 2. Controls bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ..."
              style={{ width: '100%', height: 42, paddingLeft: 16, paddingRight: 42, borderRadius: 8, border: 'none', backgroundColor: '#f5f5f5', fontSize: 16, color: '#374151', outline: 'none', boxSizing: 'border-box', fontFamily: F }}
            />
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
            <Calendar size={16} color="#6b7280" /> เลือกวันที่
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={() => setModalItem(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 20px', borderRadius: 8, border: 'none', backgroundColor: '#132953', color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}
          >
            <Plus size={16} /> สร้างผู้สนับสนุน
          </button>
        </div>

        {/* 3. Table card */}
        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 44 }}>ปักหมุด</th>
                  <th style={{ ...thStyle, width: 64 }}>โลโก้</th>
                  <th style={thStyle}>ชื่อ + เว็บไซต์</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>สถานะ</th>
                  <th style={thStyle}>ผู้สร้าง</th>
                  <th style={thStyle}>วันที่</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '50px', color: '#9ca3af' }}>กำลังโหลด...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '50px', color: '#9ca3af' }}>ไม่พบข้อมูล</td></tr>
                ) : filtered.map(partner => (
                  <tr key={partner.partner_id}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* ปักหมุด */}
                    <td style={{ ...tdStyle, color: '#d1d5db', paddingLeft: 18, textAlign: 'center' }}>
                      <span style={{ fontSize: 18 }}>📌</span>
                    </td>

                    {/* โลโก้ */}
                    <td style={tdStyle}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {partner.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={partner.logo_url} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: 13, color: '#9ca3af', fontFamily: F }}>-</span>
                        )}
                      </div>
                    </td>

                    {/* ชื่อ + เว็บไซต์ */}
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 500 }}>{partner.name}</span>
                      {partner.website_url && (
                        <a href={partner.website_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 14, color: '#2563eb', textDecoration: 'none', marginTop: 2 }}>
                          {partner.website_url}
                        </a>
                      )}
                    </td>

                    {/* สถานะ */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <Toggle
                        checked={partner.is_active}
                        onChange={v => toggleMutation.mutate({ partner, is_active: v })}
                      />
                    </td>

                    {/* ผู้สร้าง */}
                    <td style={tdStyle}><span style={{ color: '#6b7280', fontSize: 15 }}>Admin</span></td>

                    {/* วันที่ */}
                    <td style={tdStyle}><span style={{ color: '#6b7280', fontSize: 15 }}>-</span></td>

                    {/* การจัดการ */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <ActionMenu
                        partner={partner}
                        onEdit={() => setModalItem(partner)}
                        onDelete={() => setDeleteTarget(partner)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && filtered.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 15, color: '#6b7280', fontFamily: F }}>
                แสดง 1 ถึง {filtered.length} จาก {filtered.length} รายการ
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #e5e6f0', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }} disabled>←</button>
                <button style={{ width: 30, height: 30, borderRadius: 6, border: 'none', backgroundColor: '#132953', color: '#fff', cursor: 'pointer', fontFamily: F, fontSize: 15 }}>1</button>
                <button style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #e5e6f0', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }} disabled>→</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalItem !== undefined && (
        <PartnerModal item={modalItem} onClose={() => setModalItem(undefined)} />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          name={deleteTarget.name}
          onConfirm={() => deleteMutation.mutate(deleteTarget.partner_id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
