'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PublicHeader from '@/components/layout/PublicHeader'
import PublicFooter from '@/components/layout/PublicFooter'
import { getMemberProfile, updateProfile, logoutMember } from '@/lib/api/services/member.service'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MemberProfile {
  id?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  member_type?: string
  membership_type?: string
  status?: string
  membership_status?: string
  org_name?: string
  tax_id?: string
}

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
        background: props.disabled ? '#f9fafb' : '#fff',
        fontFamily: 'var(--font-thai)',
        fontSize: 15,
        color: '#0a0a0a',
        boxSizing: 'border-box',
        ...style,
      }}
      onFocus={e => { if (!props.disabled) e.currentTarget.style.borderColor = '#1f4488' }}
      onBlur={e => { e.currentTarget.style.borderColor = error ? '#ec221f' : '#dfdfdf' }}
    />
  )
}

const MEMBER_TYPE_LABEL: Record<string, string> = {
  normal: 'สมาชิกทั่วไป',
  general: 'สมาชิกทั่วไป',
  association: 'สมาชิกสมาคม',
}

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  active:   { label: 'ใช้งานได้',   bg: '#f0fdf4', color: '#16a34a' },
  pending:  { label: 'รออนุมัติ',   bg: '#fffbea', color: '#d97706' },
  inactive: { label: 'ไม่ใช้งาน',  bg: '#f9fafb', color: '#6b7280' },
  approved: { label: 'อนุมัติแล้ว', bg: '#f0fdf4', color: '#16a34a' },
  rejected: { label: 'ปฏิเสธ',     bg: '#fef2f2', color: '#dc2626' },
}

function getMemberStatus(profile: MemberProfile) {
  const s = profile.membership_status || profile.status || 'active'
  return STATUS_MAP[s] ?? { label: s, bg: '#f5f5f5', color: '#555' }
}

// ─── Quick link card ──────────────────────────────────────────────────────────

function QuickLink({
  href,
  icon,
  label,
  desc,
  color,
}: {
  href: string
  icon: React.ReactNode
  label: string
  desc: string
  color: string
}) {
  return (
    <Link
      href={href}
      style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        textDecoration: 'none',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 15, color: '#132953', margin: '0 0 2px' }}>
          {label}
        </p>
        <p style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b', margin: 0 }}>
          {desc}
        </p>
      </div>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
        <path d="M7 4l6 6-6 6" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function MemberProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<MemberProfile>>({})
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [editLoading, setEditLoading] = useState(false)
  const [editSuccess, setEditSuccess] = useState('')
  const [editGlobalError, setEditGlobalError] = useState('')

  const showAssocBanner = searchParams?.get('registered') === 'association'

  useEffect(() => {
    const token = localStorage.getItem('member_token')
    if (!token) { router.replace('/login'); return }

    getMemberProfile()
      .then(data => {
        setProfile(data)
        setEditData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          address: data.address || '',
        })
      })
      .catch(err => {
        if (err?.response?.status === 401) {
          router.replace('/login')
        } else {
          setFetchError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
        }
      })
      .finally(() => setIsLoading(false))
  }, [router])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditErrors({})
    setEditSuccess('')
    setEditGlobalError('')

    const errs: Record<string, string> = {}
    if (!editData.first_name) errs.first_name = 'กรุณากรอกชื่อ'
    if (!editData.last_name) errs.last_name = 'กรุณากรอกนามสกุล'
    if (!editData.phone || editData.phone.length < 9) errs.phone = 'กรุณากรอกเบอร์โทรให้ถูกต้อง'
    setEditErrors(errs)
    if (Object.keys(errs).length > 0) return

    setEditLoading(true)
    try {
      const updated = await updateProfile(editData)
      setProfile(prev => ({ ...prev, ...updated }))
      setEditSuccess('บันทึกข้อมูลสำเร็จ')
      setIsEditing(false)
    } catch (err: any) {
      setEditGlobalError(err?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setEditLoading(false)
    }
  }

  const handleLogout = () => {
    logoutMember()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        <PublicHeader />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '4px solid #e5e7eb', borderTopColor: '#1f4488',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </main>
        <PublicFooter />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (fetchError || !profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        <PublicHeader />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#dc2626', marginBottom: 16 }}>
              {fetchError || 'ไม่พบข้อมูล'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ height: 40, padding: '0 20px', borderRadius: 8, border: 'none', background: '#1f4488', color: '#fff', fontFamily: 'var(--font-thai)', fontSize: 14, cursor: 'pointer' }}
            >
              ลองใหม่
            </button>
          </div>
        </main>
        <PublicFooter />
      </div>
    )
  }

  const memberTypeLabel = MEMBER_TYPE_LABEL[profile.member_type || profile.membership_type || ''] || 'สมาชิก'
  const statusInfo = getMemberStatus(profile)
  const avatarLetter = profile.first_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || 'U'
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || '—'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <PublicHeader />

      <main style={{ flex: 1, maxWidth: 960, margin: '0 auto', padding: '48px 24px', width: '100%' }}>

        {/* Association registration banner */}
        {showAssocBanner && (
          <div
            style={{
              background: '#fffbea', border: '1px solid #f59e0b', borderRadius: 12,
              padding: '16px 20px', marginBottom: 24,
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="11" cy="11" r="10" stroke="#f59e0b" strokeWidth="1.5" />
              <path d="M11 7v5M11 15.5v.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>
              <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 15, color: '#92400e', margin: '0 0 4px' }}>
                สมัครสมาชิกสมาคมสำเร็จ
              </p>
              <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#78350f', margin: 0 }}>
                บัญชีของท่านอยู่ระหว่างการตรวจสอบ ซึ่งอาจใช้เวลา 1-3 วันทำการ เราจะแจ้งให้ทราบทางอีเมล
              </p>
            </div>
          </div>
        )}

        {editSuccess && (
          <div
            style={{
              background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10,
              padding: '12px 16px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" fill="#16a34a" fillOpacity="0.15" stroke="#16a34a" strokeWidth="1.5" />
              <path d="M6 10l3 3 5-5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#166534' }}>{editSuccess}</span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >

          {/* ── Left ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Profile card */}
            <div
              style={{
                background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(225deg, rgb(18,111,56) 0%, rgb(81,186,124) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 32, color: '#fff', lineHeight: 1 }}>
                  {avatarLetter}
                </span>
              </div>

              <div>
                <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 20, color: '#132953', margin: '0 0 4px' }}>
                  {fullName}
                </p>
                <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', margin: '0 0 10px' }}>
                  {profile.email}
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99, background: '#eef3fb', color: '#1f4488', fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 12 }}>
                    {memberTypeLabel}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99, background: statusInfo.bg, color: statusInfo.color, fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 12 }}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%', height: 40, borderRadius: 8, border: '1.5px solid #fecaca',
                  background: '#fff', color: '#dc2626', fontFamily: 'var(--font-thai)',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 17l5-5-5-5M21 12H9" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                ออกจากระบบ
              </button>
            </div>

            {/* Quick links */}
            <QuickLink
              href="/member/courses"
              label="คอร์สของฉัน"
              desc="คอร์สที่ลงทะเบียนไว้"
              color="#eef3fb"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="#1f4488" strokeWidth="1.5" />
                  <path d="M3 9h18" stroke="#1f4488" strokeWidth="1.5" />
                  <path d="M8 2v3M16 2v3" stroke="#1f4488" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M7 14h10M7 18h6" stroke="#1f4488" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
            <QuickLink
              href="/member/payments"
              label="ประวัติการชำระเงิน"
              desc="รายการชำระเงินทั้งหมด"
              color="#f0fdf4"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#126f38" strokeWidth="1.5" />
                  <path d="M3 10h18" stroke="#126f38" strokeWidth="1.5" />
                  <circle cx="8" cy="15" r="2" stroke="#126f38" strokeWidth="1.5" />
                </svg>
              }
            />
            <QuickLink
              href="/member/certificates"
              label="ใบประกาศ"
              desc="ใบประกาศนียบัตรของฉัน"
              color="#fefce8"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#d97706" strokeWidth="1.5" />
                  <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M15 17l1.5 1.5L19 16" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <QuickLink
              href="/member/settings"
              label="การตั้งค่า"
              desc="รหัสผ่านและการแจ้งเตือน"
              color="#f5f5f5"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="#555" strokeWidth="1.5" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#555" strokeWidth="1.5" />
                </svg>
              }
            />
          </div>

          {/* ── Right: profile info / edit form ── */}
          <div
            style={{
              background: '#fff', borderRadius: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '20px 28px', borderBottom: '1px solid #f0f0f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 18, color: '#132953', margin: 0 }}>
                ข้อมูลส่วนตัว
              </h2>
              {!isEditing && (
                <button
                  onClick={() => { setIsEditing(true); setEditSuccess(''); setEditGlobalError('') }}
                  style={{
                    height: 36, padding: '0 16px', borderRadius: 8,
                    border: '1.5px solid #1f4488', background: '#fff', color: '#1f4488',
                    fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#1f4488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#1f4488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  แก้ไข
                </button>
              )}
            </div>

            <div style={{ padding: 28 }}>
              {editGlobalError && (
                <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                  <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#dc2626', margin: 0 }}>{editGlobalError}</p>
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSaveProfile} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#555', fontWeight: 500 }}>ชื่อ</label>
                      <FieldInput
                        type="text"
                        value={editData.first_name || ''}
                        onChange={e => setEditData(d => ({ ...d, first_name: e.target.value }))}
                        error={!!editErrors.first_name}
                      />
                      {editErrors.first_name && <p style={{ fontFamily: 'var(--font-thai)', fontSize: 12, color: '#ec221f', margin: 0 }}>{editErrors.first_name}</p>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#555', fontWeight: 500 }}>นามสกุล</label>
                      <FieldInput
                        type="text"
                        value={editData.last_name || ''}
                        onChange={e => setEditData(d => ({ ...d, last_name: e.target.value }))}
                        error={!!editErrors.last_name}
                      />
                      {editErrors.last_name && <p style={{ fontFamily: 'var(--font-thai)', fontSize: 12, color: '#ec221f', margin: 0 }}>{editErrors.last_name}</p>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#555', fontWeight: 500 }}>อีเมล (ไม่สามารถแก้ไขได้)</label>
                    <FieldInput type="email" value={profile.email || ''} disabled />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#555', fontWeight: 500 }}>เบอร์โทรศัพท์</label>
                    <FieldInput
                      type="tel"
                      value={editData.phone || ''}
                      onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))}
                      error={!!editErrors.phone}
                    />
                    {editErrors.phone && <p style={{ fontFamily: 'var(--font-thai)', fontSize: 12, color: '#ec221f', margin: 0 }}>{editErrors.phone}</p>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#555', fontWeight: 500 }}>ที่อยู่</label>
                    <FieldInput
                      type="text"
                      value={editData.address || ''}
                      onChange={e => setEditData(d => ({ ...d, address: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setEditGlobalError('') }}
                      style={{ height: 40, padding: '0 20px', borderRadius: 8, border: '1.5px solid #dfdfdf', background: '#fff', fontFamily: 'var(--font-thai)', fontSize: 14, color: '#555', cursor: 'pointer' }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      style={{ height: 40, padding: '0 20px', borderRadius: 8, border: 'none', cursor: editLoading ? 'not-allowed' : 'pointer', background: 'linear-gradient(187.13deg, #126f38 0%, #1f4488 100%)', fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 14, color: '#fff', opacity: editLoading ? 0.7 : 1 }}
                    >
                      {editLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { label: 'ชื่อ',                value: profile.first_name || '—' },
                    { label: 'นามสกุล',             value: profile.last_name || '—' },
                    { label: 'อีเมล',               value: profile.email || '—' },
                    { label: 'เบอร์โทรศัพท์',      value: profile.phone || '—' },
                    { label: 'ที่อยู่',             value: profile.address || '—' },
                    ...(profile.org_name ? [{ label: 'ชื่อองค์กร/บริษัท', value: profile.org_name }] : []),
                    ...(profile.tax_id   ? [{ label: 'เลขผู้เสียภาษี',    value: profile.tax_id   }] : []),
                    { label: 'ประเภทสมาชิก', value: memberTypeLabel },
                  ].map((row, i, arr) => (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex', padding: '14px 0',
                        borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none',
                        gap: 16, alignItems: 'flex-start',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', width: 140, flexShrink: 0, fontWeight: 500 }}>
                        {row.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: '#132953', fontWeight: 500, flex: 1, wordBreak: 'break-all' }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function MemberProfilePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>กำลังโหลด...</div>}>
      <MemberProfileContent />
    </Suspense>
  )
}
