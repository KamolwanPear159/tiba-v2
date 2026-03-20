'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Pencil, Image as ImageIcon, Calendar, Tag, CheckCircle, FileText } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'

const F = 'var(--font-thai)'
const PRIMARY = '#1f4488'

export default function AdminNewsViewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  // Fetch list and find item by id (no dedicated getById endpoint)
  const { data, isLoading } = useQuery({
    queryKey: ['news-item', id],
    queryFn: async () => {
      const res = await contentService.getNews({ page: 1, page_size: 50 })
      return res.data.find(a => a.news_id === id) ?? null
    },
    enabled: !!id,
  })

  const formatDt = (s: string) => {
    try {
      return new Date(s).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return s }
  }

  const fieldRow = (label: string, value: React.ReactNode) => (
    <div style={{ display: 'flex', gap: 16, paddingBottom: 18, borderBottom: '1px solid #f3f4f6', marginBottom: 16, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 15, color: '#6b7280', fontFamily: F, minWidth: 130, paddingTop: 2 }}>{label}</span>
      <div style={{ flex: 1, fontSize: 16, color: '#111827', fontFamily: F }}>{value}</div>
    </div>
  )

  return (
    <div style={{ fontFamily: F, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.push('/admin/news')}
            style={{ width: 36, height: 38, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} color="#374151" />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: F, margin: 0 }}>รายละเอียดบทความ</h1>
        </div>
        <button
          onClick={() => router.push(`/admin/news/${id}/edit`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 18px', borderRadius: 8, border: 'none', backgroundColor: PRIMARY, color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: F }}
        >
          <Pencil size={14} /> แก้ไข
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af', fontFamily: F }}>กำลังโหลด...</div>
      ) : !data ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <FileText size={48} color="#d1d5db" style={{ marginBottom: 12 }} />
          <p style={{ color: '#9ca3af', fontFamily: F, fontSize: 16 }}>ไม่พบข้อมูลบทความ</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '30px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {/* Thumbnail */}
          {data.thumbnail_url ? (
            <img
              src={data.thumbnail_url}
              alt={data.title}
              style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 10, marginBottom: 24 }}
            />
          ) : (
            <div style={{ width: '100%', height: 200, borderRadius: 10, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <ImageIcon size={48} color="#d1d5db" />
            </div>
          )}

          {/* Title */}
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', fontFamily: F, marginBottom: 20, lineHeight: 1.4 }}>{data.title}</h2>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: F, backgroundColor: data.article_type === 'news' ? '#dbeafe' : '#ede9fe', color: data.article_type === 'news' ? '#1d4ed8' : '#7c3aed' }}>
              <Tag size={11} /> {data.article_type === 'news' ? 'ข่าว' : 'บทความ'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 999, fontSize: 14, fontWeight: 600, fontFamily: F, backgroundColor: data.is_published ? '#dcfce7' : '#f3f4f6', color: data.is_published ? '#16a34a' : '#6b7280' }}>
              <CheckCircle size={11} /> {data.is_published ? 'เผยแพร่' : 'ร่าง'}
            </span>
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 22 }}>
            {data.excerpt && fieldRow('สรุปย่อ', <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.6 }}>{data.excerpt}</p>)}
            {fieldRow('วันที่เผยแพร่',
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 15 }}>
                <Calendar size={13} /> {formatDt(data.published_at || data.created_at)}
              </span>
            )}
            {fieldRow('วันที่สร้าง',
              <span style={{ color: '#6b7280', fontSize: 15 }}>{formatDt(data.created_at)}</span>
            )}
            {data.content && (
              <div>
                <div style={{ fontSize: 15, color: '#6b7280', fontFamily: F, marginBottom: 8, fontWeight: 500 }}>เนื้อหา</div>
                <div style={{ fontSize: 16, color: '#374151', fontFamily: F, lineHeight: 1.8, whiteSpace: 'pre-wrap', backgroundColor: '#fafafa', borderRadius: 8, padding: '18px', border: '1px solid #f3f4f6' }}>
                  {data.content}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
