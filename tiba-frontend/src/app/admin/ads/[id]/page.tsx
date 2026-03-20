'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Pencil, Image as ImageIcon, ExternalLink, Calendar } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'

const F = 'var(--font-thai)'
const PRIMARY = '#1f4488'

const POSITION_LABEL: Record<string, string> = {
  top: 'ด้านบน',
  sidebar: 'แถบข้าง',
  bottom: 'ด้านล่าง',
  popup: 'ป๊อปอัพ',
}
const POSITION_COLOR: Record<string, { bg: string; color: string }> = {
  top: { bg: '#dbeafe', color: '#1d4ed8' },
  sidebar: { bg: '#dcfce7', color: '#16a34a' },
  bottom: { bg: '#fef9c3', color: '#b45309' },
  popup: { bg: '#ede9fe', color: '#7c3aed' },
}

function formatDt(s: string) {
  try {
    return new Date(s).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return s
  }
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, paddingBottom: 18, borderBottom: '1px solid #f3f4f6', marginBottom: 16, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 15, color: '#6b7280', fontFamily: F, minWidth: 140, paddingTop: 2 }}>{label}</span>
      <div style={{ flex: 1, fontSize: 16, color: '#111827', fontFamily: F }}>{children}</div>
    </div>
  )
}

export default function AdViewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const { data, isLoading } = useQuery({
    queryKey: ['ad', id],
    queryFn: async () => {
      // No getById — fetch list and find by id
      const res = await contentService.getAds({ page: 1, page_size: 100 })
      return res.data.find(a => a.ad_id === id) ?? null
    },
    enabled: !!id,
  })

  const posStyle = data ? (POSITION_COLOR[data.position] ?? { bg: '#f3f4f6', color: '#6b7280' }) : { bg: '#f3f4f6', color: '#6b7280' }

  return (
    <div style={{ fontFamily: F, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.push('/admin/ads')}
            style={{ width: 36, height: 38, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} color="#374151" />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: F, margin: 0 }}>รายละเอียดโฆษณา</h1>
        </div>
        {!isLoading && data && (
          <button
            onClick={() => router.push(`/admin/ads/${id}/edit`)}
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
          <ImageIcon size={48} color="#d1d5db" style={{ display: 'block', margin: '0 auto 12px' }} />
          <p style={{ color: '#9ca3af', fontFamily: F, fontSize: 16, margin: 0 }}>ไม่พบข้อมูลโฆษณา</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '30px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {/* Ad Image */}
          {data.image_url ? (
            <img
              src={data.image_url}
              alt="โฆษณา"
              style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 10, marginBottom: 24 }}
            />
          ) : (
            <div style={{ width: '100%', height: 200, borderRadius: 10, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <ImageIcon size={48} color="#d1d5db" />
            </div>
          )}

          {/* Badges row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: F, backgroundColor: posStyle.bg, color: posStyle.color }}>
              {POSITION_LABEL[data.position] ?? data.position}
            </span>
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: F, backgroundColor: data.is_active ? '#dcfce7' : '#f3f4f6', color: data.is_active ? '#16a34a' : '#6b7280' }}>
              {data.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            </span>
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 22 }}>
            {data.link_url && (
              <FieldRow label="ลิงก์">
                <a
                  href={data.link_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: PRIMARY, fontSize: 15, textDecoration: 'none', wordBreak: 'break-all' }}
                >
                  <ExternalLink size={13} /> {data.link_url}
                </a>
              </FieldRow>
            )}

            <FieldRow label="ตำแหน่งโฆษณา">
              <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: F, backgroundColor: posStyle.bg, color: posStyle.color }}>
                {POSITION_LABEL[data.position] ?? data.position}
              </span>
            </FieldRow>

            <FieldRow label="วันเริ่มต้น">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 15 }}>
                <Calendar size={13} /> {formatDt(data.active_from)}
              </span>
            </FieldRow>

            <FieldRow label="วันสิ้นสุด">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 15 }}>
                <Calendar size={13} /> {formatDt(data.active_until)}
              </span>
            </FieldRow>

            <FieldRow label="สถานะ">
              <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: F, backgroundColor: data.is_active ? '#dcfce7' : '#f3f4f6', color: data.is_active ? '#16a34a' : '#6b7280' }}>
                {data.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </span>
            </FieldRow>
          </div>
        </div>
      )}
    </div>
  )
}
