'use client'

import React, { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, FileText, Upload } from 'lucide-react'
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

export default function AdminStatisticsCreatePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [publishedYear, setPublishedYear] = useState<string>(String(new Date().getFullYear()))
  const [description, setDescription] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setPdfFile(f)
  }

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => contentService.createStatistic(fd),
    onSuccess: () => {
      toast.success('อัพโหลดสถิติสำเร็จ')
      router.push('/admin/statistics')
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const handleSubmit = () => {
    if (!title.trim()) { toast.error('กรุณากรอกชื่อสถิติ'); return }
    if (!pdfFile) { toast.error('กรุณาเลือกไฟล์ PDF'); return }
    const fd = new FormData()
    fd.append('title', title)
    fd.append('published_year', publishedYear)
    fd.append('description', description)
    fd.append('is_published', String(isPublished))
    fd.append('pdf', pdfFile)
    createMutation.mutate(fd)
  }

  const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: F, boxSizing: 'border-box', backgroundColor: '#fff' }
  const lbl: React.CSSProperties = { fontSize: 15, color: '#374151', fontFamily: F, display: 'block', marginBottom: 6, fontWeight: 500 }

  return (
    <div style={{ fontFamily: F, maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.push('/admin/statistics')}
            style={{ width: 36, height: 38, borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} color="#374151" />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', fontFamily: F, margin: 0 }}>อัพโหลดสถิติประกันภัย</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => router.push('/admin/statistics')}
            style={{ height: 40, padding: '0 22px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F, color: '#374151' }}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            style={{ height: 40, padding: '0 22px', borderRadius: 8, border: 'none', backgroundColor: PRIMARY, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F, opacity: createMutation.isPending ? 0.7 : 1 }}
          >
            {createMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '30px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>ชื่อสถิติ <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inp} placeholder="กรอกชื่อสถิติ..." />
        </div>

        {/* Year */}
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>ปีข้อมูล</label>
          <input
            type="number"
            value={publishedYear}
            onChange={e => setPublishedYear(e.target.value)}
            min={2000}
            max={2100}
            style={inp}
            placeholder="เช่น 2567"
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>คำอธิบาย</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="รายละเอียดสถิติ..."
            style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' }}
          />
        </div>

        {/* PDF Upload */}
        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>ไฟล์ PDF <span style={{ color: '#ef4444' }}>*</span></label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ width: '100%', padding: '32px 24px', border: '2px dashed #e5e7eb', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 10, backgroundColor: '#fafafa', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = PRIMARY)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
          >
            {pdfFile ? (
              <>
                <FileText size={36} color={PRIMARY} />
                <span style={{ fontSize: 16, fontWeight: 500, color: PRIMARY, fontFamily: F }}>{pdfFile.name}</span>
                <span style={{ fontSize: 14, color: '#9ca3af', fontFamily: F }}>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB · คลิกเพื่อเปลี่ยนไฟล์</span>
              </>
            ) : (
              <>
                <Upload size={32} color="#9ca3af" />
                <span style={{ fontSize: 16, color: '#374151', fontFamily: F, fontWeight: 500 }}>เลือกไฟล์ PDF</span>
                <span style={{ fontSize: 14, color: '#9ca3af', fontFamily: F }}>คลิกหรือลากไฟล์มาวางที่นี่</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        {/* Publish toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 18, borderTop: '1px solid #f3f4f6' }}>
          <Toggle value={isPublished} onChange={setIsPublished} />
          <span style={{ fontSize: 16, color: '#374151', fontFamily: F, fontWeight: 500 }}>เผยแพร่</span>
        </div>
      </div>
    </div>
  )
}
