'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PublicHeader from '@/components/layout/PublicHeader'
import PublicFooter from '@/components/layout/PublicFooter'
import { changePassword } from '@/lib/api/services/member.service'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldInput({
  error,
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        height: 48,
        padding: '0 16px',
        border: `1px solid ${error ? '#ec221f' : '#dfdfdf'}`,
        borderRadius: 8,
        outline: 'none',
        background: '#fff',
        fontFamily: 'var(--font-thai)',
        fontSize: 16,
        color: '#0a0a0a',
        boxSizing: 'border-box',
        ...style,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = '#1f4488' }}
      onBlur={e => { e.currentTarget.style.borderColor = error ? '#ec221f' : '#dfdfdf' }}
    />
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontFamily: 'var(--font-thai)', fontSize: 15, lineHeight: '20px', color: '#374151', fontWeight: 500 }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontFamily: 'var(--font-thai)', fontSize: 12, color: '#ec221f', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  )
}

function PasswordField({
  label,
  error,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string
  error?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <Field label={label} error={error}>
      <div style={{ position: 'relative' }}>
        <FieldInput
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || '••••••••'}
          error={!!error}
          autoComplete={autoComplete}
          style={{ paddingRight: 52 }}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" stroke="#7b7b7b" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3" stroke="#7b7b7b" strokeWidth="1.5" />
            {show && <path d="M3 3l18 18" stroke="#7b7b7b" strokeWidth="1.5" strokeLinecap="round" />}
          </svg>
        </button>
      </div>
    </Field>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 48,
        height: 28,
        borderRadius: 99,
        background: checked ? '#1f4488' : '#d1d5db',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s',
        }}
      />
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordGlobalError, setPasswordGlobalError] = useState('')

  // Notification settings state
  const [emailNotif, setEmailNotif] = useState(true)
  const [courseNotif, setCourseNotif] = useState(true)
  const [paymentNotif, setPaymentNotif] = useState(true)
  const [notifSaved, setNotifSaved] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('member_token')
    if (!token) router.replace('/login')
  }, [router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordErrors({})
    setPasswordSuccess('')
    setPasswordGlobalError('')

    const errs: Record<string, string> = {}
    if (!currentPassword) errs.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน'
    if (!newPassword || newPassword.length < 8) errs.newPassword = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร'
    if (newPassword !== confirmPassword) errs.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    setPasswordErrors(errs)
    if (Object.keys(errs).length > 0) return

    setPasswordLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setPasswordSuccess('เปลี่ยนรหัสผ่านสำเร็จ')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordGlobalError(
        err?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาตรวจสอบรหัสผ่านปัจจุบัน',
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSaveNotifications = () => {
    // In a real app, this would call an API
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 3000)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <PublicHeader />

      <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Link href="/member/profile" style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#1f4488', textDecoration: 'none' }}>
            โปรไฟล์
          </Link>
          <span style={{ color: '#ccc' }}>/</span>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#555' }}>การตั้งค่า</span>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 28, color: '#132953', margin: '0 0 4px' }}>
            การตั้งค่า
          </h1>
          <p style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: '#7b7b7b', margin: 0 }}>
            จัดการรหัสผ่านและการแจ้งเตือน
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── Change Password ── */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '20px 28px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#eef3fb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#1f4488" strokeWidth="1.5" />
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="#1f4488" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1.5" fill="#1f4488" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 18, color: '#132953', margin: 0 }}>
                  เปลี่ยนรหัสผ่าน
                </h2>
                <p style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b', margin: 0 }}>
                  อัปเดตรหัสผ่านของท่านเพื่อความปลอดภัย
                </p>
              </div>
            </div>

            <form
              onSubmit={handleChangePassword}
              noValidate
              style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {passwordSuccess && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: 8,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" fill="#16a34a" fillOpacity="0.15" stroke="#16a34a" strokeWidth="1.5" />
                    <path d="M6 10l3 3 5-5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#166534' }}>{passwordSuccess}</span>
                </div>
              )}

              {passwordGlobalError && (
                <div
                  style={{
                    background: '#fff5f5',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    padding: '12px 16px',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#dc2626', margin: 0 }}>
                    {passwordGlobalError}
                  </p>
                </div>
              )}

              <PasswordField
                label="รหัสผ่านปัจจุบัน"
                value={currentPassword}
                onChange={setCurrentPassword}
                error={passwordErrors.currentPassword}
                placeholder="กรอกรหัสผ่านปัจจุบัน"
                autoComplete="current-password"
              />

              <PasswordField
                label="รหัสผ่านใหม่"
                value={newPassword}
                onChange={setNewPassword}
                error={passwordErrors.newPassword}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                autoComplete="new-password"
              />

              <PasswordField
                label="ยืนยันรหัสผ่านใหม่"
                value={confirmPassword}
                onChange={setConfirmPassword}
                error={passwordErrors.confirmPassword}
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    height: 44,
                    padding: '0 24px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: passwordLoading ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)',
                    fontFamily: 'var(--font-thai)',
                    fontWeight: 600,
                    fontSize: 15,
                    color: '#fff',
                    opacity: passwordLoading ? 0.7 : 1,
                  }}
                >
                  {passwordLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                </button>
              </div>
            </form>
          </div>

          {/* ── Notification settings ── */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '20px 28px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#126f38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#126f38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 18, color: '#132953', margin: 0 }}>
                  การแจ้งเตือน
                </h2>
                <p style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b', margin: 0 }}>
                  เลือกประเภทการแจ้งเตือนที่ต้องการ
                </p>
              </div>
            </div>

            <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                {
                  label: 'การแจ้งเตือนทางอีเมล',
                  desc: 'รับอีเมลสำหรับการแจ้งเตือนทุกประเภท',
                  value: emailNotif,
                  onChange: setEmailNotif,
                },
                {
                  label: 'ข่าวสารคอร์สอบรม',
                  desc: 'แจ้งเตือนเมื่อมีคอร์สใหม่หรือคอร์สที่กำลังเปิดรับสมัคร',
                  value: courseNotif,
                  onChange: setCourseNotif,
                },
                {
                  label: 'การชำระเงิน',
                  desc: 'แจ้งเตือนเมื่อสถานะการชำระเงินเปลี่ยนแปลง',
                  value: paymentNotif,
                  onChange: setPaymentNotif,
                },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none',
                    gap: 16,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-thai)',
                        fontWeight: 600,
                        fontSize: 15,
                        color: '#132953',
                        margin: '0 0 2px',
                      }}
                    >
                      {item.label}
                    </p>
                    <p style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b', margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                  <Toggle checked={item.value} onChange={item.onChange} />
                </div>
              ))}

              {notifSaved && (
                <p style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#16a34a', margin: '8px 0 0', textAlign: 'right' }}>
                  บันทึกการตั้งค่าแล้ว
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button
                  type="button"
                  onClick={handleSaveNotifications}
                  style={{
                    height: 44,
                    padding: '0 24px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)',
                    fontFamily: 'var(--font-thai)',
                    fontWeight: 600,
                    fontSize: 15,
                    color: '#fff',
                  }}
                >
                  บันทึกการตั้งค่า
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
