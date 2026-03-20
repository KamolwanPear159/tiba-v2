'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/lib/api/services/auth.service'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
})

const forgotSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
})

type LoginFormData = z.infer<typeof loginSchema>
type ForgotFormData = z.infer<typeof forgotSchema>

// ─── Input component ──────────────────────────────────────────────────────────

function FieldInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      style={{
        width: '100%', height: 48, padding: '0 16px',
        border: `1px solid ${error ? '#ec221f' : '#dfdfdf'}`,
        borderRadius: 8, outline: 'none', background: '#fff',
        fontFamily: 'var(--font-thai)', fontSize: 16, color: '#0a0a0a',
        boxSizing: 'border-box',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = '#1f4488' }}
      onBlur={e => { e.currentTarget.style.borderColor = error ? '#ec221f' : '#dfdfdf' }}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotDone, setForgotDone] = useState(false)
  const [isForgotLoading, setIsForgotLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, setError } =
    useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const { register: rf, handleSubmit: handleForgot, formState: { errors: fe }, reset: resetForgot } =
    useForm<ForgotFormData>({ resolver: zodResolver(forgotSchema) })

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const result = await authService.login(data)
      localStorage.setItem('access_token', result.access_token)
      localStorage.setItem('user', JSON.stringify(result.user))
      router.push('/home')
    } catch {
      setError('root', { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    } finally {
      setIsLoading(false)
    }
  }

  const onForgot = async (data: ForgotFormData) => {
    setIsForgotLoading(true)
    try {
      await authService.forgotPassword(data.email)
    } finally {
      setForgotDone(true)
      setIsForgotLoading(false)
    }
  }

  const closeForgot = () => {
    setShowForgot(false)
    setForgotDone(false)
    resetForgot()
  }

  return (
    <>
      {/* ── Login Card ── */}
      <div style={{
        background: '#fff', borderRadius: 16, boxShadow: '0px 0px 24px rgba(0,0,0,0.10)',
        width: 480, padding: '48px 48px 32px', display: 'flex', flexDirection: 'column', gap: 32,
        alignItems: 'center',
      }}>
        {/* Title */}
        <p style={{
          fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 32,
          lineHeight: '40px', letterSpacing: '-0.16px', color: '#0a0a0a', margin: 0,
        }}>
          เข้าสู่ระบบ
        </p>

        {/* Fields */}
        <form onSubmit={handleSubmit(onLogin)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#0a0a0a' }}>
              อีเมล
            </label>
            <FieldInput type="email" autoComplete="email" error={!!errors.email} {...register('email')} />
            {errors.email && <p style={{ fontFamily: 'var(--font-thai)', fontSize: 12, color: '#ec221f', margin: 0 }}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#0a0a0a' }}>
              รหัสผ่าน
            </label>
            <div style={{ position: 'relative' }}>
              <FieldInput
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                error={!!errors.password}
                style={{ paddingRight: 52 } as React.CSSProperties}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" stroke="#7b7b7b" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="3" stroke="#7b7b7b" strokeWidth="1.5"/>
                    <path d="M3 3l18 18" stroke="#7b7b7b" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" stroke="#7b7b7b" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="3" stroke="#7b7b7b" strokeWidth="1.5"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p style={{ fontFamily: 'var(--font-thai)', fontSize: 12, color: '#ec221f', margin: 0 }}>{errors.password.message}</p>}

            {/* Forgot link */}
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#1f4488', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, alignSelf: 'flex-start' }}
            >
              ลืมรหัสผ่าน?
            </button>
          </div>

          {/* Root error */}
          {errors.root && (
            <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#ec221f', margin: 0, textAlign: 'center' }}>{errors.root.message}</p>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                height: 48, borderRadius: 8, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)',
                fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/admin/login')}
              style={{
                height: 48, borderRadius: 8, border: '1px solid #dfdfdf', cursor: 'pointer', background: '#fff',
                fontFamily: 'var(--font-eng)', fontSize: 16, lineHeight: '20px', color: '#0a0a0a',
              }}
            >
              เข้าสู่ระบบแอดมิน
            </button>
          </div>
        </form>

        {/* Register link */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#0a0a0a' }}>ยังไม่ได้เป็นสมาชิก?</span>
          <Link href="/register" style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#1f4488', textDecoration: 'none' }}>
            คลิกเพื่อลงทะเบียน
          </Link>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgot && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0px 0px 24px rgba(0,0,0,0.1)', width: 480, padding: '48px 48px 32px', position: 'relative' }}>
            <button onClick={closeForgot} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#7b7b7b' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>

            {!forgotDone ? (
              <>
                <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#0a0a0a', margin: '0 0 8px' }}>ลืมรหัสผ่าน</h2>
                <p style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#7b7b7b', margin: '0 0 24px' }}>กรอกอีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้</p>
                <form onSubmit={handleForgot(onForgot)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#0a0a0a' }}>อีเมล</label>
                    <FieldInput type="email" error={!!fe.email} {...rf('email')} />
                    {fe.email && <p style={{ fontFamily: 'var(--font-thai)', fontSize: 12, color: '#ec221f', margin: 0 }}>{fe.email.message}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={closeForgot}
                      style={{ flex: 1, height: 48, borderRadius: 8, border: '1px solid #dfdfdf', background: '#fff', fontFamily: 'var(--font-thai)', fontSize: 16, color: '#0a0a0a', cursor: 'pointer' }}>
                      ยกเลิก
                    </button>
                    <button type="submit" disabled={isForgotLoading}
                      style={{ flex: 1, height: 48, borderRadius: 8, border: 'none', background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)', fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff', cursor: 'pointer', opacity: isForgotLoading ? 0.7 : 1 }}>
                      {isForgotLoading ? 'กำลังส่ง...' : 'ส่งลิงก์'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e8f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#126f38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, color: '#0a0a0a', margin: '0 0 8px' }}>ส่งลิงก์เรียบร้อย</h2>
                <p style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#7b7b7b', margin: '0 0 24px' }}>กรุณาตรวจสอบอีเมลของคุณ<br/>และคลิกลิงก์เพื่อรีเซ็ตรหัสผ่าน</p>
                <button onClick={closeForgot}
                  style={{ width: '100%', height: 48, borderRadius: 8, border: 'none', background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)', fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff', cursor: 'pointer' }}>
                  ปิด
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
