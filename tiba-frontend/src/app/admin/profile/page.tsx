'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Camera, Pencil, Eye, EyeOff, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { getImageUrl } from '@/lib/utils/format'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  avatar_url?: string
  username?: string
}

interface ActivityLog {
  id: string
  created_at: string
  action: string
  description: string
  device?: string
}

// ─── API helpers ──────────────────────────────────────────────────────────────

function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('access_token') ?? ''
}

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      ...(opts?.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, actionLabel, onAction, children }: {
  title: string
  actionLabel?: string
  onAction?: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="bg-white rounded-2xl"
      style={{ padding: 30, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0', marginBottom: 24 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', fontFamily: 'var(--font-thai)' }}>{title}</h2>
        {actionLabel && (
          <button
            onClick={onAction}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 8,
              background: '#1f4488', color: '#fff', border: 'none',
              fontSize: 15, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'var(--font-thai)',
            }}
          >
            <Pencil style={{ width: 13, height: 13 }} />
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 14, color: '#9ca3af', fontFamily: 'var(--font-thai)' }}>{label}</span>
      <span style={{ fontSize: 17, color: '#1f2937', fontWeight: 500, fontFamily: 'var(--font-thai)' }}>{value || '—'}</span>
    </div>
  )
}

function FieldGroup({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 16, fontWeight: 500, color: '#374151', fontFamily: 'var(--font-thai)' }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 14, color: '#ef4444', fontFamily: 'var(--font-thai)' }}>{error}</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 14px',
  border: '1.5px solid #e5e7eb', borderRadius: 8,
  fontSize: 16, fontFamily: 'var(--font-thai)', color: '#1f2937',
  outline: 'none', background: '#fff',
  boxSizing: 'border-box',
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

function EditProfileModal({ profile, onClose, onSaved }: {
  profile: Profile
  onClose: () => void
  onSaved: (p: Profile) => void
}) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url ? getImageUrl(profile.avatar_url) ?? profile.avatar_url : null
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<{
    first_name: string; last_name: string; email: string; phone: string
  }>({
    defaultValues: {
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      email: profile.email ?? '',
      phone: profile.phone ?? '',
    },
  })

  const onSubmit = async (data: { first_name: string; last_name: string; email: string; phone: string }) => {
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => fd.append(k, v))
      if (avatarFile) fd.append('avatar', avatarFile)

      const res = await fetch(`${API}/admin/profile`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      onSaved(json?.data ?? json)
      onClose()
    } catch {
      setError('บันทึกไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1f4488', marginBottom: 24, fontFamily: 'var(--font-thai)' }}>
        แก้ไขข้อมูลส่วนตัว
      </h2>

      {/* Avatar upload */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="relative cursor-pointer"
          onClick={() => fileRef.current?.click()}
          style={{ width: 90, height: 90 }}
        >
          <div
            className="rounded-full overflow-hidden flex items-center justify-center bg-gray-100"
            style={{ width: 90, height: 90, border: '3px solid #e5e7eb' }}
          >
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 32, color: '#9ca3af' }}>👤</span>
            }
          </div>
          <div
            className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-[#1f4488]"
            style={{ width: 28, height: 28 }}
          >
            <Camera style={{ width: 14, height: 14, color: '#fff' }} />
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)) }
          }}
        />
        <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 6, fontFamily: 'var(--font-thai)' }}>คลิกเพื่อเปลี่ยนรูป</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FieldGroup label="ชื่อ" error={errors.first_name?.message}>
            <input style={inputStyle} placeholder="ชื่อ" {...register('first_name', { required: 'กรุณากรอกชื่อ' })} />
          </FieldGroup>
          <FieldGroup label="นามสกุล" error={errors.last_name?.message}>
            <input style={inputStyle} placeholder="นามสกุล" {...register('last_name', { required: 'กรุณากรอกนามสกุล' })} />
          </FieldGroup>
        </div>
        <FieldGroup label="เบอร์โทรศัพท์" error={errors.phone?.message}>
          <input style={inputStyle} placeholder="0x-xxxx-xxxx" type="tel" {...register('phone')} />
        </FieldGroup>
        <FieldGroup label="อีเมล" error={errors.email?.message}>
          <input style={inputStyle} placeholder="email@example.com" type="email" {...register('email', { required: 'กรุณากรอกอีเมล' })} />
        </FieldGroup>
        {error && <p style={{ fontSize: 15, color: '#ef4444', fontFamily: 'var(--font-thai)' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 8, border: '1.5px solid #d1d5db', background: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-thai)' }}>
            ยกเลิก
          </button>
          <button type="submit" disabled={saving} style={{ flex: 1, height: 42, borderRadius: 8, border: 'none', background: '#1f4488', color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-thai)', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  )
}

// ─── Edit Account Modal ───────────────────────────────────────────────────────

function EditAccountModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<{
    username: string; new_password: string; confirm_password: string
  }>({
    defaultValues: { username: profile.username ?? profile.email ?? '' },
  })

  const onSubmit = async (data: { username: string; new_password: string; confirm_password: string }) => {
    setSaving(true)
    setError('')
    try {
      await fetch(`${API}/admin/profile/change-password`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.username, new_password: data.new_password, confirm_password: data.confirm_password }),
      })
      setSuccess(true)
      setTimeout(() => { onClose() }, 1500)
    } catch {
      setError('บันทึกไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1f4488', marginBottom: 24, fontFamily: 'var(--font-thai)' }}>
        แก้ไขบัญชีผู้ใช้งาน
      </h2>
      {success ? (
        <div className="text-center py-6">
          <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
          <p style={{ fontSize: 17, color: '#059669', fontFamily: 'var(--font-thai)' }}>บันทึกสำเร็จ</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FieldGroup label="ชื่อบัญชีใช้งาน" error={errors.username?.message}>
            <input style={inputStyle} placeholder="username หรือ email" {...register('username', { required: 'กรุณากรอกชื่อบัญชี' })} />
          </FieldGroup>
          <FieldGroup label="รหัสผ่านใหม่" error={errors.new_password?.message}>
            <div className="relative">
              <input
                style={{ ...inputStyle, paddingRight: 42 }}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                type={showPwd ? 'text' : 'password'}
                {...register('new_password', { minLength: { value: 8, message: 'อย่างน้อย 8 ตัวอักษร' } })}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {showPwd ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </FieldGroup>
          <FieldGroup label="ยืนยันรหัสผ่านใหม่" error={errors.confirm_password?.message}>
            <div className="relative">
              <input
                style={{ ...inputStyle, paddingRight: 42 }}
                placeholder="ยืนยันรหัสผ่าน"
                type={showConfirm ? 'text' : 'password'}
                {...register('confirm_password', {
                  validate: (v) => v === watch('new_password') || 'รหัสผ่านไม่ตรงกัน',
                })}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {showConfirm ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </FieldGroup>
          {error && <p style={{ fontSize: 15, color: '#ef4444', fontFamily: 'var(--font-thai)' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 8, border: '1.5px solid #d1d5db', background: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-thai)' }}>ยกเลิก</button>
            <button type="submit" disabled={saving} style={{ flex: 1, height: 42, borderRadius: 8, border: 'none', background: '#1f4488', color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-thai)', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      )}
    </ModalOverlay>
  )
}

// ─── Modal overlay wrapper ────────────────────────────────────────────────────

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] w-full mx-4"
        style={{ maxWidth: 480, padding: 38, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile>({})
  const [loading, setLoading] = useState(true)
  const [editProfile, setEditProfile] = useState(false)
  const [editAccount, setEditAccount] = useState(false)

  // Activity logs
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const PER_PAGE = 10

  // Load profile
  useEffect(() => {
    apiFetch('/admin/profile')
      .then((d) => setProfile(d?.data ?? d))
      .catch(() => {
        // Fallback to localStorage user
        try {
          const u = JSON.parse(localStorage.getItem('user') ?? '{}')
          setProfile({ email: u.email, first_name: u.first_name, last_name: u.last_name, username: u.email })
        } catch {}
      })
      .finally(() => setLoading(false))
  }, [])

  // Load activity logs
  useEffect(() => {
    setLogsLoading(true)
    const params = new URLSearchParams({ page: String(page), per_page: String(PER_PAGE) })
    if (search) params.set('search', search)
    if (dateFilter) params.set('date', dateFilter)

    apiFetch(`/admin/activity-logs?${params}`)
      .then((d) => {
        const items = d?.data ?? d?.items ?? d ?? []
        setLogs(Array.isArray(items) ? items : [])
        setTotalPages(d?.meta?.last_page ?? d?.total_pages ?? (Math.ceil((d?.total ?? items.length) / PER_PAGE) || 1))
      })
      .catch(() => setLogs([]))
      .finally(() => setLogsLoading(false))
  }, [page, search, dateFilter])

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'ผู้ดูแลระบบ'
  const avatarSrc = profile.avatar_url ? (getImageUrl(profile.avatar_url) ?? profile.avatar_url) : null
  const initials = fullName.charAt(0).toUpperCase()

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400" style={{ fontFamily: 'var(--font-thai)' }}>กำลังโหลด...</div>
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Section 1: ข้อมูล ── */}
      <SectionCard title="ข้อมูลส่วนตัว" actionLabel="แก้ไขข้อมูล" onAction={() => setEditProfile(true)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Avatar */}
          <div
            className="rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ width: 80, height: 80, background: '#1f4488', overflow: 'hidden', border: '3px solid #e5e7eb' }}
          >
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 30, color: '#fff', fontWeight: 700 }}>{initials}</span>
            }
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px 32px', flex: 1 }}>
            <LabelValue label="ชื่อ-นามสกุล" value={fullName} />
            <LabelValue label="เบอร์โทรศัพท์" value={profile.phone ?? ''} />
            <LabelValue label="อีเมล" value={profile.email ?? ''} />
          </div>
        </div>
      </SectionCard>

      {/* ── Section 2: บัญชีผู้ใช้งาน ── */}
      <SectionCard title="บัญชีผู้ใช้งาน" actionLabel="แก้ไขบัญชี" onAction={() => setEditAccount(true)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
          <LabelValue label="ชื่อบัญชีใช้งาน" value={profile.username ?? profile.email ?? ''} />
          <LabelValue label="รหัสผ่าน" value="••••••••" />
        </div>
      </SectionCard>

      {/* ── Section 3: ประวัติการใช้งาน ── */}
      <SectionCard title="ประวัติการใช้งาน">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af' }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="ค้นหา..."
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1) }}
            style={{ ...inputStyle, width: 160, cursor: 'pointer' }}
          />
        </div>

        {/* Table */}
        <div style={{ borderRadius: 10, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['วันที่', 'การกระทำ', 'รายละเอียด', 'อุปกรณ์'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 15, fontWeight: 600, color: '#6b7280', fontFamily: 'var(--font-thai)', borderBottom: '1px solid #f0f0f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logsLoading ? (
                <tr><td colSpan={4} style={{ padding: '26px', textAlign: 'center', color: '#9ca3af', fontFamily: 'var(--font-thai)' }}>กำลังโหลด...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '26px', textAlign: 'center', color: '#9ca3af', fontFamily: 'var(--font-thai)' }}>ไม่มีข้อมูล</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '10px 14px', fontSize: 15, color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {log.created_at ? new Date(log.created_at).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 16, color: '#1f2937', fontFamily: 'var(--font-thai)' }}>{log.action}</td>
                  <td style={{ padding: '10px 14px', fontSize: 15, color: '#4b5563', fontFamily: 'var(--font-thai)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.description}</td>
                  <td style={{ padding: '10px 14px', fontSize: 15, color: '#9ca3af', fontFamily: 'var(--font-thai)' }}>{log.device ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
            </button>
            <span style={{ fontSize: 15, color: '#6b7280' }}>หน้า {page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}
            >
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}
      </SectionCard>

      {/* Modals */}
      {editProfile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditProfile(false)}
          onSaved={(p) => setProfile((prev) => ({ ...prev, ...p }))}
        />
      )}
      {editAccount && (
        <EditAccountModal profile={profile} onClose={() => setEditAccount(false)} />
      )}
    </div>
  )
}
