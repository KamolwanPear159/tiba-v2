'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sendOTP, verifyOTP, registerNormal } from '@/lib/api/services/member.service'

// ─── Shared input component ───────────────────────────────────────────────────

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
      <label
        style={{
          fontFamily: 'var(--font-thai)',
          fontSize: 16,
          lineHeight: '20px',
          color: '#0a0a0a',
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          style={{
            fontFamily: 'var(--font-thai)',
            fontSize: 12,
            color: '#ec221f',
            margin: 0,
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['ยืนยันอีเมล', 'ยืนยัน OTP', 'ข้อมูลส่วนตัว']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
      {steps.map((label, i) => {
        const num = i + 1
        const active = num === current
        const done = num < current
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: done ? '#126f38' : active ? '#1f4488' : '#dfdfdf',
                  color: '#fff',
                  fontFamily: 'var(--font-thai)',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l4 4 6-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : num}
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-thai)',
                  fontSize: 12,
                  color: active ? '#1f4488' : done ? '#126f38' : '#7b7b7b',
                  fontWeight: active ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  height: 2,
                  flex: 1,
                  background: done ? '#126f38' : '#dfdfdf',
                  marginBottom: 20,
                }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterNormalPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  // Step 2
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  // Step 3
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  // ── Step 1: send OTP ──
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setGlobalError('')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('กรุณากรอกอีเมลให้ถูกต้อง')
      return
    }
    setIsLoading(true)
    try {
      await sendOTP(email, 'register')
      setStep(2)
    } catch (err: any) {
      setGlobalError(err?.response?.data?.message || 'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 2: verify OTP ──
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError('')
    setGlobalError('')
    if (!otp || otp.length !== 6) {
      setOtpError('กรุณากรอก OTP 6 หลัก')
      return
    }
    setIsLoading(true)
    try {
      await verifyOTP(email, otp, 'register')
      setStep(3)
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || 'รหัส OTP ไม่ถูกต้อง')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 3: register ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!firstName) errs.firstName = 'กรุณากรอกชื่อ'
    if (!lastName) errs.lastName = 'กรุณากรอกนามสกุล'
    if (!phone || phone.length < 9) errs.phone = 'กรุณากรอกเบอร์โทรให้ถูกต้อง'
    if (!password || password.length < 8) errs.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    if (password !== confirmPassword) errs.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsLoading(true)
    setGlobalError('')
    try {
      await registerNormal({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone,
        address,
        otp_code: otp,
      })
      router.push('/member/profile')
    } catch (err: any) {
      setGlobalError(err?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0px 0px 24px rgba(0,0,0,0.10)',
        width: 480,
        padding: '48px 48px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        alignItems: 'center',
        maxHeight: '92vh',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1
          style={{
            fontFamily: 'var(--font-thai)',
            fontWeight: 700,
            fontSize: 24,
            color: '#132953',
            margin: 0,
          }}
        >
          สมัครสมาชิกทั่วไป
        </h1>
        <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', margin: 0 }}>
          สมัครฟรี ไม่มีค่าใช้จ่าย
        </p>
      </div>

      <StepIndicator current={step} />

      {globalError && (
        <p
          style={{
            fontFamily: 'var(--font-thai)',
            fontSize: 14,
            color: '#ec221f',
            margin: 0,
            textAlign: 'center',
            background: '#fff5f5',
            padding: '10px 16px',
            borderRadius: 8,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {globalError}
        </p>
      )}

      {/* ── Step 1 ── */}
      {step === 1 && (
        <form
          onSubmit={handleSendOTP}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}
        >
          <Field label="อีเมล" error={emailError}>
            <FieldInput
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={!!emailError}
              autoComplete="email"
            />
          </Field>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: 48,
              borderRadius: 8,
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)',
              fontFamily: 'var(--font-thai)',
              fontWeight: 600,
              fontSize: 16,
              color: '#fff',
              opacity: isLoading ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {isLoading ? 'กำลังส่ง OTP...' : 'ส่ง OTP'}
          </button>
        </form>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <form
          onSubmit={handleVerifyOTP}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-thai)',
              fontSize: 14,
              color: '#555',
              margin: 0,
              textAlign: 'center',
            }}
          >
            ส่ง OTP ไปที่ <strong>{email}</strong> แล้ว กรุณาตรวจสอบอีเมล
          </p>

          <Field label="รหัส OTP (6 หลัก)" error={otpError}>
            <FieldInput
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              error={!!otpError}
              style={{ letterSpacing: 8, textAlign: 'center', fontSize: 24 }}
            />
          </Field>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => { setStep(1); setOtp(''); setOtpError('') }}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 8,
                border: '1px solid #dfdfdf',
                background: '#fff',
                fontFamily: 'var(--font-thai)',
                fontSize: 16,
                color: '#0a0a0a',
                cursor: 'pointer',
              }}
            >
              ย้อนกลับ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 2,
                height: 48,
                borderRadius: 8,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)',
                fontFamily: 'var(--font-thai)',
                fontWeight: 600,
                fontSize: 16,
                color: '#fff',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'กำลังยืนยัน...' : 'ยืนยัน OTP'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleSendOTP}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-thai)',
              fontSize: 14,
              color: '#1f4488',
              textDecoration: 'underline',
              padding: 0,
              alignSelf: 'center',
            }}
          >
            ส่ง OTP อีกครั้ง
          </button>
        </form>
      )}

      {/* ── Step 3 ── */}
      {step === 3 && (
        <form
          onSubmit={handleRegister}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="ชื่อ" error={formErrors.firstName}>
              <FieldInput
                type="text"
                placeholder="สมชาย"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                error={!!formErrors.firstName}
              />
            </Field>
            <Field label="นามสกุล" error={formErrors.lastName}>
              <FieldInput
                type="text"
                placeholder="ใจดี"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                error={!!formErrors.lastName}
              />
            </Field>
          </div>

          <Field label="เบอร์โทรศัพท์" error={formErrors.phone}>
            <FieldInput
              type="tel"
              placeholder="08x-xxx-xxxx"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              error={!!formErrors.phone}
            />
          </Field>

          <Field label="ที่อยู่ (ไม่บังคับ)">
            <FieldInput
              type="text"
              placeholder="ที่อยู่"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </Field>

          <Field label="รหัสผ่าน" error={formErrors.password}>
            <div style={{ position: 'relative' }}>
              <FieldInput
                type={showPassword ? 'text' : 'password'}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={!!formErrors.password}
                style={{ paddingRight: 52 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
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
                  {showPassword && <path d="M3 3l18 18" stroke="#7b7b7b" strokeWidth="1.5" strokeLinecap="round" />}
                </svg>
              </button>
            </div>
          </Field>

          <Field label="ยืนยันรหัสผ่าน" error={formErrors.confirmPassword}>
            <div style={{ position: 'relative' }}>
              <FieldInput
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                error={!!formErrors.confirmPassword}
                style={{ paddingRight: 52 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
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
                  {showConfirm && <path d="M3 3l18 18" stroke="#7b7b7b" strokeWidth="1.5" strokeLinecap="round" />}
                </svg>
              </button>
            </div>
          </Field>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => { setStep(2); setFormErrors({}) }}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 8,
                border: '1px solid #dfdfdf',
                background: '#fff',
                fontFamily: 'var(--font-thai)',
                fontSize: 16,
                color: '#0a0a0a',
                cursor: 'pointer',
              }}
            >
              ย้อนกลับ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 2,
                height: 48,
                borderRadius: 8,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)',
                fontFamily: 'var(--font-thai)',
                fontWeight: 600,
                fontSize: 16,
                color: '#fff',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </div>
        </form>
      )}

      {/* Back to login */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b' }}>
          มีบัญชีอยู่แล้ว?
        </span>
        <Link
          href="/login"
          style={{
            fontFamily: 'var(--font-thai)',
            fontSize: 14,
            color: '#1f4488',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </div>
  )
}
