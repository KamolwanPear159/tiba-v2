'use client'

import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Plus, X, Pencil, Trash2, User } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'
import type { Executive } from '@/types'

const F = 'var(--font-thai)'

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', backgroundColor: value ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

// ─── Executive Modal ──────────────────────────────────────────────────────────
function ExecutiveModal({ item, onClose, onSave }: { item: Executive | null; onClose: () => void; onSave: (fd: FormData) => void }) {
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

  const inputStyle: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e6f0', borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: F, boxSizing: 'border-box', backgroundColor: '#fff' }
  const labelStyle: React.CSSProperties = { fontSize: 15, color: '#374151', fontFamily: F, display: 'block', marginBottom: 4, fontWeight: 500 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 480, padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', fontFamily: F }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{isEdit ? 'แก้ไขกรรมการ' : 'เพิ่มกรรมการ'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e5e6f0' }}
          >
            {preview ? (
              <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={40} color="#9ca3af" />
            )}
          </div>
          <button onClick={() => fileRef.current?.click()} style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#132953', fontFamily: F }}>อัปโหลดรูปถ่าย</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>ชื่อ-นามสกุล <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="ชื่อ-นามสกุล..." />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>ตำแหน่ง <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={position} onChange={e => setPosition(e.target.value)} style={inputStyle} placeholder="ตำแหน่ง..." />
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
function ConfirmDeleteModal({ item, onClose, onConfirm, loading }: { item: Executive; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 400, padding: '32px 28px', textAlign: 'center', fontFamily: F }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <X size={22} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>ลบกรรมการ</h3>
        <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 24 }}>คุณต้องการลบ &quot;{item.full_name}&quot; หรือไม่?</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={onClose} style={{ padding: '9px 24px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F }}>ยกเลิก</button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: '9px 24px', borderRadius: 8, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F, opacity: loading ? 0.7 : 1 }}>ลบ</button>
        </div>
      </div>
    </div>
  )
}

// ─── Executive Card ───────────────────────────────────────────────────────────
function ExecutiveCard({ exec, onEdit, onDelete }: { exec: Executive; onEdit: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', backgroundColor: '#fff', borderRadius: 12,
        border: '1px solid #f3f4f6', overflow: 'hidden',
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Photo — full card width, 200px tall */}
      <div style={{ width: '100%', height: 200, backgroundColor: '#f3f4f6', overflow: 'hidden', position: 'relative' }}>
        {exec.photo_url ? (
          <img src={exec.photo_url} alt={exec.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={56} color="#9ca3af" />
          </div>
        )}
        {/* Hover action buttons */}
        {hovered && (
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
            <button onClick={onEdit} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', backgroundColor: 'rgba(255,255,255,0.92)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
              <Pencil size={13} color="#374151" />
            </button>
            <button onClick={onDelete} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', backgroundColor: 'rgba(255,255,255,0.92)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
              <Trash2 size={13} color="#ef4444" />
            </button>
          </div>
        )}
        {/* Inactive dot */}
        {!exec.is_active && (
          <div style={{ position: 'absolute', top: 8, left: 8, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#d1d5db' }} title="ไม่ใช้งาน" />
        )}
      </div>

      {/* Name + position */}
      <div style={{ padding: '12px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', fontFamily: F, marginBottom: 4 }}>{exec.full_name}</div>
        <div style={{ fontSize: 14, color: '#6b7280', fontFamily: F }}>{exec.position_title}</div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminExecutivesPage() {
  const qc = useQueryClient()
  const [modalItem, setModalItem] = useState<Executive | null | 'new'>(null)
  const [deleteItem, setDeleteItem] = useState<Executive | null>(null)

  const { data: execsRaw, isLoading } = useQuery({
    queryKey: ['admin-executives'],
    queryFn: () => contentService.getExecutives(),
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const execs: Executive[] = Array.isArray(execsRaw) ? execsRaw : ((execsRaw as any)?.data ?? [])

  const saveMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      if (modalItem && modalItem !== 'new') return contentService.updateExecutive((modalItem as Executive).executive_id, fd)
      return contentService.createExecutive(fd)
    },
    onSuccess: () => {
      toast.success(modalItem !== 'new' ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-executives'] })
      setModalItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteExecutive(id),
    onSuccess: () => {
      toast.success('ลบสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-executives'] })
      setDeleteItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const sorted = [...execs].sort((a, b) => a.display_order - b.display_order)

  return (
    <div style={{ fontFamily: F }}>
      {/* 1. Page title */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20, fontFamily: F }}>กรรมการบริหาร</h1>

      {/* 2. Controls bar — no search, just edit button top right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button
          onClick={() => setModalItem('new')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 20px', borderRadius: 8, border: 'none', backgroundColor: '#132953', color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}
        >
          <Plus size={16} /> แก้ไขกรรมการบริหาร
        </button>
      </div>

      {/* 3. Card grid — 4 columns */}
      {isLoading ? (
        <div style={{ padding: 62, textAlign: 'center', color: '#9ca3af', fontFamily: F }}>กำลังโหลด...</div>
      ) : sorted.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 62, textAlign: 'center', color: '#9ca3af', fontFamily: F }}>
          <User size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
          <div>ยังไม่มีข้อมูลกรรมการ</div>
          <button onClick={() => setModalItem('new')} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, border: 'none', backgroundColor: '#132953', color: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F }}>+ เพิ่มกรรมการ</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {sorted.map(exec => (
            <ExecutiveCard
              key={exec.executive_id}
              exec={exec}
              onEdit={() => setModalItem(exec)}
              onDelete={() => setDeleteItem(exec)}
            />
          ))}
        </div>
      )}

      {modalItem !== null && (
        <ExecutiveModal
          item={modalItem === 'new' ? null : modalItem as Executive}
          onClose={() => setModalItem(null)}
          onSave={fd => saveMutation.mutate(fd)}
        />
      )}

      {deleteItem && (
        <ConfirmDeleteModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => deleteMutation.mutate(deleteItem.executive_id)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
