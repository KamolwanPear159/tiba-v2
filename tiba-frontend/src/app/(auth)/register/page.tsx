'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { authService } from '@/lib/api/services/auth.service'

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  first_name: z.string().min(1, 'กรุณากรอกชื่อ'),
  last_name: z.string().min(1, 'กรุณากรอกนามสกุล'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  phone: z.string().min(10, 'เบอร์โทรไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  confirm_password: z.string(),
  company_name: z.string().optional(),
  tax_id: z.string().optional(),
}).refine(d => d.password === d.confirm_password, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirm_password'],
})

type RegisterData = z.infer<typeof registerSchema>

// ─── Input helper ─────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#0a0a0a' }}>{label}</label>
      {children}
      {error && <p style={{ fontFamily: 'var(--font-thai)', fontSize: 12, color: '#ec221f', margin: 0 }}>{error}</p>}
    </div>
  )
}

function TextInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      style={{
        width: '100%', height: 48, padding: '0 16px', boxSizing: 'border-box',
        border: `1px solid ${error ? '#ec221f' : '#dfdfdf'}`,
        borderRadius: 8, outline: 'none', background: '#fff',
        fontFamily: 'var(--font-thai)', fontSize: 16, color: '#0a0a0a',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = '#1f4488' }}
      onBlur={e => { e.currentTarget.style.borderColor = error ? '#ec221f' : '#dfdfdf' }}
    />
  )
}

// ─── Check icon ───────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="#126f38" opacity="0.15"/>
      <path d="M7.5 12l3 3 6-6" stroke="#126f38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Membership cards (step 1) ────────────────────────────────────────────────

const GENERAL_FEATURES = [
  'เข้าถึงข้อมูลทั่วไปของเว็บไซต์',
  'อัพเดตข่าวสารต่างๆ ก่อนใคร',
  'รับสิทธิสมัครคอร์สอบรมของทางสมาคม',
]

const ASSOC_FEATURES = [
  'เข้าถึงข้อมูลทั่วไปของเว็บไซต์',
  'อัพเดตข่าวสารต่างๆ ก่อนใคร',
  'รับสิทธิสมัครคอร์สอบรมของทางสมาคม',
  'ได้รับการขึ้นโลโก้ของสมาคมในหน้าสมาชิก',
  'สามารถดาวน์โหลดประกาศต่างๆ ของสมาคมได้',
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [memberType, setMemberType] = useState<'general' | 'association'>('general')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      await authService.register({ ...data, member_type: memberType })
      toast.success('สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติ')
      router.push('/login')
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 1: member type selection ──
  if (step === 1) {
    return (
      // Break out of auth layout padding with negative margins + full-viewport overlay
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 64, padding: 80 }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img src="/assets/hero-bg.png" alt="" style={{ position: 'absolute', inset: 0, width: '110%', height: '132%', objectFit: 'cover', top: '-5%', left: '-5%', opacity: 0.8 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.4) 100%), linear-gradient(90deg, rgba(18,111,56,0.7) 0%, rgba(18,111,56,0.7) 100%)' }} />
        </div>

        {/* Title */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, lineHeight: 1, color: '#fff', margin: 0 }}>
            เลือกประเภทของสมาชิกที่ต้องการสมัคร
          </h1>
        </div>

        {/* Cards */}
        <div style={{ position: 'relative', display: 'flex', gap: 48, alignItems: 'stretch', justifyContent: 'center', width: '100%' }}>
          {/* General member card */}
          <div style={{ borderRadius: 16, boxShadow: '0px 0px 24px rgba(0,0,0,0.1)', width: 464, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Card header */}
            <div style={{ background: 'linear-gradient(200.34deg, #126f38 0%, #51ba7c 100%)', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 500, fontSize: 32, lineHeight: 1, color: 'rgba(255,255,255,0.7)', margin: 0 }}>สมาชิกทั่วไป</p>
              <p style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 48, lineHeight: 1, color: '#fff', margin: 0 }}>สมัครฟรี</p>
            </div>
            {/* Card body */}
            <div style={{ background: '#fff', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#0a0a0a', margin: 0 }}>
                  เหมาะสำหรับ บุคคลทั่วไปที่ต้องการ<br/>อัพเดตข่าวสารของสมาคมก่อนใคร
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {GENERAL_FEATURES.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <CheckIcon />
                      <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.5)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setMemberType('general'); setStep(2) }}
                style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(186.58deg, #126f38 0%, #51ba7c 100%)', fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff' }}
              >
                ลงทะเบียน
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          {/* Association member card */}
          <div style={{ borderRadius: 16, boxShadow: '0px 0px 24px rgba(0,0,0,0.1)', width: 464, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(200.34deg, #1f4488 0%, #6f8aba 100%)', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 500, fontSize: 32, lineHeight: 1, color: 'rgba(255,255,255,0.7)', margin: 0 }}>สมาชิกสมาคม</p>
              <p style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 48, lineHeight: 1, color: '#fff', margin: 0 }}>20,000.-</p>
            </div>
            <div style={{ background: '#fff', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#0a0a0a', margin: 0 }}>
                  เหมาะสำหรับ การก้าวสู่การเป็นนายหน้า<br/>ประกันมืออาชีพ
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ASSOC_FEATURES.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <CheckIcon />
                      <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.5)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setMemberType('association'); setStep(2) }}
                style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(186.58deg, #1f4488 0%, #6f8aba 100%)', fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff' }}
              >
                ลงทะเบียน
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2: registration form ──
  return (
    <div style={{
      background: '#fff', borderRadius: 16, boxShadow: '0px 0px 24px rgba(0,0,0,0.10)',
      width: 480, padding: '48px 48px 32px', display: 'flex', flexDirection: 'column', gap: 32,
      alignItems: 'center', maxHeight: '90vh', overflowY: 'auto',
    }}>
      <p style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 32, lineHeight: '40px', letterSpacing: '-0.16px', color: '#0a0a0a', margin: 0 }}>
        {memberType === 'general' ? 'สมาชิกทั่วไป' : 'สมาชิกสมาคม'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="ชื่อ" error={errors.first_name?.message}>
            <TextInput type="text" placeholder="สมชาย" error={!!errors.first_name} {...register('first_name')} />
          </Field>
          <Field label="นามสกุล" error={errors.last_name?.message}>
            <TextInput type="text" placeholder="ใจดี" error={!!errors.last_name} {...register('last_name')} />
          </Field>
        </div>

        <Field label="อีเมล" error={errors.email?.message}>
          <TextInput type="email" placeholder="example@email.com" error={!!errors.email} {...register('email')} />
        </Field>

        <Field label="เบอร์โทรศัพท์" error={errors.phone?.message}>
          <TextInput type="tel" placeholder="08x-xxx-xxxx" error={!!errors.phone} {...register('phone')} />
        </Field>

        {memberType === 'association' && (
          <>
            <Field label="ชื่อบริษัท/องค์กร" error={errors.company_name?.message}>
              <TextInput type="text" placeholder="บริษัท ... จำกัด" {...register('company_name')} />
            </Field>
            <Field label="เลขประจำตัวผู้เสียภาษี" error={errors.tax_id?.message}>
              <TextInput type="text" placeholder="0000000000000" {...register('tax_id')} />
            </Field>
          </>
        )}

        <Field label="รหัสผ่าน" error={errors.password?.message}>
          <div style={{ position: 'relative' }}>
            <TextInput type={showPassword ? 'text' : 'password'} placeholder="อย่างน้อย 8 ตัวอักษร" error={!!errors.password} style={{ paddingRight: 52 } as React.CSSProperties} {...register('password')} />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" stroke="#7b7b7b" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="#7b7b7b" strokeWidth="1.5"/></svg>
            </button>
          </div>
        </Field>

        <Field label="ยืนยันรหัสผ่าน" error={errors.confirm_password?.message}>
          <div style={{ position: 'relative' }}>
            <TextInput type={showConfirm ? 'text' : 'password'} placeholder="••••••••" error={!!errors.confirm_password} style={{ paddingRight: 52 } as React.CSSProperties} {...register('confirm_password')} />
            <button type="button" onClick={() => setShowConfirm(v => !v)}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" stroke="#7b7b7b" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="#7b7b7b" strokeWidth="1.5"/></svg>
            </button>
          </div>
        </Field>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="button" onClick={() => setStep(1)}
            style={{ flex: 1, height: 48, borderRadius: 8, border: '1px solid #dfdfdf', background: '#fff', fontFamily: 'var(--font-thai)', fontSize: 16, color: '#0a0a0a', cursor: 'pointer' }}>
            ย้อนกลับ
          </button>
          <button type="submit" disabled={isLoading}
            style={{ flex: 2, height: 48, borderRadius: 8, border: 'none', background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)', fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#0a0a0a' }}>มีบัญชีแล้ว?</span>
        <Link href="/login" style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#1f4488', textDecoration: 'none' }}>เข้าสู่ระบบ</Link>
      </div>
    </div>
  )
}
