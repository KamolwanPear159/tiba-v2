'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { contentService } from '@/lib/api/services/content.service'

const F = 'var(--font-thai)'
const PRIMARY = '#1f4488'

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', backgroundColor: value ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

export default function AdminNewsEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [articleType, setArticleType] = useState<'news' | 'blog'>('news')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [preview, setPreview] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['news-item', id],
    queryFn: async () => {
      const res = await contentService.getNews({ page: 1, page_size: 50 })
      return res.data.find(a => a.news_id === id) ?? null
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (data) {
      setTitle(data.title ?? '')
      setArticleType((data.article_type as 'news' | 'blog') ?? 'news')
      setExcerpt(data.excerpt ?? '')
      setContent(data.content ?? '')
      setIsPublished(data.is_published ?? false)
      if (data.thumbnail_url) setPreview(data.thumbnail_url)
    }
  }, [data])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setThumbnail(f)
    setPreview(URL.createObjectURL(f))
  }

  const updateMutation = useMutation({
    mutationFn: (fd: FormData) => contentService.updateNews(id, fd),
    onSuccess: () => { toast.success('แก้ไขบทความสำเร็จ'); router.push('/admin/news') },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const handleSubmit = () => {
    if (!title.trim()) { toast.error('กรุณากรอกชื่อบทความ'); return }
    const fd = new FormData()
    fd.append('title', title)
    fd.append('article_type', articleType)
    fd.append('excerpt', excerpt)
    fd.append('content', content)
    fd.append('is_published', String(isPublished))
    if (thumbnail) fd.append('thumbnail', thumbnail)
    updateMutation.mutate(fd)
  }

  const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: F, boxSizing: 'border-box', backgroundColor: '#fff' }
  const lbl: React.CSSProperties = { fontSize: 15, color: '#374151', fontFamily: F, display: 'block', marginBottom: 6, fontWeight: 500 }

  if (isLoading) return <div style={{ fontFamily: F, textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>กำลังโหลด...</div>

  return (
    <div style={{ fontFamily: F, maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/admin/news')} style={{ width: 36, height: 38, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#374151" />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: F, margin: 0 }}>แก้ไขบทความ</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/admin/news')} style={{ height: 40, padding: '0 22px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F, color: '#374151' }}>ยกเลิก</button>
          <button onClick={handleSubmit} disabled={updateMutation.isPending} style={{ height: 40, padding: '0 22px', borderRadius: 8, border: 'none', backgroundColor: PRIMARY, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F, opacity: updateMutation.isPending ? 0.7 : 1 }}>
            {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '30px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {/* Thumbnail */}
        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>รูปหน้าปก</label>
          <div onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 180, borderRadius: 10, backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '2px dashed #c4b5fd' }}>
            {preview
              ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ textAlign: 'center', color: '#7c3aed' }}><ImageIcon size={36} style={{ marginBottom: 8 }} /><div style={{ fontSize: 16, fontFamily: F }}>คลิกเพื่ออัปโหลดรูปหน้าปก</div></div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>ชื่อบทความ <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inp} placeholder="กรอกชื่อบทความ..." />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>ประเภท</label>
          <select value={articleType} onChange={e => setArticleType(e.target.value as 'news' | 'blog')} style={{ ...inp, cursor: 'pointer' }}>
            <option value="news">ข่าว</option>
            <option value="blog">บทความ</option>
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>สรุปย่อ</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} placeholder="สรุปเนื้อหาสั้น ๆ..." style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>เนื้อหา</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} placeholder="เนื้อหาบทความ..." style={{ ...inp, height: 'auto', minHeight: 200, padding: '10px 12px', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 18, borderTop: '1px solid #f3f4f6' }}>
          <Toggle value={isPublished} onChange={setIsPublished} />
          <span style={{ fontSize: 16, color: '#374151', fontFamily: F, fontWeight: 500 }}>เผยแพร่</span>
        </div>
      </div>
    </div>
  )
}
