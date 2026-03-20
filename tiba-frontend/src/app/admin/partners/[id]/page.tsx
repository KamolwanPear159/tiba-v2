'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Pencil, Image as ImageIcon, Globe, Handshake } from 'lucide-react'
import toast from 'react-hot-toast'
import { contentService } from '@/lib/api/services/content.service'

const F = 'var(--font-thai)'
const PRIMARY = '#1f4488'

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', backgroundColor: value ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
    >
      <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, paddingBottom: 18, borderBottom: '1px solid #f3f4f6', marginBottom: 16, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 15, color: '#6b7280', fontFamily: F, minWidth: 150, paddingTop: 2 }}>{label}</span>
      <div style={{ flex: 1, fontSize: 16, color: '#111827', fontFamily: F }}>{children}</div>
    </div>
  )
}

export default function PartnerViewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => contentService.getPartners(),
    select: (partners) => partners.find(p => p.partner_id === id) ?? null,
    enabled: !!id,
  })

  const toggleMutation = useMutation({
    mutationFn: (is_active: boolean) => {
      const fd = new FormData()
      fd.append('is_active', String(is_active))
      return contentService.updatePartner(id, fd)
    },
    onSuccess: () => {
      toast.success('อัพเดทสถานะสำเร็จ')
      qc.invalidateQueries({ queryKey: ['partners'] })
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  return (
    <div style={{ fontFamily: F, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.push('/admin/partners')}
            style={{ width: 36, height: 38, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} color="#374151" />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: F, margin: 0 }}>รายละเอียดพาร์ทเนอร์</h1>
        </div>
        {!isLoading && data && (
          <button
            onClick={() => router.push(`/admin/partners/${id}/edit`)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 18px', borderRadius: 8, border: 'none', backgroundColor: PRIMARY, color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: F }}
          >
            <Pencil size={14} /> แก้ไข
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af', fontFamily: F }}>กำลังโหลด...</div>
      ) : !data ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Handshake size={48} color="#d1d5db" style={{ display: 'block', margin: '0 auto 12px' }} />
          <p style={{ color: '#9ca3af', fontFamily: F, fontSize: 16, margin: 0 }}>ไม่พบข้อมูลพาร์ทเนอร์</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '30px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ width: 240, height: 120, borderRadius: 10, backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {data.logo_url
                ? <img src={data.logo_url} alt={data.name} style={{ width: 150, height: 100, objectFit: 'contain' }} />
                : <ImageIcon size={40} color="#d1d5db" />
              }
            </div>
          </div>

          {/* Name */}
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', fontFamily: F, textAlign: 'center', marginBottom: 24, lineHeight: 1.4 }}>
            {data.name}
          </h2>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 22 }}>
            {data.website_url && (
              <FieldRow label="เว็บไซต์">
                <a
                  href={data.website_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: PRIMARY, fontSize: 15, textDecoration: 'none', wordBreak: 'break-all' }}
                >
                  <Globe size={13} /> {data.website_url}
                </a>
              </FieldRow>
            )}

            <FieldRow label="ลำดับการแสดง">
              <span style={{ fontWeight: 500 }}>{data.display_order}</span>
            </FieldRow>

            <FieldRow label="สถานะ">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Toggle
                  value={data.is_active}
                  onChange={val => toggleMutation.mutate(val)}
                />
                <span style={{ fontSize: 15, color: data.is_active ? '#16a34a' : '#6b7280', fontFamily: F, fontWeight: 500 }}>
                  {data.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                </span>
              </div>
            </FieldRow>
          </div>
        </div>
      )}
    </div>
  )
}
