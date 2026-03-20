'use client'

import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Search, Plus, X, User } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'
import type { Executive } from '@/types'

const F = 'var(--font-thai)'
const PRIMARY = '#1f4488'

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={e => { e.stopPropagation(); onChange(!value) }}
      style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', backgroundColor: value ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
    >
      <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

// ─── Avatar initials ──────────────────────────────────────────────────────────
function AvatarInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
      <span style={{ fontSize: 26, fontWeight: 700, color: PRIMARY, fontFamily: F }}>{initials || '?'}</span>
    </div>
  )
}

// ─── Executive Modal ──────────────────────────────────────────────────────────
function ExecutiveModal({
  item,
  onClose,
  onSave,
  isSaving,
}: {
  item: Executive | null
  onClose: () => void
  onSave: (fd: FormData) => void
  isSaving: boolean
}) {
  const isEdit = !!item
  const [name, setName] = useState(item?.full_name ?? '')
  const [position, setPosition] = useState(item?.position_title ?? '')
  const [order, setOrder] = useState(item?.display_order ?? 1)
  const [isActive, setIsActive] = useState(item?.is_active ?? true)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState(item?.photo_url ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setPhotoFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = () => {
    if (!name.trim()) { toast.error('กรุณากรอกชื่อ'); return }
    if (!position.trim()) { toast.error('กรุณากรอกตำแหน่ง'); return }
    const fd = new FormData()
    fd.append('full_name', name)
    fd.append('position_title', position)
    fd.append('display_order', String(order))
    fd.append('is_active', String(isActive))
    if (photoFile) fd.append('photo', photoFile)
    onSave(fd)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 42, padding: '0 14px',
    border: '1px solid #e5e6f0', borderRadius: 8,
    fontSize: 16, color: '#374151', outline: 'none',
    fontFamily: F, boxSizing: 'border-box', backgroundColor: '#fff',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 15, color: '#374151', fontFamily: F,
    display: 'block', marginBottom: 4, fontWeight: 500,
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 480, padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', fontFamily: F }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
            {isEdit ? 'แก้ไขกรรมการ' : 'เพิ่มกรรมการ'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Photo upload */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e5e6f0' }}
          >
            {preview
              ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <User size={40} color="#9ca3af" />
            }
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: PRIMARY, fontFamily: F }}
          >
            อัปโหลดรูปถ่าย
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>ชื่อ-นามสกุล <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="ชื่อ-นามสกุล..." />
        </div>

        {/* Position */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>ตำแหน่ง <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={position} onChange={e => setPosition(e.target.value)} style={inputStyle} placeholder="ตำแหน่ง..." />
        </div>

        {/* Display order */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>ลำดับการแสดง</label>
          <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} style={inputStyle} min={1} />
        </div>

        {/* Active toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Toggle value={isActive} onChange={setIsActive} />
          <span style={{ fontSize: 16, color: '#374151', fontFamily: F }}>เปิดใช้งาน</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F, color: '#374151' }}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: PRIMARY, color: '#fff', fontSize: 16, fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', fontFamily: F, opacity: isSaving ? 0.7 : 1 }}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Executive Card ───────────────────────────────────────────────────────────
function ExecutiveCard({
  exec,
  onCardClick,
  onToggle,
}: {
  exec: Executive
  onCardClick: () => void
  onToggle: (val: boolean) => void
}) {
  return (
    <div
      onClick={onCardClick}
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        padding: 18,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        transition: 'box-shadow 0.15s',
      }}
    >
      {/* Photo */}
      <div style={{ marginBottom: 4 }}>
        {exec.photo_url
          ? <img src={exec.photo_url} alt={exec.full_name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
          : <AvatarInitials name={exec.full_name} />
        }
      </div>

      {/* Name */}
      <div style={{ fontWeight: 600, fontSize: 16, color: '#111827', textAlign: 'center', fontFamily: F, lineHeight: 1.4 }}>
        {exec.full_name}
      </div>

      {/* Position */}
      <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', fontFamily: F }}>
        {exec.position_title}
      </div>

      {/* Toggle */}
      <div style={{ marginTop: 4 }} onClick={e => e.stopPropagation()}>
        <Toggle value={exec.is_active} onChange={onToggle} />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminExecutivesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalItem, setModalItem] = useState<Executive | null | 'new'>(null)

  const { data: execsRaw, isLoading } = useQuery({
    queryKey: ['executives'],
    queryFn: () => contentService.getExecutives(),
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const execs: Executive[] = Array.isArray(execsRaw) ? execsRaw : ((execsRaw as any)?.data ?? [])

  const saveMutation = useMutation({
    mutationFn: (fd: FormData) => {
      if (modalItem && modalItem !== 'new') {
        return contentService.updateExecutive((modalItem as Executive).executive_id, fd)
      }
      return contentService.createExecutive(fd)
    },
    onSuccess: () => {
      toast.success(modalItem !== 'new' ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ')
      qc.invalidateQueries({ queryKey: ['executives'] })
      setModalItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => {
      const fd = new FormData()
      fd.append('is_active', String(is_active))
      return contentService.updateExecutive(id, fd)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['executives'] }),
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const sorted = [...execs]
    .sort((a, b) => a.display_order - b.display_order)
    .filter(e => !search || e.full_name.toLowerCase().includes(search.toLowerCase()) || e.position_title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ fontFamily: F }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, fontFamily: F }}>คณะกรรมการบริหาร</h1>
        <button
          onClick={() => setModalItem('new')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 20px', borderRadius: 8, border: `1.5px solid ${PRIMARY}`, backgroundColor: '#fff', color: PRIMARY, fontSize: 16, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}
        >
          <Plus size={15} /> แก้ไขกรรมการบริหาร
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 340, marginBottom: 24 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหากรรมการ..."
          style={{ width: '100%', height: 42, paddingLeft: 16, paddingRight: 42, borderRadius: 8, border: 'none', backgroundColor: '#f3f4f6', fontSize: 16, color: '#374151', outline: 'none', boxSizing: 'border-box', fontFamily: F }}
        />
        <Search size={16} color="#9ca3af" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af', fontFamily: F }}>กำลังโหลด...</div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <User size={48} color="#d1d5db" style={{ display: 'block', margin: '0 auto 12px' }} />
          <p style={{ color: '#9ca3af', fontFamily: F, fontSize: 16, margin: 0 }}>ไม่พบข้อมูล</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {sorted.map(exec => (
            <ExecutiveCard
              key={exec.executive_id}
              exec={exec}
              onCardClick={() => setModalItem(exec)}
              onToggle={val => toggleMutation.mutate({ id: exec.executive_id, is_active: val })}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalItem !== null && (
        <ExecutiveModal
          item={modalItem === 'new' ? null : (modalItem as Executive)}
          onClose={() => setModalItem(null)}
          onSave={fd => saveMutation.mutate(fd)}
          isSaving={saveMutation.isPending}
        />
      )}
    </div>
  )
}
