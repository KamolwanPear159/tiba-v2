'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginMember } from '@/lib/api/services/member.service'

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) { setError('กรุณากรอกอีเมล'); return }
    if (!password) { setError('กรุณากรอกรหัสผ่าน'); return }

    setIsLoading(true)
    try {
      await loginMember(email, password)
      router.push('/courses')
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      setError(msg)
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
        gap: 32,
        alignItems: 'center',
      }}
    >
      {/* Logo */}
      <img
        src="/assets/footer-logo.png"
        alt="TIBA"
        style={{ height: 56, objectFit: 'contain' }}
      />

      {/* Title */}
      <p
        style={{
          fontFamily: 'var(--font-thai)',
          fontWeight: 700,
          fontSize: 28,
          lineHeight: '36px',
          color: '#132953',
          margin: 0,
        }}
      >
        เข้าสู่ระบบ
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}
      >
        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label
            style={{
              fontFamily: 'var(--font-thai)',
              fontSize: 16,
              lineHeight: '20px',
              color: '#0a0a0a',
            }}
          >
            อีเมล
          </label>
          <FieldInput
            type="email"
            autoComplete="email"
            placeholder="example@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label
            style={{
              fontFamily: 'var(--font-thai)',
              fontSize: 16,
              lineHeight: '20px',
              color: '#0a0a0a',
            }}
          >
            รหัสผ่าน
          </label>
          <div style={{ position: 'relative' }}>
            <FieldInput
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
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
              {showPassword ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" stroke="#7b7b7b" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3" stroke="#7b7b7b" strokeWidth="1.5" />
                  <path d="M3 3l18 18" stroke="#7b7b7b" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" stroke="#7b7b7b" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3" stroke="#7b7b7b" strokeWidth="1.5" />
                </svg>
              )}
            </button>
          </div>

          {/* Forgot password */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              href="/forgot-password"
              style={{
                fontFamily: 'var(--font-thai)',
                fontSize: 14,
                color: '#1f4488',
                textDecoration: 'none',
              }}
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p
            style={{
              fontFamily: 'var(--font-thai)',
              fontSize: 14,
              color: '#ec221f',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
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
          {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      {/* Register link */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-thai)',
            fontSize: 16,
            lineHeight: '20px',
            color: '#0a0a0a',
          }}
        >
          ยังไม่มีบัญชี?
        </span>
        <Link
          href="/register"
          style={{
            fontFamily: 'var(--font-thai)',
            fontSize: 16,
            lineHeight: '20px',
            color: '#1f4488',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          สมัครสมาชิก
        </Link>
      </div>

      {/* Admin login link */}
      <div style={{ borderTop: '1px solid #f0f0f0', width: '100%', paddingTop: 16, textAlign: 'center' }}>
        <Link
          href="/admin/login"
          style={{
            fontFamily: 'var(--font-thai)',
            fontSize: 14,
            color: '#7b7b7b',
            textDecoration: 'none',
          }}
        >
          เข้าสู่ระบบแอดมิน
        </Link>
      </div>
    </div>
  )
}
