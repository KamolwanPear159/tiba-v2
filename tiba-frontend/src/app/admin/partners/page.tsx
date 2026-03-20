'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Search, Plus, Handshake, Image as ImageIcon, Pencil, Trash2, Globe } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'
import type { Partner } from '@/types'

const F = 'var(--font-thai)'
const PRIMARY = '#1f4488'

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', backgroundColor: value ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: value ? 20 : 2, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────
function ConfirmDelete({ item, onClose, onConfirm, loading }: { item: Partner; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 400, padding: '32px 28px', textAlign: 'center', fontFamily: F }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>ลบพาร์ทเนอร์</h3>
        <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 24 }}>คุณต้องการลบ &quot;{item.name}&quot; หรือไม่?</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={onClose} style={{ padding: '9px 24px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F, color: '#374151' }}>ยกเลิก</button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: '9px 24px', borderRadius: 8, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F, opacity: loading ? 0.7 : 1 }}>ลบ</button>
        </div>
      </div>
    </div>
  )
}

// ─── Partner Card ─────────────────────────────────────────────────────────────
function PartnerCard({ partner, onEdit, onDelete, onToggle }: { partner: Partner; onEdit: () => void; onDelete: () => void; onToggle: (val: boolean) => void }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, borderRadius: 8, backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        {partner.logo_url
          ? <img src={partner.logo_url} alt={partner.name} style={{ maxWidth: '100%', maxHeight: 60, objectFit: 'contain' }} />
          : <ImageIcon size={32} color="#d1d5db" />
        }
      </div>

      {/* Name */}
      <div>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', fontFamily: F, margin: '0 0 4px' }}>{partner.name}</p>
        {partner.website_url && (
          <a href={partner.website_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, color: PRIMARY, textDecoration: 'none', fontFamily: F }}>
            <Globe size={11} /> {partner.website_url.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Toggle value={partner.is_active} onChange={onToggle} />
          <span style={{ fontSize: 14, color: '#6b7280', fontFamily: F }}>{partner.is_active ? 'ใช้งาน' : 'ปิด'}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={onEdit}
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Pencil size={13} color="#6b7280" />
          </button>
          <button
            onClick={onDelete}
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #fee2e2', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Trash2 size={13} color="#ef4444" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPartnersPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [deleteItem, setDeleteItem] = useState<Partner | null>(null)

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => contentService.getPartners(),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const fd = new FormData()
      fd.append('is_active', String(is_active))
      return contentService.updatePartner(id, fd)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partners'] }),
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deletePartner(id),
    onSuccess: () => {
      toast.success('ลบพาร์ทเนอร์สำเร็จ')
      qc.invalidateQueries({ queryKey: ['partners'] })
      setDeleteItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const filtered = partners.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: F }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20, fontFamily: F }}>พาร์ทเนอร์</h1>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาพาร์ทเนอร์..."
            style={{ width: '100%', height: 42, paddingLeft: 16, paddingRight: 42, borderRadius: 8, border: 'none', backgroundColor: '#f5f5f5', fontSize: 16, color: '#374151', outline: 'none', boxSizing: 'border-box', fontFamily: F }}
          />
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => router.push('/admin/partners/create')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 18px', borderRadius: 8, border: 'none', backgroundColor: PRIMARY, color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}
        >
          <Plus size={15} /> สร้างพาร์ทเนอร์
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af', fontFamily: F }}>กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#9ca3af' }}>
            <Handshake size={48} strokeWidth={1.2} />
            <span style={{ fontFamily: F, fontSize: 16 }}>{search ? 'ไม่พบพาร์ทเนอร์ที่ค้นหา' : 'ยังไม่มีพาร์ทเนอร์'}</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {filtered.map(partner => (
            <PartnerCard
              key={partner.partner_id}
              partner={partner}
              onEdit={() => router.push(`/admin/partners/${partner.partner_id}/edit`)}
              onDelete={() => setDeleteItem(partner)}
              onToggle={val => toggleMutation.mutate({ id: partner.partner_id, is_active: val })}
            />
          ))}
        </div>
      )}

      {deleteItem && (
        <ConfirmDelete
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => deleteMutation.mutate(deleteItem.partner_id)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
