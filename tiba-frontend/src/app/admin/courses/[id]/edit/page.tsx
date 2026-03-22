'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ChevronLeft, Plus, Trash2, Check, Upload } from 'lucide-react'
import type { CourseDocument } from '@/types'
import { courseService } from '@/lib/api/services/course.service'
import { adminService } from '@/lib/api/services/admin.service'

const FONT = 'var(--font-thai)'

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 42,
  padding: '0 14px',
  border: '1px solid #e5e6f0',
  borderRadius: 8,
  fontSize: 16,
  color: '#374151',
  outline: 'none',
  fontFamily: FONT,
  boxSizing: 'border-box',
  backgroundColor: '#fff',
}

const labelStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 6,
  display: 'block',
  fontFamily: FONT,
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 12,
  border: '1px solid #e5e6f0',
  padding: '24px 28px',
  marginBottom: 20,
}

const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
]

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 40, height: 42, borderRadius: '50%', backgroundColor: current >= 1 ? '#1f4488' : '#e5e6f0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, fontFamily: FONT }}>1</div>
        <span style={{ fontSize: 14, color: current >= 1 ? '#1f4488' : '#9ca3af', fontFamily: FONT, fontWeight: current === 1 ? 600 : 400 }}>ข้อมูลคอร์สอบรม</span>
      </div>
      <div style={{ width: 120, height: 2, backgroundColor: current >= 2 ? '#1f4488' : '#e5e6f0', margin: '0 8px', marginBottom: 28 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 40, height: 42, borderRadius: '50%', backgroundColor: current >= 2 ? '#1f4488' : '#e5e6f0', color: current >= 2 ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, fontFamily: FONT }}>2</div>
        <span style={{ fontSize: 14, color: current >= 2 ? '#1f4488' : '#9ca3af', fontFamily: FONT, fontWeight: current === 2 ? 600 : 400 }}>รายละเอียด</span>
      </div>
    </div>
  )
}

// ─── Tutor Picker ─────────────────────────────────────────────────────────────

function TutorPicker({ selectedIDs, onChange }: { selectedIDs: string[]; onChange: (ids: string[]) => void }) {
  const { data } = useQuery({
    queryKey: ['admin-tutors-picker'],
    queryFn: () => adminService.getTutors({ page: 1, page_size: 100 }),
  })
  const allTutors = data?.data ?? []
  const seen = new Set<string>()
  const tutors = allTutors.filter(t => { if (seen.has(t.tutor_id)) return false; seen.add(t.tutor_id); return true })
  const toggle = (id: string) => onChange(selectedIDs.includes(id) ? selectedIDs.filter(x => x !== id) : [...selectedIDs, id])

  if (tutors.length === 0) {
    return <p style={{ fontFamily: FONT, fontSize: 14, color: '#9ca3af', margin: 0 }}>ยังไม่มีผู้สอนในระบบ — กรุณาเพิ่มผู้สอนในเมนู &quot;ผู้สอน&quot; ก่อน</p>
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
      {tutors.map(t => {
        const sel = selectedIDs.includes(t.tutor_id)
        return (
          <div key={t.tutor_id} onClick={() => toggle(t.tutor_id)} style={{ border: sel ? '2px solid #1f4488' : '1px solid #e5e6f0', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', backgroundColor: sel ? '#f0f4ff' : '#fff' }}>
            {t.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#e8f0fd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#1f4488', fontFamily: FONT }}>{t.name.charAt(0)}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</p>
              <p style={{ fontFamily: FONT, fontSize: 12, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.position}</p>
            </div>
            {sel && <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#1f4488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={12} color="#fff" strokeWidth={3} /></div>}
          </div>
        )
      })}
    </div>
  )
}

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTutorIDs, setSelectedTutorIDs] = useState<string[]>([])
  const [existingDocs, setExistingDocs] = useState<CourseDocument[]>([])
  const [pendingDocs, setPendingDocs] = useState<{ name: string; file: File }[]>([])
  const [deletingDocIds, setDeletingDocIds] = useState<Set<string>>(new Set())

  const { data: course, isLoading } = useQuery({
    queryKey: ['admin-course', courseId],
    queryFn: () => courseService.getCourse(courseId),
  })

  // Form state — pre-filled from course data
  const [title, setTitle] = useState('')
  const [priceType, setPriceType] = useState<'single' | 'dual'>('single')
  const [priceGeneral, setPriceGeneral] = useState('')
  const [priceAssociation, setPriceAssociation] = useState('')
  const [note, setNote] = useState('')
  const [format, setFormat] = useState<'online' | 'onsite'>('online')
  const [onlineLink, setOnlineLink] = useState('')
  const [outcomes, setOutcomes] = useState<string[]>([''])
  const [scheduleRows, setScheduleRows] = useState([{ start: '', end: '', activity: '' }])
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Pre-fill when course loads
  useEffect(() => {
    if (!course) return
    setTitle(course.title)
    setPriceType(course.price_type)
    setPriceGeneral(String(course.price_general))
    setPriceAssociation(String(course.price_association ?? ''))
    setNote(course.description)
    setFormat(course.format)
    setOnlineLink(course.online_link ?? '')
    if (course.thumbnail_url) setThumbnailPreview(course.thumbnail_url)
    if (course.tutors && course.tutors.length > 0) {
      setSelectedTutorIDs(course.tutors.map(t => t.tutor_id))
    }
    // Load existing documents
    courseService.listDocuments(courseId).then(docs => setExistingDocs(docs)).catch(() => {})
  }, [course, courseId])

  const saveMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('description', note || '-')
      fd.append('format', format)
      if (onlineLink) fd.append('online_meeting_link', onlineLink)
      fd.append('price_type', priceType)
      fd.append('price_general', String(Number(priceGeneral) || 0))
      if (priceType === 'dual') fd.append('price_association', String(Number(priceAssociation) || 0))
      fd.append('is_published', String(course?.is_published ?? false))
      if (thumbnail) fd.append('thumbnail', thumbnail)
      return courseService.updateCourse(courseId, fd)
    },
    onSuccess: async () => {
      await courseService.setCourseTutors(courseId, selectedTutorIDs).catch(() => {})
      // Delete removed docs
      for (const id of deletingDocIds) {
        await courseService.deleteDocument(courseId, id).catch(() => {})
      }
      // Upload new docs
      for (const doc of pendingDocs) {
        await courseService.addDocument(courseId, doc.name, doc.file).catch(() => {})
      }
      toast.success('แก้ไขคอร์สสำเร็จ')
      router.push(`/admin/courses/${courseId}`)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  if (isLoading) {
    return <div style={{ padding: 42, textAlign: 'center', color: '#9ca3af', fontFamily: FONT }}>กำลังโหลด...</div>
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '8px 0 32px', fontFamily: FONT }}>
      {/* Back */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button
          onClick={() => (step === 1 ? router.push(`/admin/courses/${courseId}`) : setStep(1))}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280', fontFamily: FONT }}
        >
          <ChevronLeft size={16} />
          ย้อนกลับ
        </button>
        <span style={{ fontSize: 15, color: '#9ca3af', fontFamily: FONT }}>คอร์สอบรม / แก้ไขคอร์สอบรม</span>
      </div>

      <StepIndicator current={step} />

      {step === 1 ? (
        <>
          {/* Thumbnail */}
          <div style={cardStyle}>
            <p style={{ ...labelStyle }}>รูป</p>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ width: 160, height: 120, borderRadius: 10, border: '2px dashed #c7d2e0', backgroundColor: '#f3f6fb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}
            >
              {thumbnailPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnailPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1f4488', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <Plus size={18} color="#fff" />
                  </div>
                  <span style={{ fontSize: 14, color: '#6b7280', fontFamily: FONT }}>อัปโหลดรูปภาพ</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const f = e.target.files?.[0]
              if (f) { setThumbnail(f); setThumbnailPreview(URL.createObjectURL(f)) }
            }} />
          </div>

          {/* Basic info */}
          <div style={cardStyle}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#1f4488', marginBottom: 16, fontFamily: FONT }}>ข้อมูลคอร์สอบรม</p>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>ชื่ออบรม *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ชื่ออบรม" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>ราคาคอร์ส *</label>
              <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
                {(['single', 'dual'] as const).map(pt => (
                  <button key={pt} onClick={() => setPriceType(pt)} style={{ padding: '8px 20px', border: '1px solid #e5e6f0', borderRadius: pt === 'single' ? '8px 0 0 8px' : '0 8px 8px 0', borderLeft: pt === 'dual' ? 'none' : undefined, backgroundColor: priceType === pt ? '#1f4488' : '#fff', color: priceType === pt ? '#fff' : '#374151', fontSize: 16, cursor: 'pointer', fontFamily: FONT }}>
                    {pt === 'single' ? 'ราคาเดียว' : 'ราคาแยกประเภท'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: priceType === 'dual' ? '1fr 1fr' : '1fr', gap: 12 }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: 15, color: '#6b7280' }}>ราคาคอร์สทั่วไป</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#6b7280' }}>฿</span>
                    <input type="number" min="0" value={priceGeneral} onChange={e => setPriceGeneral(e.target.value)} style={{ ...inputStyle, paddingLeft: 30 }} />
                  </div>
                </div>
                {priceType === 'dual' && (
                  <div>
                    <label style={{ ...labelStyle, fontSize: 15, color: '#6b7280' }}>ราคาคอร์สสมาคม</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#6b7280' }}>฿</span>
                      <input type="number" min="0" value={priceAssociation} onChange={e => setPriceAssociation(e.target.value)} style={{ ...inputStyle, paddingLeft: 30 }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={labelStyle}>หมายเหตุ</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 34 }}>
            <button onClick={() => router.push(`/admin/courses/${courseId}`)} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: FONT, color: '#374151' }}>ยกเลิก</button>
            <button onClick={() => { if (!title.trim()) { toast.error('กรุณากรอกชื่ออบรม'); return } setStep(2) }} style={{ padding: '10px 28px', borderRadius: 8, border: 'none', backgroundColor: '#1f4488', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>ต่อไป</button>
          </div>
        </>
      ) : (
        <>
          {/* Step 2: Details */}
          <div style={cardStyle}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#1f4488', marginBottom: 16, fontFamily: FONT }}>รายละเอียด</p>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>สถานที่จัดอบรม</label>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                {(['online', 'onsite'] as const).map(f => (
                  <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 16, fontFamily: FONT, color: '#374151' }}>
                    <input type="radio" checked={format === f} onChange={() => setFormat(f)} style={{ width: 16, height: 16, accentColor: '#1f4488' }} />
                    {f === 'online' ? 'ออนไลน์' : 'ออฟไลน์'}
                  </label>
                ))}
              </div>
              {format === 'online' && (
                <div>
                  <label style={labelStyle}>แนบลิงก์วิดีโออบรม</label>
                  <input type="url" value={onlineLink} onChange={e => setOnlineLink(e.target.value)} placeholder="แนบลิงก์" style={inputStyle} />
                </div>
              )}
            </div>
          </div>

          {/* Outcomes */}
          <div style={cardStyle}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#1f4488', marginBottom: 16, fontFamily: FONT }}>สิ่งที่ได้จากคอร์สนี้</p>
            {outcomes.map((o, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6b7280' }}>{i + 1}</span>
                <input type="text" value={o} onChange={e => { const arr = [...outcomes]; arr[i] = e.target.value; setOutcomes(arr) }} placeholder="หัวข้อ" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => setOutcomes(outcomes.filter((_, idx) => idx !== i))} style={{ width: 36, height: 42, border: 'none', borderRadius: 6, backgroundColor: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={14} color="#dc2626" />
                </button>
              </div>
            ))}
            <button onClick={() => { if (outcomes.length < 5) setOutcomes([...outcomes, '']) }} disabled={outcomes.length >= 5} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: FONT, color: '#374151', opacity: outcomes.length >= 5 ? 0.5 : 1 }}>
              <Plus size={14} />
              เพิ่ม {outcomes.length}/5
            </button>
          </div>

          {/* Schedule */}
          <div style={cardStyle}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#1f4488', marginBottom: 16, fontFamily: FONT }}>กำหนดการ</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
              <thead>
                <tr>
                  {['เวลาเริ่มต้น', 'เวลาสิ้นสุด', 'กำหนดการ', ''].map((h, i) => (
                    <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 15, color: '#6b7280', borderBottom: '1px solid #f3f4f6', fontFamily: FONT }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleRows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '6px 10px' }}><input type="time" value={row.start} onChange={e => { const arr = [...scheduleRows]; arr[i].start = e.target.value; setScheduleRows(arr) }} style={{ ...inputStyle, width: 130 }} /></td>
                    <td style={{ padding: '6px 10px' }}><input type="time" value={row.end} onChange={e => { const arr = [...scheduleRows]; arr[i].end = e.target.value; setScheduleRows(arr) }} style={{ ...inputStyle, width: 130 }} /></td>
                    <td style={{ padding: '6px 10px' }}><input type="text" value={row.activity} onChange={e => { const arr = [...scheduleRows]; arr[i].activity = e.target.value; setScheduleRows(arr) }} placeholder="ระบุกำหนดการ" style={inputStyle} /></td>
                    <td style={{ padding: '6px 10px', width: 40 }}>
                      <button onClick={() => setScheduleRows(scheduleRows.filter((_, idx) => idx !== i))} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, backgroundColor: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={14} color="#dc2626" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setScheduleRows([...scheduleRows, { start: '', end: '', activity: '' }])} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #1f4488', backgroundColor: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: FONT, color: '#1f4488' }}>
              <Plus size={14} />
              เพิ่มกำหนดการ
            </button>
          </div>

          {/* Documents */}
          <div style={cardStyle}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#1f4488', marginBottom: 16, fontFamily: FONT }}>เอกสารแนบเพิ่มเติม</p>
            <label style={{ fontSize: 15, fontWeight: 500, color: '#6b7280', marginBottom: 8, display: 'block', fontFamily: FONT }}>รายการเอกสาร</label>
            {existingDocs.filter(d => !deletingDocIds.has(d.id)).map((doc, i) => (
              <div key={doc.id} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                <span style={{ width: 28, textAlign: 'center', fontSize: 15, color: '#6b7280', fontFamily: FONT, flexShrink: 0 }}>{i + 1}</span>
                <input
                  type="text"
                  value={doc.name}
                  onChange={e => {
                    setExistingDocs(prev => prev.map(d => d.id === doc.id ? { ...d, name: e.target.value } : d))
                    courseService.updateDocument(courseId, doc.id, e.target.value).catch(() => {})
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <span style={{ fontSize: 13, color: '#6b7280', fontFamily: FONT, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{doc.file_path.split('/').pop()}</span>
                <button onClick={() => setDeletingDocIds(prev => new Set([...prev, doc.id]))} style={{ width: 36, height: 42, border: 'none', borderRadius: 6, backgroundColor: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Trash2 size={15} color="#dc2626" />
                </button>
              </div>
            ))}
            {pendingDocs.map((doc, i) => (
              <div key={`new-${i}`} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                <span style={{ width: 28, textAlign: 'center', fontSize: 15, color: '#6b7280', fontFamily: FONT, flexShrink: 0 }}>{existingDocs.filter(d => !deletingDocIds.has(d.id)).length + i + 1}</span>
                <input
                  type="text"
                  value={doc.name}
                  onChange={e => { const arr = [...pendingDocs]; arr[i] = { ...arr[i], name: e.target.value }; setPendingDocs(arr) }}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <span style={{ fontSize: 13, color: '#6b7280', fontFamily: FONT, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{doc.file.name}</span>
                <button onClick={() => setPendingDocs(pendingDocs.filter((_, idx) => idx !== i))} style={{ width: 36, height: 42, border: 'none', borderRadius: 6, backgroundColor: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Trash2 size={15} color="#dc2626" />
                </button>
              </div>
            ))}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #1f4488', backgroundColor: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: FONT, color: '#1f4488' }}>
              <Upload size={14} />
              อัปโหลดเอกสาร
              <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" style={{ display: 'none' }} onChange={e => {
                const file = e.target.files?.[0]
                if (file) setPendingDocs(prev => [...prev, { name: file.name.replace(/\.[^.]+$/, ''), file }])
                e.target.value = ''
              }} />
            </label>
          </div>

          {/* Tutors */}
          <div style={cardStyle}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#1f4488', marginBottom: 16, fontFamily: FONT }}>
              ผู้สอน <span style={{ fontSize: 13, fontWeight: 400, color: '#9ca3af' }}>(เลือกได้หลายคน)</span>
            </p>
            <TutorPicker selectedIDs={selectedTutorIDs} onChange={setSelectedTutorIDs} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 34 }}>
            <button onClick={() => setStep(1)} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: FONT, color: '#374151' }}>ย้อนกลับ</button>
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={{ padding: '10px 28px', borderRadius: 8, border: 'none', backgroundColor: '#1f4488', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, opacity: saveMutation.isPending ? 0.7 : 1 }}>
              {saveMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
