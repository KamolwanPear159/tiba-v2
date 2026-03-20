'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, X, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { authService } from '@/lib/api/services/auth.service'
import IllustrationLogin from '@/components/admin/IllustrationLogin'

// ─── Modal step types ─────────────────────────────────────────────────────────

type ModalStep =
  | 'none'           // login page only
  | 'forgot'         // enter email
  | 'otp'            // enter OTP / reset token
  | 'new-password'   // enter new + confirm password
  | 'success'        // success notification
  | 'error'          // error notification
  | 'logout-confirm' // logout confirmation

// ─── Schemas ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้งาน'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
})

const forgotSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
})

const otpSchema = z.object({
  token: z.string().min(1, 'กรุณากรอกรหัส OTP'),
})

const newPasswordSchema = z
  .object({
    new_password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    confirm_password: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirm_password'],
  })

type LoginForm = z.infer<typeof loginSchema>
type ForgotForm = z.infer<typeof forgotSchema>
type OTPForm = z.infer<typeof otpSchema>
type NewPasswordForm = z.infer<typeof newPasswordSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────

const OTP_SECONDS = 5 * 60 // 5 minutes

function fieldClass(hasError?: boolean) {
  return `h-[37px] w-full border rounded-[10px] px-[15px] py-[5px] text-[15px] outline-none transition focus:ring-1 focus:ring-[#1f4488] ${
    hasError ? 'border-red-400 bg-red-50' : 'border-[#e5e6f0]'
  }`
}

// ─── Modal Overlay Wrapper ────────────────────────────────────────────────────

function ModalOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className="relative bg-white rounded-[20px] w-[500px] mx-4 p-[50px]"
        style={{ boxShadow: '0px 4px 10px 0px rgba(8, 34, 81, 0.1)' }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<ModalStep>('none')
  const [notifMsg, setNotifMsg] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [otpCountdown, setOtpCountdown] = useState(OTP_SECONDS)
  const [isResending, setIsResending] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ─── Login form ──────────────────────────────────────────────────────────────

  const {
    register: rl,
    handleSubmit: handleLogin,
    formState: { errors: le },
    setError: setLoginError,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  // ─── Forgot form ─────────────────────────────────────────────────────────────

  const {
    register: rfg,
    handleSubmit: handleForgot,
    formState: { errors: fge },
    reset: resetForgotForm,
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) })

  // ─── OTP form ────────────────────────────────────────────────────────────────

  const {
    register: ro,
    handleSubmit: handleOTP,
    formState: { errors: oe },
    reset: resetOTPForm,
    setError: setOTPError,
  } = useForm<OTPForm>({ resolver: zodResolver(otpSchema) })

  // ─── New password form ───────────────────────────────────────────────────────

  const {
    register: rnp,
    handleSubmit: handleNewPwd,
    formState: { errors: npe },
    reset: resetNewPwdForm,
    setError: setNewPwdError,
  } = useForm<NewPasswordForm>({ resolver: zodResolver(newPasswordSchema) })

  // ─── OTP Countdown ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (step === 'otp') {
      setOtpCountdown(OTP_SECONDS)
      timerRef.current = setInterval(() => {
        setOtpCountdown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current!)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [step])

  const fmtCountdown = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const result = await authService.adminLogin(data)
      localStorage.setItem('access_token', result.access_token)
      localStorage.setItem('user', JSON.stringify(result.user))
      router.push('/admin/dashboard')
    } catch {
      setLoginError('root', { message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' })
    } finally {
      setIsLoading(false)
    }
  }

  const onForgot = async (data: ForgotForm) => {
    try {
      await authService.forgotPassword(data.email)
      setResetEmail(data.email)
      setStep('otp')
    } catch {
      // Always proceed per API spec (prevent enumeration)
      setResetEmail(data.email)
      setStep('otp')
    }
  }

  const onResendOTP = async () => {
    setIsResending(true)
    try {
      await authService.forgotPassword(resetEmail)
      setOtpCountdown(OTP_SECONDS)
      timerRef.current = setInterval(() => {
        setOtpCountdown((c) => {
          if (c <= 1) { clearInterval(timerRef.current!); return 0 }
          return c - 1
        })
      }, 1000)
    } finally {
      setIsResending(false)
    }
  }

  const onVerifyOTP = (data: OTPForm) => {
    // The "OTP" is the reset token from the email link
    setResetToken(data.token)
    setStep('new-password')
  }

  const onSetNewPassword = async (data: NewPasswordForm) => {
    try {
      await authService.resetPassword({
        token: resetToken,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      })
      setNotifMsg('รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่')
      setStep('success')
    } catch {
      setOTPError('root' as never, { message: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ' })
      setNewPwdError('root' as never, { message: 'ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง' })
      setNotifMsg('เกิดข้อผิดพลาด ไม่สามารถรีเซ็ตรหัสผ่านได้')
      setStep('error')
    }
  }

  const closeModal = () => {
    setStep('none')
    setResetEmail('')
    setResetToken('')
    resetForgotForm()
    resetOTPForm()
    resetNewPwdForm()
  }

  const onLogout = async () => {
    try {
      await authService.logout()
    } finally {
      router.push('/admin/login')
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#edeef6]">
      <style>{`input::-ms-reveal, input::-ms-clear, input::-webkit-contacts-auto-fill-button, input::-webkit-credentials-auto-fill-button { display: none !important; }`}</style>

      {/* Background blobs */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ width: 1731, height: 1556, left: -24, top: -266 }}
      >
        <div className="absolute inset-[0_0_0_30.73%]">
          <img alt="" src="/blob-blue.svg" className="absolute block max-w-none size-full" />
        </div>
        <div className="absolute inset-[56.36%_23.7%_15.04%_45.9%]">
          <img alt="" src="/blob-green.svg" className="absolute block max-w-none size-full" />
        </div>
      </div>

      {/* Logo top-left */}
      <div className="absolute top-7 left-10 z-20">
        <img
          src="/assets/logo-admin.png"
          alt="สมาคมนายหน้าประกันภัยไทย"
          style={{ height: 60, width: 'auto' }}
        />
      </div>

      {/* ── Login Card ── */}
      <div
        className="relative z-10 w-[500px] mx-4 rounded-[20px] bg-white p-[50px]"
        style={{ boxShadow: '0px 4px 10px 0px rgba(8, 34, 81, 0.1)' }}
      >
        <div className="mb-5">
          <h1 className="text-[26px] font-bold leading-[30px] mb-[5px]" style={{ color: '#1f4488' }}>
            เข้าสู่ระบบ
          </h1>
          <p className="text-[16px] font-medium leading-5" style={{ color: '#515151' }}>TIBA BackOffice</p>
        </div>

        <form onSubmit={handleLogin(onLogin)} noValidate className="flex flex-col gap-5">

          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] font-normal" style={{ color: '#333' }}>ผู้ใช้งาน</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="ระบุผู้ใช้งาน"
              className={fieldClass(!!le.email)}
              {...rl('email')}
            />
            {le.email && <p className="text-xs text-red-500">{le.email.message}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] font-normal" style={{ color: '#333' }}>รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="ระบุรหัสผ่าน"
                className={fieldClass(!!le.password)}
                style={{ paddingRight: 40 }}
                {...rl('password')}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...({ 'data-1p-ignore': true } as any)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8c8c] hover:text-[#515151]"
                tabIndex={-1}
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {le.password && <p className="text-xs text-red-500">{le.password.message}</p>}
          </div>

          {/* Forgot password */}
          <div className="flex justify-end -mt-2">
            <button
              type="button"
              onClick={() => setStep('forgot')}
              className="text-[14px] font-medium hover:underline"
              style={{ color: '#086d38' }}
            >
              ลืมรหัสผ่าน?
            </button>
          </div>

          {/* Root error */}
          {le.root && (
            <p className="text-sm text-red-500 text-center -mt-2">{le.root.message}</p>
          )}

          {/* Submit */}
          <div className="flex justify-center pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="h-[37px] px-[48px] py-[5px] rounded-[10px] text-[15px] font-normal text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1f4488' }}
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom illustration */}
      <div className="absolute bottom-0 left-0 z-10 pointer-events-none select-none">
        <IllustrationLogin />
      </div>

      {/* ════════════════════════════════════════════
          MODAL: Forgot Password — enter email
          ════════════════════════════════════════════ */}
      {step === 'forgot' && (
        <ModalOverlay>
          <button onClick={closeModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-[22px] font-bold mb-1" style={{ color: '#1f4488' }}>ลืมรหัสผ่าน</h2>
          <p className="text-[15px] mb-6" style={{ color: '#515151' }}>กรอกอีเมลที่ผูกกับบัญชีของคุณ</p>

          <form onSubmit={handleForgot(onForgot)} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-normal" style={{ color: '#333' }}>อีเมล</label>
              <input
                type="email"
                placeholder="ระบุอีเมล"
                className={fieldClass(!!fge.email)}
                {...rfg('email')}
              />
              {fge.email && <p className="text-xs text-red-500">{fge.email.message}</p>}
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="h-[37px] px-6 rounded-[10px] text-[14px] border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="h-[37px] px-6 rounded-[10px] text-[14px] font-normal text-white hover:opacity-90"
                style={{ backgroundColor: '#1f4488' }}
              >
                ส่ง OTP
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ════════════════════════════════════════════
          MODAL: Confirm OTP
          ════════════════════════════════════════════ */}
      {step === 'otp' && (
        <ModalOverlay>
          <button
            onClick={() => setStep('forgot')}
            className="absolute top-5 left-5 text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button onClick={closeModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-[22px] font-bold mb-1" style={{ color: '#1f4488' }}>ยืนยัน OTP</h2>
          <p className="text-[14px] mb-1" style={{ color: '#515151' }}>
            ระบบส่งรหัสยืนยันไปยัง <span className="font-semibold">{resetEmail}</span>
          </p>
          <p className="text-[13px] text-gray-400 mb-6">กรุณากรอก Token จากลิงก์ในอีเมลของคุณ</p>

          <form onSubmit={handleOTP(onVerifyOTP)} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-normal" style={{ color: '#333' }}>รหัส OTP</label>
              <input
                type="text"
                placeholder="กรอกรหัสยืนยัน"
                className={fieldClass(!!oe.token)}
                {...ro('token')}
              />
              {oe.token && <p className="text-xs text-red-500">{oe.token.message}</p>}
            </div>

            {/* Countdown + Resend */}
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: otpCountdown > 0 ? '#515151' : '#ef4444' }}>
                {otpCountdown > 0
                  ? `รหัสหมดอายุใน ${fmtCountdown(otpCountdown)}`
                  : 'รหัสหมดอายุแล้ว'}
              </span>
              <button
                type="button"
                onClick={onResendOTP}
                disabled={otpCountdown > 0 || isResending}
                className="text-[14px] font-medium disabled:opacity-40"
                style={{ color: '#086d38' }}
              >
                {isResending ? 'กำลังส่ง...' : 'ส่งอีกครั้ง'}
              </button>
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep('forgot')}
                className="h-[37px] px-6 rounded-[10px] text-[14px] border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                ย้อนกลับ
              </button>
              <button
                type="submit"
                className="h-[37px] px-6 rounded-[10px] text-[14px] font-normal text-white hover:opacity-90"
                style={{ backgroundColor: '#1f4488' }}
              >
                ยืนยัน
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ════════════════════════════════════════════
          MODAL: Set New Password
          ════════════════════════════════════════════ */}
      {step === 'new-password' && (
        <ModalOverlay>
          <button onClick={closeModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-[22px] font-bold mb-1" style={{ color: '#1f4488' }}>ตั้งรหัสผ่านใหม่</h2>
          <p className="text-[15px] mb-6" style={{ color: '#515151' }}>
            รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร
          </p>

          <form onSubmit={handleNewPwd(onSetNewPassword)} noValidate className="flex flex-col gap-5">

            {/* New password */}
            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-normal" style={{ color: '#333' }}>รหัสผ่านใหม่</label>
              <input
                type="password"
                placeholder="ระบุรหัสผ่านใหม่"
                className={fieldClass(!!npe.new_password)}
                {...rnp('new_password')}
              />
              {npe.new_password && <p className="text-xs text-red-500">{npe.new_password.message}</p>}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-normal" style={{ color: '#333' }}>ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                placeholder="ระบุรหัสผ่านอีกครั้ง"
                className={fieldClass(!!npe.confirm_password)}
                {...rnp('confirm_password')}
              />
              {npe.confirm_password && <p className="text-xs text-red-500">{npe.confirm_password.message}</p>}
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep('otp')}
                className="h-[37px] px-6 rounded-[10px] text-[14px] border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="h-[37px] px-6 rounded-[10px] text-[14px] font-normal text-white hover:opacity-90"
                style={{ backgroundColor: '#1f4488' }}
              >
                ยืนยัน
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ════════════════════════════════════════════
          MODAL: Success Notification
          ════════════════════════════════════════════ */}
      {step === 'success' && (
        <ModalOverlay>
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-[20px] font-bold mb-2" style={{ color: '#1f4488' }}>สำเร็จ</h2>
            <p className="text-[14px] text-gray-500 mb-6">{notifMsg}</p>
            <button
              onClick={closeModal}
              className="w-full h-[37px] rounded-[10px] text-[15px] font-normal text-white hover:opacity-90"
              style={{ backgroundColor: '#1f4488' }}
            >
              ปิด
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* ════════════════════════════════════════════
          MODAL: Error Notification
          ════════════════════════════════════════════ */}
      {step === 'error' && (
        <ModalOverlay>
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-[20px] font-bold mb-2 text-gray-900">ไม่สำเร็จ</h2>
            <p className="text-[14px] text-gray-500 mb-6">{notifMsg}</p>
            <button
              onClick={closeModal}
              className="w-full h-[37px] rounded-[10px] text-[15px] font-normal text-white hover:opacity-90"
              style={{ backgroundColor: '#1f4488' }}
            >
              ปิด
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* ════════════════════════════════════════════
          MODAL: Logout Confirmation
          (triggered externally via setStep('logout-confirm'))
          ════════════════════════════════════════════ */}
      {step === 'logout-confirm' && (
        <ModalOverlay>
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <h2 className="text-[20px] font-bold mb-2 text-gray-900">ออกจากระบบ</h2>
            <p className="text-[14px] text-gray-500 mb-6">คุณต้องการออกจากระบบใช่หรือไม่?</p>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 h-[37px] rounded-[10px] text-[14px] border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={onLogout}
                className="flex-1 h-[37px] rounded-[10px] text-[14px] font-normal text-white hover:opacity-90"
                style={{ backgroundColor: '#ef4444' }}
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  )
}
