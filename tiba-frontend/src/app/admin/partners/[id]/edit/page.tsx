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

export default function AdminPartnersEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => contentService.getPartners(),
  })

  const partner = data?.find(p => p.partner_id === id)

  useEffect(() => {
    if (partner) {
      setName(partner.name ?? '')
      setWebsiteUrl(partner.website_url ?? '')
      setDisplayOrder(String(partner.display_order ?? 0))
      setIsActive(partner.is_active ?? true)
      if (partner.logo_url) setPreview(partner.logo_url)
    }
  }, [partner])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setLogoFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const updateMutation = useMutation({
    mutationFn: (fd: FormData) => contentService.updatePartner(id, fd),
    onSuccess: () => { toast.success('แก้ไขพาร์ทเนอร์สำเร็จ'); router.push('/admin/partners') },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const handleSubmit = () => {
    if (!name.trim()) { toast.error('กรุณากรอกชื่อพาร์ทเนอร์'); return }
    const fd = new FormData()
    fd.append('name', name)
    fd.append('website_url', websiteUrl)
    fd.append('display_order', displayOrder)
    fd.append('is_active', String(isActive))
    if (logoFile) fd.append('logo', logoFile)
    updateMutation.mutate(fd)
  }

  const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: F, boxSizing: 'border-box', backgroundColor: '#fff' }
  const lbl: React.CSSProperties = { fontSize: 15, color: '#374151', fontFamily: F, display: 'block', marginBottom: 6, fontWeight: 500 }

  if (isLoading) return <div style={{ fontFamily: F, textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>กำลังโหลด...</div>

  return (
    <div style={{ fontFamily: F, maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/admin/partners')} style={{ width: 36, height: 38, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#374151" />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: F, margin: 0 }}>แก้ไขพาร์ทเนอร์</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/admin/partners')} style={{ height: 40, padding: '0 22px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F, color: '#374151' }}>ยกเลิก</button>
          <button onClick={handleSubmit} disabled={updateMutation.isPending} style={{ height: 40, padding: '0 22px', borderRadius: 8, border: 'none', backgroundColor: PRIMARY, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F, opacity: updateMutation.isPending ? 0.7 : 1 }}>
            {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '30px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ ...lbl, textAlign: 'center' }}>โลโก้พาร์ทเนอร์</label>
          <div onClick={() => fileRef.current?.click()} style={{ width: 200, height: 200, borderRadius: 12, backgroundColor: '#ede9fe', border: '2px dashed #c4b5fd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
            {preview
              ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <div style={{ textAlign: 'center', color: '#7c3aed' }}><ImageIcon size={36} style={{ marginBottom: 8 }} /><div style={{ fontSize: 15, fontFamily: F }}>คลิกเพื่ออัปโหลดโลโก้</div></div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>ชื่อพาร์ทเนอร์ <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={name} onChange={e => setName(e.target.value)} style={inp} placeholder="ชื่อบริษัท/องค์กร..." />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>เว็บไซต์</label>
          <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} style={inp} placeholder="https://..." />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>ลำดับการแสดงผล</label>
          <input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} min={0} style={inp} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 18, borderTop: '1px solid #f3f4f6' }}>
          <Toggle value={isActive} onChange={setIsActive} />
          <span style={{ fontSize: 16, color: '#374151', fontFamily: F, fontWeight: 500 }}>เปิดใช้งาน</span>
        </div>
      </div>
    </div>
  )
}
