'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Pencil } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'

const FONT = 'var(--font-thai)'

const inputStyle: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e6f0',
  borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: FONT,
  boxSizing: 'border-box', backgroundColor: '#fff',
}

const labelStyle: React.CSSProperties = {
  fontSize: 15, color: '#9ca3af', fontFamily: FONT, display: 'block', marginBottom: 4,
}

const valueStyle: React.CSSProperties = {
  fontSize: 17, color: '#111827', fontFamily: FONT, fontWeight: 500,
}

export default function AdminContactPage() {
  const qc = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    address: '', phone: '', email: '', line_id: '', facebook_url: '', map_embed_url: '',
  })

  const { data: contact, isLoading } = useQuery({
    queryKey: ['admin-contact'],
    queryFn: () => contentService.getContact(),
  })

  useEffect(() => {
    if (contact) {
      setForm({
        address: contact.address ?? '',
        phone: contact.phone ?? '',
        email: contact.email ?? '',
        line_id: contact.line_id ?? '',
        facebook_url: contact.facebook_url ?? '',
        map_embed_url: contact.map_embed_url ?? '',
      })
    }
  }, [contact])

  const saveMutation = useMutation({
    mutationFn: () => contentService.updateContact(form),
    onSuccess: () => {
      toast.success('บันทึกสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-contact'] })
      setIsEditing(false)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid #e5e6f0',
    padding: '24px 28px',
    marginBottom: 20,
  }

  if (isLoading) {
    return <div style={{ padding: 42, textAlign: 'center', color: '#9ca3af', fontFamily: FONT }}>กำลังโหลด...</div>
  }

  return (
    <div style={{ maxWidth: 900, fontFamily: FONT }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', fontFamily: FONT }}>ข้อมูลติดต่อ</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 8, border: 'none', backgroundColor: '#1f4488', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}
          >
            <Pencil size={14} />
            แก้ไข
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setIsEditing(false); if (contact) setForm({ address: contact.address, phone: contact.phone, email: contact.email, line_id: contact.line_id ?? '', facebook_url: contact.facebook_url ?? '', map_embed_url: contact.map_embed_url ?? '' }) }} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: FONT, color: '#374151' }}>ยกเลิก</button>
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', backgroundColor: '#1f4488', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, opacity: saveMutation.isPending ? 0.7 : 1 }}>บันทึก</button>
          </div>
        )}
      </div>

      {/* Main info card */}
      <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 32 }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10 }}>
          <div style={{ width: 90, height: 90, borderRadius: 12, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <span style={{ fontSize: 26 }}>🏛️</span>
          </div>
          <span style={{ fontSize: 13, color: '#9ca3af', fontFamily: FONT, marginTop: 6, textAlign: 'center' }}>สมาคมนายหน้าประกันภัยไทย</span>
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <span style={labelStyle}>ชื่อ</span>
              {isEditing ? (
                <input type="text" value="สมาคมนายหน้าประกันภัยไทย" disabled style={{ ...inputStyle, backgroundColor: '#f9fafb', color: '#9ca3af' }} />
              ) : (
                <span style={valueStyle}>สมาคมนายหน้าประกันภัยไทย</span>
              )}
            </div>
            <div>
              <span style={labelStyle}>อีเมล</span>
              {isEditing ? (
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
              ) : (
                <span style={valueStyle}>{contact?.email || '-'}</span>
              )}
            </div>
            <div>
              <span style={labelStyle}>โทรสาร</span>
              {isEditing ? (
                <input type="text" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={inputStyle} />
              ) : (
                <span style={valueStyle}>{contact?.phone || '-'}</span>
              )}
            </div>
            <div>
              <span style={labelStyle}>โทรศัพท์</span>
              {isEditing ? (
                <input type="text" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={inputStyle} />
              ) : (
                <span style={valueStyle}>{contact?.phone || '-'}</span>
              )}
            </div>
          </div>
          <div>
            <span style={labelStyle}>ที่อยู่</span>
            {isEditing ? (
              <textarea
                value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                rows={2}
                style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' }}
              />
            ) : (
              <span style={valueStyle}>{contact?.address || '-'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={cardStyle}>
        {isEditing ? (
          <div>
            <label style={{ ...labelStyle, fontSize: 16, color: '#374151', fontWeight: 500, marginBottom: 8 }}>Google Maps Embed URL</label>
            <input
              type="text"
              value={form.map_embed_url}
              onChange={e => setForm(p => ({ ...p, map_embed_url: e.target.value }))}
              placeholder="https://www.google.com/maps/embed?..."
              style={inputStyle}
            />
          </div>
        ) : contact?.map_embed_url ? (
          <iframe
            src={contact.map_embed_url}
            width="100%" height="300" style={{ border: 0, borderRadius: 10 }}
            allowFullScreen loading="lazy"
          />
        ) : (
          <div style={{ height: 300, backgroundColor: '#f3f6fb', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#9ca3af', fontSize: 16, fontFamily: FONT }}>ไม่มีแผนที่ — กรอก Google Maps Embed URL ในโหมดแก้ไข</span>
          </div>
        )}
      </div>

      {/* Social links */}
      <div style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <div>
            <span style={labelStyle}>LINE</span>
            {isEditing ? (
              <input type="text" value={form.line_id} onChange={e => setForm(p => ({ ...p, line_id: e.target.value }))} placeholder="@line_id หรือ URL" style={inputStyle} />
            ) : (
              <span style={{ ...valueStyle, fontSize: 16, color: '#1f4488' }}>{contact?.line_id || '-'}</span>
            )}
          </div>
          <div>
            <span style={labelStyle}>Facebook</span>
            {isEditing ? (
              <input type="url" value={form.facebook_url} onChange={e => setForm(p => ({ ...p, facebook_url: e.target.value }))} placeholder="https://facebook.com/..." style={inputStyle} />
            ) : (
              <span style={{ ...valueStyle, fontSize: 16, color: '#1f4488' }}>{contact?.facebook_url || '-'}</span>
            )}
          </div>
          <div>
            <span style={labelStyle}>Instagram</span>
            {isEditing ? (
              <input type="url" value="" onChange={() => {}} placeholder="https://instagram.com/..." style={inputStyle} />
            ) : (
              <span style={{ ...valueStyle, fontSize: 16, color: '#1f4488' }}>-</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
