'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Pencil, FileText, Download, BarChart2 } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'

const F = 'var(--font-thai)'
const PRIMARY = '#1f4488'

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

export default function StatisticViewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const { data, isLoading } = useQuery({
    queryKey: ['statistic', id],
    queryFn: async () => {
      // No getById — fetch all pages and find by id
      const res = await contentService.getStatistics({ page: 1, page_size: 100 })
      return res.data.find(s => s.stat_id === id) ?? null
    },
    enabled: !!id,
  })

  return (
    <div style={{ fontFamily: F, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.push('/admin/statistics')}
            style={{ width: 36, height: 38, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} color="#374151" />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: F, margin: 0 }}>รายละเอียดสถิติ</h1>
        </div>
        {!isLoading && data && (
          <button
            onClick={() => router.push(`/admin/statistics/${id}/edit`)}
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
          <BarChart2 size={48} color="#d1d5db" style={{ display: 'block', margin: '0 auto 12px' }} />
          <p style={{ color: '#9ca3af', fontFamily: F, fontSize: 16, margin: 0 }}>ไม่พบข้อมูลสถิติ</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '30px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {/* Title + year badge row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
            <FileText size={28} color={PRIMARY} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', fontFamily: F, margin: '0 0 8px', lineHeight: 1.4 }}>
                {data.title}
              </h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: F, backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                  ปี {data.published_year}
                </span>
                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: F, backgroundColor: data.is_published ? '#dcfce7' : '#f3f4f6', color: data.is_published ? '#16a34a' : '#6b7280' }}>
                  {data.is_published ? 'เผยแพร่' : 'ร่าง'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 22 }}>
            {data.description && (
              <FieldRow label="คำอธิบาย">
                <p style={{ margin: 0, color: '#374151', lineHeight: 1.7 }}>{data.description}</p>
              </FieldRow>
            )}

            <FieldRow label="ปีข้อมูล">
              <span style={{ fontWeight: 600 }}>{data.published_year}</span>
            </FieldRow>

            <FieldRow label="สถานะ">
              <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: F, backgroundColor: data.is_published ? '#dcfce7' : '#f3f4f6', color: data.is_published ? '#16a34a' : '#6b7280' }}>
                {data.is_published ? 'เผยแพร่' : 'ร่าง'}
              </span>
            </FieldRow>

            <FieldRow label="วันที่อัพโหลด">
              <span style={{ color: '#6b7280', fontSize: 15 }}>{formatDt(data.created_at)}</span>
            </FieldRow>

            {data.pdf_url && (
              <div style={{ marginTop: 8 }}>
                <a
                  href={data.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: `1px solid ${PRIMARY}`, color: PRIMARY, fontSize: 16, fontWeight: 500, fontFamily: F, textDecoration: 'none', backgroundColor: '#f0f4ff' }}
                >
                  <Download size={15} /> ดาวน์โหลด PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
