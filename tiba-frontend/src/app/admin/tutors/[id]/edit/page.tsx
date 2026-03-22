'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react'
import { adminService } from '@/lib/api/services/admin.service'

const F = 'var(--font-thai)'

export default function TutorEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ name?: string; position?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: tutor, isLoading } = useQuery({
    queryKey: ['tutor', id],
    queryFn: () => adminService.getTutor(id),
    enabled: !!id,
  })

  useEffect(() => {
    if (tutor) {
      setName(tutor.name ?? '')
      setPosition(tutor.position ?? '')
      if (tutor.photo_url) setPhotoPreview(tutor.photo_url)
    }
  }, [tutor])

  const { mutate, isPending } = useMutation({
    mutationFn: (fd: FormData) => adminService.updateTutor(id, fd),
    onSuccess: () => router.push('/admin/tutors'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => setSubmitError(err?.response?.data?.error?.message ?? err?.response?.data?.message ?? err?.message ?? 'เกิดข้อผิดพลาด'),
  })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setPhotoFile(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  const handleSubmit = () => {
    setSubmitError(null)
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = 'กรุณาระบุชื่อผู้สอน'
    if (!position.trim()) errs.position = 'กรุณาระบุตำแหน่ง'
    if (Object.keys(errs).length) { setErrors(errs); return }
    const fd = new FormData()
    fd.append('name', name.trim())
    fd.append('position', position.trim())
    if (photoFile) fd.append('photo', photoFile)
    mutate(fd)
  }

  const fieldStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${hasError ? '#f44336' : '#ddd'}`,
    borderRadius: 8, fontSize: 17, fontFamily: F, color: '#333',
    outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff',
  })

  if (isLoading) return <div style={{ fontFamily: F, textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>กำลังโหลด...</div>

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: F }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 40, border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>
              <ArrowLeft size={18} color="#444" />
            </button>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a1a', fontFamily: F }}>แก้ไขผู้สอน</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => router.back()} style={{ padding: '10px 22px', border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16, fontFamily: F, color: '#444' }}>ยกเลิก</button>
            <button onClick={handleSubmit} disabled={isPending} style={{ padding: '10px 26px', border: 'none', borderRadius: 8, background: '#1f4488', color: '#fff', cursor: isPending ? 'not-allowed' : 'pointer', fontSize: 16, fontFamily: F, fontWeight: 600, opacity: isPending ? 0.75 : 1 }}>
              {isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>

        {submitError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fff5f5', border: '1.5px solid #fecaca', borderRadius: 8, marginBottom: 24, color: '#c0392b', fontSize: 16, fontFamily: F }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} /> {submitError}
          </div>
        )}

        {/* Photo */}
        <div onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 220, background: photoPreview ? 'transparent' : '#ede9fe', borderRadius: 12, border: photoPreview ? 'none' : '2px dashed #c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 28, overflow: 'hidden', position: 'relative' }}>
          {photoPreview
            ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ textAlign: 'center' }}><Upload size={32} color="#8b5cf6" style={{ display: 'block', margin: '0 auto 10px' }} /><p style={{ margin: 0, fontSize: 17, color: '#7c3aed', fontWeight: 600, fontFamily: F }}>อัปโหลดรูปภาพ</p></div>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

        {/* Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#444', marginBottom: 7, fontFamily: F }}>ชื่อ <span style={{ color: '#f44336' }}>*</span></label>
            <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }} placeholder="ระบุชื่อผู้สอน" style={fieldStyle(!!errors.name)} />
            {errors.name && <p style={{ margin: '5px 0 0', fontSize: 14, color: '#f44336', fontFamily: F }}>{errors.name}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#444', marginBottom: 7, fontFamily: F }}>ตำแหน่ง <span style={{ color: '#f44336' }}>*</span></label>
            <input value={position} onChange={e => { setPosition(e.target.value); setErrors(p => ({ ...p, position: undefined })) }} placeholder="ระบุตำแหน่ง" style={fieldStyle(!!errors.position)} />
            {errors.position && <p style={{ margin: '5px 0 0', fontSize: 14, color: '#f44336', fontFamily: F }}>{errors.position}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
