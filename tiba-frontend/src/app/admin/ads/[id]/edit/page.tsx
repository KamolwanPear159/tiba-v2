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

export default function AdminAdsEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const fileRef = useRef<HTMLInputElement>(null)

  const [linkUrl, setLinkUrl] = useState('')
  const [position, setPosition] = useState<'top' | 'sidebar' | 'bottom' | 'popup'>('top')
  const [activeFrom, setActiveFrom] = useState('')
  const [activeUntil, setActiveUntil] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['ad-item', id],
    queryFn: async () => {
      const res = await contentService.getAds({ page: 1, page_size: 50 })
      return res.data.find(a => a.ad_id === id) ?? null
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (data) {
      setLinkUrl(data.link_url ?? '')
      setPosition((data.position as typeof position) ?? 'top')
      // Format dates to YYYY-MM-DD for input[type=date]
      if (data.active_from) setActiveFrom(data.active_from.substring(0, 10))
      if (data.active_until) setActiveUntil(data.active_until.substring(0, 10))
      setIsActive(data.is_active ?? true)
      if (data.image_url) setPreview(data.image_url)
    }
  }, [data])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const updateMutation = useMutation({
    mutationFn: (fd: FormData) => contentService.updateAd(id, fd),
    onSuccess: () => { toast.success('แก้ไขโฆษณาสำเร็จ'); router.push('/admin/ads') },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const handleSubmit = () => {
    if (!activeFrom || !activeUntil) { toast.error('กรุณาเลือกวันที่เริ่ม-สิ้นสุด'); return }
    const fd = new FormData()
    if (imageFile) fd.append('image', imageFile)
    fd.append('link_url', linkUrl)
    fd.append('position', position)
    fd.append('active_from', activeFrom)
    fd.append('active_until', activeUntil)
    fd.append('is_active', String(isActive))
    updateMutation.mutate(fd)
  }

  const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: F, boxSizing: 'border-box', backgroundColor: '#fff' }
  const lbl: React.CSSProperties = { fontSize: 15, color: '#374151', fontFamily: F, display: 'block', marginBottom: 6, fontWeight: 500 }

  if (isLoading) return <div style={{ fontFamily: F, textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>กำลังโหลด...</div>

  return (
    <div style={{ fontFamily: F, maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/admin/ads')} style={{ width: 36, height: 38, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#374151" />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: F, margin: 0 }}>แก้ไขโฆษณา</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/admin/ads')} style={{ height: 40, padding: '0 22px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F, color: '#374151' }}>ยกเลิก</button>
          <button onClick={handleSubmit} disabled={updateMutation.isPending} style={{ height: 40, padding: '0 22px', borderRadius: 8, border: 'none', backgroundColor: PRIMARY, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F, opacity: updateMutation.isPending ? 0.7 : 1 }}>
            {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '30px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>รูปโฆษณา</label>
          <div onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 160, borderRadius: 10, backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '2px dashed #c4b5fd' }}>
            {preview
              ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ textAlign: 'center', color: '#7c3aed' }}><ImageIcon size={32} style={{ marginBottom: 8 }} /><div style={{ fontSize: 16, fontFamily: F }}>คลิกเพื่อเปลี่ยนรูปโฆษณา</div></div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>ลิงค์โฆษณา</label>
          <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} style={inp} placeholder="https://..." />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>ตำแหน่ง</label>
          <select value={position} onChange={e => setPosition(e.target.value as typeof position)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="top">ด้านบน (Top)</option>
            <option value="sidebar">แถบข้าง (Sidebar)</option>
            <option value="bottom">ด้านล่าง (Bottom)</option>
            <option value="popup">ป๊อปอัพ (Popup)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={lbl}>วันที่เริ่ม <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="date" value={activeFrom} onChange={e => setActiveFrom(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>วันที่สิ้นสุด <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="date" value={activeUntil} onChange={e => setActiveUntil(e.target.value)} style={inp} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 18, borderTop: '1px solid #f3f4f6' }}>
          <Toggle value={isActive} onChange={setIsActive} />
          <span style={{ fontSize: 16, color: '#374151', fontFamily: F, fontWeight: 500 }}>เปิดใช้งาน</span>
        </div>
      </div>
    </div>
  )
}
