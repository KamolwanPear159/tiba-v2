'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ChevronLeft, Plus, Trash2, Upload, Check } from 'lucide-react'
import { courseService } from '@/lib/api/services/course.service'
import { adminService } from '@/lib/api/services/admin.service'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Step1Data {
  thumbnail: File | null
  thumbnailPreview: string | null
  title: string
  priceType: 'single' | 'dual'
  priceGeneral: string
  priceAssociation: string
  ageLimit: number
  trainingOneDay: boolean
  trainingStartDate: string
  trainingStartTime: string
  trainingEndDate: string
  trainingEndTime: string
  bookingOneDay: boolean
  bookingStartDate: string
  bookingStartTime: string
  bookingEndDate: string
  bookingEndTime: string
  note: string
}

interface Step2Data {
  format: 'onsite' | 'online'
  onlineLink: string
  locationStreet: string
  locationDistrict: string
  locationProvince: string
  outcomes: string[]
  scheduleRows: { start: string; end: string; activity: string }[]
  contactPhone: string
  contactMobile: string
  contactEmail: string
  contactFacebook: string
  contactLine: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 42,
  padding: '0 14px',
  border: '1px solid #e5e6f0',
  borderRadius: 8,
  fontSize: 16,
  color: '#374151',
  outline: 'none',
  fontFamily: 'var(--font-thai)',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
}

const labelStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 6,
  display: 'block',
  fontFamily: 'var(--font-thai)',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1f4488',
  marginBottom: 16,
  fontFamily: 'var(--font-thai)',
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
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
]

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
      {/* Step 1 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 40, height: 42, borderRadius: '50%',
          backgroundColor: current >= 1 ? '#1f4488' : '#e5e6f0',
          color: current >= 1 ? '#fff' : '#9ca3af',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-thai)',
        }}>1</div>
        <span style={{ fontSize: 14, color: current >= 1 ? '#1f4488' : '#9ca3af', fontFamily: 'var(--font-thai)', fontWeight: current === 1 ? 600 : 400 }}>
          ข้อมูลคอร์สอบรม
        </span>
      </div>

      {/* Connector */}
      <div style={{ width: 120, height: 2, backgroundColor: current >= 2 ? '#1f4488' : '#e5e6f0', margin: '0 8px', marginBottom: 28 }} />

      {/* Step 2 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 40, height: 42, borderRadius: '50%',
          backgroundColor: current >= 2 ? '#1f4488' : '#e5e6f0',
          color: current >= 2 ? '#fff' : '#9ca3af',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-thai)',
        }}>2</div>
        <span style={{ fontSize: 14, color: current >= 2 ? '#1f4488' : '#9ca3af', fontFamily: 'var(--font-thai)', fontWeight: current === 2 ? 600 : 400 }}>
          รายละเอียด
        </span>
      </div>
    </div>
  )
}

// ─── Date + Time Row ─────────────────────────────────────────────────────────

function DateTimeRow({
  label,
  startDate, onStartDate,
  startTime, onStartTime,
  endDate, onEndDate,
  endTime, onEndTime,
  oneDay, onOneDay,
}: {
  label: string
  startDate: string; onStartDate: (v: string) => void
  startTime: string; onStartTime: (v: string) => void
  endDate: string; onEndDate: (v: string) => void
  endTime: string; onEndTime: (v: string) => void
  oneDay: boolean; onOneDay: (v: boolean) => void
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <label style={{ ...labelStyle, margin: 0 }}>{label}</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: '#6b7280', cursor: 'pointer', fontFamily: 'var(--font-thai)' }}>
          <input type="checkbox" checked={oneDay} onChange={e => onOneDay(e.target.checked)} style={{ width: 14, height: 14 }} />
          วันเดียว
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <input type="date" value={startDate} onChange={e => onStartDate(e.target.value)} style={{ ...inputStyle, paddingRight: 10 }} />
          </div>
          <select value={startTime} onChange={e => onStartTime(e.target.value)} style={{ ...inputStyle }}>
            <option value="">เลือกเวลา</option>
            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <span style={{ fontSize: 16, color: '#6b7280', fontFamily: 'var(--font-thai)', padding: '0 6px' }}>ถึง</span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 8 }}>
          <input
            type="date"
            value={oneDay ? startDate : endDate}
            onChange={e => onEndDate(e.target.value)}
            disabled={oneDay}
            style={{ ...inputStyle, opacity: oneDay ? 0.5 : 1 }}
          />
          <select value={endTime} onChange={e => onEndTime(e.target.value)} style={{ ...inputStyle }}>
            <option value="">เลือกเวลา</option>
            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}

// ─── Step 1 Form ─────────────────────────────────────────────────────────────

function Step1Form({
  data, onChange, onNext, onCancel,
}: {
  data: Step1Data
  onChange: (patch: Partial<Step1Data>) => void
  onNext: () => void
  onCancel: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onChange({
      thumbnail: file,
      thumbnailPreview: URL.createObjectURL(file),
    })
  }

  function validate(): boolean {
    if (!data.title.trim()) { toast.error('กรุณากรอกชื่ออบรม'); return false }
    if (!data.priceGeneral || Number(data.priceGeneral) < 0) { toast.error('กรุณากรอกราคาคอร์ส'); return false }
    return true
  }

  return (
    <>
      {/* Image upload */}
      <div style={cardStyle}>
        <p style={labelStyle}>รูป</p>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 160, height: 120, borderRadius: 10,
            border: '2px dashed #c7d2e0',
            backgroundColor: '#f3f6fb',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden',
          }}
        >
          {data.thumbnailPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.thumbnailPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1f4488', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Plus size={18} color="#fff" />
              </div>
              <span style={{ fontSize: 14, color: '#6b7280', fontFamily: 'var(--font-thai)' }}>อัปโหลดรูปภาพ</span>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleThumbnail} style={{ display: 'none' }} />
      </div>

      {/* Basic info */}
      <div style={cardStyle}>
        <p style={sectionTitleStyle}>ข้อมูลคอร์สอบรม</p>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>ชื่ออบรม <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="text"
            value={data.title}
            onChange={e => onChange({ title: e.target.value })}
            placeholder="ชื่ออบรม"
            style={inputStyle}
          />
        </div>

        {/* Price */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>ราคาคอร์ส <span style={{ color: '#ef4444' }}>*</span></label>
          <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
            <button
              onClick={() => onChange({ priceType: 'single' })}
              style={{
                padding: '8px 20px', border: '1px solid #e5e6f0', borderRadius: '8px 0 0 8px',
                backgroundColor: data.priceType === 'single' ? '#1f4488' : '#fff',
                color: data.priceType === 'single' ? '#fff' : '#374151',
                fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-thai)',
              }}
            >ราคาเดียว</button>
            <button
              onClick={() => onChange({ priceType: 'dual' })}
              style={{
                padding: '8px 20px', border: '1px solid #e5e6f0', borderLeft: 'none', borderRadius: '0 8px 8px 0',
                backgroundColor: data.priceType === 'dual' ? '#1f4488' : '#fff',
                color: data.priceType === 'dual' ? '#fff' : '#374151',
                fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-thai)',
              }}
            >ราคาแยกประเภท</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: data.priceType === 'dual' ? '1fr 1fr 1fr' : '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ ...labelStyle, fontSize: 15, color: '#6b7280' }}>ราคาคอร์สทั่วไป</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#6b7280' }}>฿</span>
                <input
                  type="number" min="0" step="0.01"
                  value={data.priceGeneral}
                  onChange={e => onChange({ priceGeneral: e.target.value })}
                  style={{ ...inputStyle, paddingLeft: 30 }}
                />
              </div>
            </div>
            {data.priceType === 'dual' && (
              <div>
                <label style={{ ...labelStyle, fontSize: 15, color: '#6b7280' }}>ราคาคอร์สสมาคม</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#6b7280' }}>฿</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={data.priceAssociation}
                    onChange={e => onChange({ priceAssociation: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: 30 }}
                  />
                </div>
              </div>
            )}
            <div>
              <label style={{ ...labelStyle, fontSize: 15, color: '#6b7280' }}>อายุใบอนุญาตที่สามารถสมัครได้ (ปี)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => onChange({ ageLimit: Math.max(0, data.ageLimit - 1) })}
                  style={{ width: 32, height: 42, border: '1px solid #e5e6f0', borderRadius: 6, backgroundColor: '#fff', cursor: 'pointer', fontSize: 20, color: '#6b7280' }}
                >−</button>
                <input
                  type="number" min="0"
                  value={data.ageLimit}
                  onChange={e => onChange({ ageLimit: Number(e.target.value) })}
                  style={{ ...inputStyle, width: 80, textAlign: 'center' }}
                />
                <button
                  onClick={() => onChange({ ageLimit: data.ageLimit + 1 })}
                  style={{ width: 32, height: 42, border: '1px solid #e5e6f0', borderRadius: 6, backgroundColor: '#fff', cursor: 'pointer', fontSize: 20, color: '#6b7280' }}
                >+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Training date */}
        <DateTimeRow
          label="วันที่อบรม"
          startDate={data.trainingStartDate} onStartDate={v => onChange({ trainingStartDate: v })}
          startTime={data.trainingStartTime} onStartTime={v => onChange({ trainingStartTime: v })}
          endDate={data.trainingEndDate} onEndDate={v => onChange({ trainingEndDate: v })}
          endTime={data.trainingEndTime} onEndTime={v => onChange({ trainingEndTime: v })}
          oneDay={data.trainingOneDay} onOneDay={v => onChange({ trainingOneDay: v })}
        />

        {/* Booking date */}
        <DateTimeRow
          label="วันที่เปิดจอง"
          startDate={data.bookingStartDate} onStartDate={v => onChange({ bookingStartDate: v })}
          startTime={data.bookingStartTime} onStartTime={v => onChange({ bookingStartTime: v })}
          endDate={data.bookingEndDate} onEndDate={v => onChange({ bookingEndDate: v })}
          endTime={data.bookingEndTime} onEndTime={v => onChange({ bookingEndTime: v })}
          oneDay={data.bookingOneDay} onOneDay={v => onChange({ bookingOneDay: v })}
        />

        {/* Note */}
        <div>
          <label style={labelStyle}>หมายเหตุ</label>
          <textarea
            value={data.note}
            onChange={e => onChange({ note: e.target.value })}
            placeholder="ระบุ"
            rows={4}
            style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 34 }}>
        <button
          onClick={onCancel}
          style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-thai)', color: '#374151' }}
        >ยกเลิก</button>
        <button
          onClick={() => { if (validate()) onNext() }}
          style={{ padding: '10px 28px', borderRadius: 8, border: 'none', backgroundColor: '#1f4488', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-thai)' }}
        >ต่อไป</button>
      </div>
    </>
  )
}

// ─── Tutor Picker ─────────────────────────────────────────────────────────────

function TutorPicker({ selectedIDs, onChange }: { selectedIDs: string[]; onChange: (ids: string[]) => void }) {
  const { data } = useQuery({
    queryKey: ['admin-tutors-picker'],
    queryFn: () => adminService.getTutors({ page: 1, page_size: 200 }),
  })
  // Deduplicate by tutor_id to handle any duplicate seed data
  const allTutors = data?.data ?? []
  const seen = new Set<string>()
  const tutors = allTutors.filter(t => { if (seen.has(t.tutor_id)) return false; seen.add(t.tutor_id); return true })

  const toggle = (id: string) => {
    onChange(selectedIDs.includes(id) ? selectedIDs.filter(x => x !== id) : [...selectedIDs, id])
  }

  if (tutors.length === 0) {
    return <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#9ca3af', margin: 0 }}>ยังไม่มีผู้สอนในระบบ — กรุณาเพิ่มผู้สอนในเมนู &quot;ผู้สอน&quot; ก่อน</p>
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
      {tutors.map(t => {
        const sel = selectedIDs.includes(t.tutor_id)
        return (
          <div
            key={t.tutor_id}
            onClick={() => toggle(t.tutor_id)}
            style={{
              border: sel ? '2px solid #1f4488' : '1px solid #e5e6f0',
              borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
              display: 'flex', gap: 10, alignItems: 'center',
              backgroundColor: sel ? '#f0f4ff' : '#fff',
              transition: 'all 0.15s',
              position: 'relative',
            }}
          >
            {t.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#e8f0fd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#1f4488', fontFamily: 'var(--font-thai)' }}>
                {t.name.charAt(0)}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</p>
              <p style={{ fontFamily: 'var(--font-thai)', fontSize: 12, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.position}</p>
            </div>
            {sel && (
              <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#1f4488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={12} color="#fff" strokeWidth={3} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 2 Form ─────────────────────────────────────────────────────────────

function Step2Form({
  data, onChange, onBack, onSave, isSaving, selectedTutorIDs, onTutorChange, pendingDocs, onDocsChange,
}: {
  data: Step2Data
  onChange: (patch: Partial<Step2Data>) => void
  onBack: () => void
  onSave: () => void
  isSaving: boolean
  selectedTutorIDs: string[]
  onTutorChange: (ids: string[]) => void
  pendingDocs: { name: string; file: File }[]
  onDocsChange: (docs: { name: string; file: File }[]) => void
}) {
  function addOutcome() {
    if (data.outcomes.length >= 5) return
    onChange({ outcomes: [...data.outcomes, ''] })
  }
  function updateOutcome(i: number, v: string) {
    const arr = [...data.outcomes]; arr[i] = v; onChange({ outcomes: arr })
  }
  function removeOutcome(i: number) {
    onChange({ outcomes: data.outcomes.filter((_, idx) => idx !== i) })
  }

  function addScheduleRow() {
    onChange({ scheduleRows: [...data.scheduleRows, { start: '', end: '', activity: '' }] })
  }
  function updateScheduleRow(i: number, field: 'start' | 'end' | 'activity', v: string) {
    const arr = [...data.scheduleRows]; arr[i] = { ...arr[i], [field]: v }; onChange({ scheduleRows: arr })
  }
  function removeScheduleRow(i: number) {
    onChange({ scheduleRows: data.scheduleRows.filter((_, idx) => idx !== i) })
  }

  return (
    <>
      {/* Venue / Format */}
      <div style={cardStyle}>
        <p style={sectionTitleStyle}>รายละเอียด</p>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>สถานที่จัดอบรม</label>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            {(['online', 'onsite'] as const).map(f => (
              <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 16, fontFamily: 'var(--font-thai)', color: '#374151' }}>
                <input
                  type="radio" name="format" checked={data.format === f}
                  onChange={() => onChange({ format: f })}
                  style={{ width: 16, height: 16, accentColor: '#1f4488' }}
                />
                {f === 'online' ? 'สถานที่จัดอบรม : ออนไลน์' : 'สถานที่จัดอบรม : ออฟไลน์'}
              </label>
            ))}
          </div>

          {data.format === 'online' ? (
            <div>
              <label style={labelStyle}>แนบลิงก์วิดีโออบรม (zoom, google meet)</label>
              <input
                type="url" value={data.onlineLink}
                onChange={e => onChange({ onlineLink: e.target.value })}
                placeholder="แนบลิงก์"
                style={inputStyle}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>ที่อยู่สถานที่</label>
                <input type="text" value={data.locationStreet} onChange={e => onChange({ locationStreet: e.target.value })} placeholder="ระบุ" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>อำเภอ</label>
                <input type="text" value={data.locationDistrict} onChange={e => onChange({ locationDistrict: e.target.value })} placeholder="ระบุ" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>สถานที่</label>
                <input type="text" value={data.locationProvince} onChange={e => onChange({ locationProvince: e.target.value })} placeholder="สถานที่" style={inputStyle} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Learning outcomes */}
      <div style={cardStyle}>
        <p style={sectionTitleStyle}>สิ่งที่ได้จากคอร์สนี้</p>
        <label style={{ ...labelStyle, color: '#6b7280', fontSize: 15 }}>รายการหัวข้อ</label>
        {data.outcomes.map((o, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6b7280', fontFamily: 'var(--font-thai)' }}>{i + 1}</span>
            <input
              type="text" value={o}
              onChange={e => updateOutcome(i, e.target.value)}
              placeholder="หัวข้อ"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={() => removeOutcome(i)} style={{ width: 36, height: 42, border: 'none', borderRadius: 6, backgroundColor: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={15} color="#dc2626" />
            </button>
          </div>
        ))}
        <button
          onClick={addOutcome}
          disabled={data.outcomes.length >= 5}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 15, cursor: data.outcomes.length >= 5 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-thai)', color: '#374151', opacity: data.outcomes.length >= 5 ? 0.5 : 1 }}
        >
          <Plus size={14} />
          เพิ่ม {data.outcomes.length}/5
        </button>
      </div>

      {/* Schedule */}
      <div style={cardStyle}>
        <p style={sectionTitleStyle}>กำหนดการ</p>
        <label style={{ ...labelStyle, color: '#6b7280', fontSize: 15 }}>รายการกำหนดการ</label>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
          <thead>
            <tr>
              {['เวลาเริ่มต้น', 'เวลาสิ้นสุด', 'กำหนดการ', ''].map((h, i) => (
                <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 15, color: '#6b7280', borderBottom: '1px solid #f3f4f6', fontFamily: 'var(--font-thai)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.scheduleRows.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '6px 10px' }}>
                  <input type="time" value={row.start} onChange={e => updateScheduleRow(i, 'start', e.target.value)} style={{ ...inputStyle, width: 130 }} />
                </td>
                <td style={{ padding: '6px 10px' }}>
                  <input type="time" value={row.end} onChange={e => updateScheduleRow(i, 'end', e.target.value)} style={{ ...inputStyle, width: 130 }} />
                </td>
                <td style={{ padding: '6px 10px' }}>
                  <input type="text" value={row.activity} onChange={e => updateScheduleRow(i, 'activity', e.target.value)} placeholder="ระบุกำหนดการ" style={{ ...inputStyle }} />
                </td>
                <td style={{ padding: '6px 10px', width: 40 }}>
                  <button onClick={() => removeScheduleRow(i)} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, backgroundColor: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={14} color="#dc2626" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={addScheduleRow}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #1f4488', backgroundColor: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-thai)', color: '#1f4488' }}
        >
          <Plus size={14} />
          เพิ่มกำหนดการ
        </button>
      </div>

      {/* Contact info */}
      <div style={cardStyle}>
        <p style={sectionTitleStyle}>สอบถามข้อมูลเพิ่มเติม</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>เบอร์โทรศัพท์</label>
            <input type="text" value={data.contactPhone} onChange={e => onChange({ contactPhone: e.target.value })} placeholder="ระบุ" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>มือถือ</label>
            <input type="text" value={data.contactMobile} onChange={e => onChange({ contactMobile: e.target.value })} placeholder="ระบุ" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>อีเมล</label>
            <input type="email" value={data.contactEmail} onChange={e => onChange({ contactEmail: e.target.value })} placeholder="ระบุ" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Facebook</label>
            <input type="text" value={data.contactFacebook} onChange={e => onChange({ contactFacebook: e.target.value })} placeholder="ระบุ" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Line</label>
            <input type="text" value={data.contactLine} onChange={e => onChange({ contactLine: e.target.value })} placeholder="ระบุ" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div style={cardStyle}>
        <p style={sectionTitleStyle}>เอกสารแนบเพิ่มเติม</p>
        <label style={{ ...labelStyle, color: '#6b7280', fontSize: 15 }}>รายการเอกสาร</label>
        {pendingDocs.map((doc, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
            <span style={{ width: 28, textAlign: 'center', fontSize: 15, color: '#6b7280', fontFamily: 'var(--font-thai)', flexShrink: 0 }}>{i + 1}</span>
            <input
              type="text"
              value={doc.name}
              onChange={e => { const arr = [...pendingDocs]; arr[i] = { ...arr[i], name: e.target.value }; onDocsChange(arr) }}
              placeholder="ชื่อเอกสาร"
              style={{ ...inputStyle, flex: 1 }}
            />
            <span style={{ fontSize: 13, color: '#6b7280', fontFamily: 'var(--font-thai)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{doc.file.name}</span>
            <button onClick={() => onDocsChange(pendingDocs.filter((_, idx) => idx !== i))} style={{ width: 36, height: 42, border: 'none', borderRadius: 6, backgroundColor: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trash2 size={15} color="#dc2626" />
            </button>
          </div>
        ))}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #1f4488', backgroundColor: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-thai)', color: '#1f4488' }}>
          <Upload size={14} />
          อัปโหลดเอกสาร
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" style={{ display: 'none' }} onChange={e => {
            const file = e.target.files?.[0]
            if (file) { onDocsChange([...pendingDocs, { name: file.name.replace(/\.[^.]+$/, ''), file }]) }
            e.target.value = ''
          }} />
        </label>
      </div>

      {/* Tutors */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e6f0', padding: '24px 28px', marginBottom: 20 }}>
        <p style={sectionTitleStyle}>ผู้สอน <span style={{ fontSize: 13, fontWeight: 400, color: '#9ca3af' }}>(เลือกได้หลายคน)</span></p>
        <TutorPicker selectedIDs={selectedTutorIDs} onChange={onTutorChange} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 34 }}>
        <button
          onClick={onBack}
          style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-thai)', color: '#374151' }}
        >ย้อนกลับ</button>
        <button
          onClick={onSave}
          disabled={isSaving}
          style={{ padding: '10px 28px', borderRadius: 8, border: 'none', backgroundColor: '#1f4488', color: '#fff', fontSize: 16, fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-thai)', opacity: isSaving ? 0.7 : 1 }}
        >{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
      </div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreateCoursePage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTutorIDs, setSelectedTutorIDs] = useState<string[]>([])
  const [pendingDocs, setPendingDocs] = useState<{ name: string; file: File }[]>([])

  const [step1, setStep1] = useState<Step1Data>({
    thumbnail: null,
    thumbnailPreview: null,
    title: '',
    priceType: 'single',
    priceGeneral: '',
    priceAssociation: '',
    ageLimit: 0,
    trainingOneDay: false,
    trainingStartDate: '',
    trainingStartTime: '',
    trainingEndDate: '',
    trainingEndTime: '',
    bookingOneDay: false,
    bookingStartDate: '',
    bookingStartTime: '',
    bookingEndDate: '',
    bookingEndTime: '',
    note: '',
  })

  const [step2, setStep2] = useState<Step2Data>({
    format: 'online',
    onlineLink: '',
    locationStreet: '',
    locationDistrict: '',
    locationProvince: '',
    outcomes: [''],
    scheduleRows: [{ start: '', end: '', activity: '' }],
    contactPhone: '',
    contactMobile: '',
    contactEmail: '',
    contactFacebook: '',
    contactLine: '',
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      fd.append('title', step1.title)
      fd.append('description', step1.note || '-')
      fd.append('format', step2.format)
      if (step2.onlineLink) fd.append('online_meeting_link', step2.onlineLink)
      fd.append('price_type', step1.priceType)
      fd.append('price_general', String(Number(step1.priceGeneral) || 0))
      if (step1.priceType === 'dual') {
        fd.append('price_association', String(Number(step1.priceAssociation) || 0))
      }
      fd.append('is_published', 'false')
      if (step1.thumbnail) fd.append('thumbnail', step1.thumbnail)
      return courseService.createCourse(fd)
    },
    onSuccess: async (course) => {
      if (selectedTutorIDs.length > 0) {
        await courseService.setCourseTutors(course.course_id, selectedTutorIDs).catch(() => {})
      }
      for (const doc of pendingDocs) {
        await courseService.addDocument(course.course_id, doc.name, doc.file).catch(() => {})
      }
      toast.success('สร้างคอร์สสำเร็จ')
      router.push(`/admin/courses/${course.course_id}`)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่'),
  })

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '8px 0 32px', fontFamily: 'var(--font-thai)' }}>
      {/* Breadcrumb + back */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button
          onClick={() => (step === 1 ? router.push('/admin/courses') : setStep(1))}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280', fontFamily: 'var(--font-thai)' }}
        >
          <ChevronLeft size={16} />
          ย้อนกลับ
        </button>
        <span style={{ fontSize: 15, color: '#9ca3af', fontFamily: 'var(--font-thai)' }}>
          คอร์สอบรม / สร้างคอร์สอบรม
        </span>
      </div>

      <StepIndicator current={step} />

      {step === 1 ? (
        <Step1Form
          data={step1}
          onChange={patch => setStep1(prev => ({ ...prev, ...patch }))}
          onNext={() => setStep(2)}
          onCancel={() => router.push('/admin/courses')}
        />
      ) : (
        <Step2Form
          data={step2}
          onChange={patch => setStep2(prev => ({ ...prev, ...patch }))}
          onBack={() => setStep(1)}
          onSave={() => saveMutation.mutate()}
          isSaving={saveMutation.isPending}
          selectedTutorIDs={selectedTutorIDs}
          onTutorChange={setSelectedTutorIDs}
          pendingDocs={pendingDocs}
          onDocsChange={setPendingDocs}
        />
      )}
    </div>
  )
}
