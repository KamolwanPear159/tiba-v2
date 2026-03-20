'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Pencil, X, CheckCircle, Phone, Mail, MapPin, MessageCircle, Facebook, Map } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'
import type { ContactInfo } from '@/types'

const F = 'var(--font-thai)'
const PRIMARY = '#1f4488'

export default function AdminContactSettingPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState<Partial<ContactInfo>>({
    address: '',
    phone: '',
    email: '',
    line_id: '',
    facebook_url: '',
    map_embed_url: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['contact'],
    queryFn: () => contentService.getContact(),
  })

  useEffect(() => {
    if (data) {
      setForm({
        address: data.address ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        line_id: data.line_id ?? '',
        facebook_url: data.facebook_url ?? '',
        map_embed_url: data.map_embed_url ?? '',
      })
    }
  }, [data])

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<ContactInfo>) => contentService.updateContact(payload),
    onSuccess: () => {
      toast.success('บันทึกข้อมูลสำเร็จ')
      qc.invalidateQueries({ queryKey: ['contact'] })
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const handleCancel = () => {
    if (data) {
      setForm({
        address: data.address ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        line_id: data.line_id ?? '',
        facebook_url: data.facebook_url ?? '',
        map_embed_url: data.map_embed_url ?? '',
      })
    }
    setEditing(false)
  }

  const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: F, boxSizing: 'border-box', backgroundColor: '#fff' }

  const fields: { key: keyof ContactInfo; label: string; icon: React.ReactNode; placeholder?: string; multiline?: boolean }[] = [
    { key: 'address', label: 'ที่อยู่', icon: <MapPin size={16} color="#6b7280" />, placeholder: 'ที่อยู่สำนักงาน...', multiline: true },
    { key: 'phone', label: 'เบอร์โทรศัพท์', icon: <Phone size={16} color="#6b7280" />, placeholder: '0x-xxxx-xxxx' },
    { key: 'email', label: 'อีเมล', icon: <Mail size={16} color="#6b7280" />, placeholder: 'contact@example.com' },
    { key: 'line_id', label: 'Line ID', icon: <MessageCircle size={16} color="#6b7280" />, placeholder: '@line_id' },
    { key: 'facebook_url', label: 'Facebook URL', icon: <Facebook size={16} color="#6b7280" />, placeholder: 'https://facebook.com/...' },
    { key: 'map_embed_url', label: 'Google Maps Embed URL', icon: <Map size={16} color="#6b7280" />, placeholder: 'https://maps.google.com/embed?...' },
  ]

  return (
    <div style={{ fontFamily: F, maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', fontFamily: F, margin: 0 }}>ติดต่อเรา</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 18px', borderRadius: 8, border: 'none', backgroundColor: PRIMARY, color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: F }}
          >
            <Pencil size={14} /> แก้ไข
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleCancel}
              style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 18px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F, color: '#374151' }}
            >
              <X size={14} /> ยกเลิก
            </button>
            <button
              onClick={() => updateMutation.mutate(form)}
              disabled={updateMutation.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 18px', borderRadius: 8, border: 'none', backgroundColor: PRIMARY, color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: F, opacity: updateMutation.isPending ? 0.7 : 1 }}
            >
              {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        )}
      </div>

      {/* Success message */}
      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', backgroundColor: '#dcfce7', borderRadius: 8, marginBottom: 16, color: '#16a34a', fontFamily: F, fontSize: 16 }}>
          <CheckCircle size={16} />
          บันทึกข้อมูลติดต่อสำเร็จ
        </div>
      )}

      {/* Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '30px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontFamily: F }}>กำลังโหลด...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {fields.map(({ key, label, icon, placeholder, multiline }) => (
              <div key={key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  {icon}
                  <label style={{ fontSize: 15, color: '#374151', fontFamily: F, fontWeight: 500 }}>{label}</label>
                </div>
                {editing ? (
                  multiline ? (
                    <textarea
                      value={(form[key] as string) ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      rows={3}
                      placeholder={placeholder}
                      style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      value={(form[key] as string) ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      style={inp}
                      placeholder={placeholder}
                    />
                  )
                ) : (
                  <div style={{ fontSize: 16, color: (data?.[key] as string) ? '#111827' : '#9ca3af', fontFamily: F, padding: '10px 12px', backgroundColor: '#f9fafb', borderRadius: 8, minHeight: 40, display: 'flex', alignItems: multiline ? 'flex-start' : 'center', wordBreak: 'break-all', whiteSpace: multiline ? 'pre-wrap' : undefined }}>
                    {(data?.[key] as string) || `ยังไม่ได้ตั้งค่า${label}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map preview */}
      {!editing && data?.map_embed_url && (
        <div style={{ marginTop: 20, borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', height: 300 }}>
          <iframe
            src={data.map_embed_url}
            width="100%"
            height="300"
            style={{ border: 'none', display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="แผนที่"
          />
        </div>
      )}
    </div>
  )
}
