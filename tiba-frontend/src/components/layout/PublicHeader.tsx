'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Search, Menu, X, User, BookOpen, Award, CreditCard, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

// ─── Menu data ────────────────────────────────────────────────────────────────

const subMenuItems = [
  {
    label: 'เกี่ยวกับเรา',
    href: '/about',
    children: [
      { label: 'ประวัติการก่อตั้ง',        href: '/about' },
      { label: 'วัตถุประสงค์และพันธกิจ',   href: '/about' },
      { label: 'การพัฒนาสมาคมฯ',          href: '/about' },
      { label: 'จรรยาบรรณสมาชิก',         href: '/about' },
      { label: 'ทำเนียบนายกสมาคม',        href: '/about' },
      { label: 'กรรมการบริหาร',           href: '/executive' },
    ],
  },
  {
    label: 'คอร์สอบรม',
    href: '/courses',
    children: [
      { label: 'คอร์สทั้งหมด',               href: '/courses' },
      { label: 'คอร์สที่กำลังปิดรับสมัคร',   href: '/courses?status=closing' },
      { label: 'คอร์สที่กำลังมาถึง',         href: '/courses?status=upcoming' },
      { label: 'คอร์สที่ปิดรับสมัครแล้ว',   href: '/courses?status=closed' },
    ],
  },
  {
    label: 'ข่าวสาร/บทความ',
    href: '/news',
    children: [
      { label: 'ข่าวสาร/บทความ', href: '/news' },
      { label: 'สถิติประกัน',     href: '/statistics' },
    ],
  },
  { label: 'บริษัทสมาชิก', href: '/companies' },
  { label: 'ราคา/สิทธิประโยชน์', href: '/price-benefits' },
  { label: 'ติดต่อเรา',    href: '/contact' },
]

const profileMenuItems = [
  { label: 'โปรไฟล์',            href: '/member/profile',  icon: User },
  { label: 'คอร์สของฉัน',        href: '/member/courses',  icon: BookOpen },
  { label: 'ใบประกาศฯ',          href: '/member/certificates', icon: Award },
  { label: 'ประวัติการชำระเงิน', href: '/member/payment',  icon: CreditCard },
  { label: 'การตั้งค่า',          href: '/member/settings', icon: Settings, dividerBelow: true },
  { label: 'ออกจากระบบ',         href: '#',                icon: LogOut, isLogout: true },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function PublicHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [langOpen, setLangOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [lang, setLang] = useState<'TH' | 'EN'>('TH')
  const [searchValue, setSearchValue] = useState('')

  const menuRef  = useRef<HTMLDivElement>(null)
  const langRef  = useRef<HTMLDivElement>(null)
  const profRef  = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current  && !menuRef.current.contains(e.target as Node))  setOpenMenu(null)
      if (langRef.current  && !langRef.current.contains(e.target as Node))  setLangOpen(false)
      if (profRef.current  && !profRef.current.contains(e.target as Node))  setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on route change
  useEffect(() => {
    setMobileOpen(false)
    setOpenMenu(null)
    setLangOpen(false)
    setProfileOpen(false)
  }, [pathname])

  // ESC key closes all
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpenMenu(null); setLangOpen(false); setProfileOpen(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Get first letter of user display for avatar
  const avatarLetter = user?.first_name?.charAt(0)?.toUpperCase() ?? 'U'

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    router.push('/home')
  }

  return (
    <header className="sticky top-0 z-50">

      {/* ══════════ Row 1 — White top bar ══════════ */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-[80px] flex items-center justify-between h-[80px]">

          {/* Logo — 293px wide */}
          <Link href="/home" className="flex-shrink-0 flex items-center">
            <img
              src="/assets/footer-logo.png"
              alt="สมาคมนายหน้าประกันภัยไทย"
              style={{ width: 293, height: 'auto', display: 'block' }}
            />
          </Link>

          {/* Right: Search + Lang + Login/Avatar */}
          <div className="hidden md:flex items-center flex-shrink-0" style={{ gap: 16 }}>

            {/* Search bar */}
            <div className="relative flex-shrink-0" style={{ width: 222 }}>
              <Search
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: 16, width: 24, height: 24, color: '#b3b3b3' }}
              />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="พิมข้อความค้นหา"
                style={{
                  width: 222, height: 48,
                  paddingLeft: 52, paddingRight: 16,
                  fontSize: 16, fontFamily: 'var(--font-thai)',
                  border: 'none', borderRadius: 8, outline: 'none',
                  color: '#0a0a0a', background: '#f5f5f5',
                }}
              />
            </div>

            {/* TH/EN Language Dropdown */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                  padding: '0 16px', width: 130, height: 48,
                  border: 'none', borderRadius: 8, background: '#f5f5f5', cursor: 'pointer',
                }}
              >
                <img
                  src={lang === 'TH' ? 'https://flagcdn.com/th.svg' : 'https://flagcdn.com/gb.svg'}
                  alt={lang}
                  style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <span style={{ fontSize: 16, fontWeight: 600, color: '#0a0a0a', fontFamily: 'var(--font-eng)' }}>
                  {lang}
                </span>
                <ChevronDown
                  style={{
                    width: 24, height: 24, color: '#0a0a0a', flexShrink: 0,
                    transform: langOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s',
                  }}
                />
              </button>

              {langOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  minWidth: 200, background: '#fff', borderRadius: 8,
                  boxShadow: '0px 0px 24px rgba(0,0,0,0.10)', zIndex: 100, overflow: 'hidden',
                }}>
                  {[
                    { code: 'TH', label: 'Thai Language',    flag: 'https://flagcdn.com/th.svg' },
                    { code: 'EN', label: 'English Language', flag: 'https://flagcdn.com/gb.svg' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code as 'TH' | 'EN'); setLangOpen(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', height: 48, padding: '0 16px',
                        background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                      className="hover:bg-[#f5f5f5]"
                    >
                      <img src={l.flag} alt={l.code} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <span style={{ fontSize: 16, fontWeight: 400, fontFamily: 'var(--font-thai)', color: '#0a0a0a', lineHeight: '20px', whiteSpace: 'nowrap' }}>
                        {l.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login button (guest) OR Avatar (member) */}
            {isAuthenticated ? (
              // ── Member avatar ──────────────────────────────────────
              <div ref={profRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(225deg, rgb(18,111,56) 0%, rgb(81,186,124) 100%)',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 20,
                    color: '#fff', lineHeight: 1, letterSpacing: '-0.02em',
                  }}>
                    {avatarLetter}
                  </span>
                </button>

                {/* Profile dropdown */}
                {profileOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    minWidth: 220, background: '#fff', borderRadius: 8,
                    boxShadow: '0px 0px 24px rgba(0,0,0,0.10)', zIndex: 100, overflow: 'hidden',
                  }}>
                    {profileMenuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <React.Fragment key={item.label}>
                          {item.isLogout ? (
                            <button
                              onClick={handleLogout}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                width: '100%', height: 57, padding: '0 16px',
                                background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                              }}
                              className="hover:bg-[#f5f5f5]"
                            >
                              <Icon style={{ width: 24, height: 24, color: '#0a0a0a', flexShrink: 0 }} />
                              <span style={{ fontSize: 16, fontFamily: 'var(--font-thai)', fontWeight: 400, color: '#0a0a0a', lineHeight: '20px', whiteSpace: 'nowrap' }}>
                                {item.label}
                              </span>
                            </button>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={() => setProfileOpen(false)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                height: 57, padding: '0 16px', textDecoration: 'none',
                                borderBottom: item.dividerBelow ? '1px solid #dfdfdf' : 'none',
                              }}
                              className="hover:bg-[#f5f5f5]"
                            >
                              <Icon style={{ width: 24, height: 24, color: '#0a0a0a', flexShrink: 0 }} />
                              <span style={{ fontSize: 16, fontFamily: 'var(--font-thai)', fontWeight: 400, color: '#0a0a0a', lineHeight: '20px', whiteSpace: 'nowrap' }}>
                                {item.label}
                              </span>
                            </Link>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              // ── Guest login button ─────────────────────────────────
              <Link
                href="/login"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                  height: 48, padding: '0 16px',
                  background: 'linear-gradient(199.983deg, rgb(18,111,56) 0%, rgb(31,68,136) 100%)',
                  color: '#f5f5f5', border: 'none', borderRadius: 8,
                  fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-thai)',
                  textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'pointer',
                }}
              >
                <User style={{ width: 24, height: 24 }} />
                เข้าสู่ระบบ
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden ml-auto p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ══════════ Row 2 — Blue submenu bar ══════════ */}
      <div style={{ background: '#1f4488', height: 56, position: 'relative' }} ref={menuRef}>
        <div className="flex items-center justify-center gap-[40px] h-full w-full">
          {subMenuItems.map((item) => {
            const hasChildren = !!item.children
            const isOpen = openMenu === item.label

            return (
              <div key={item.label} className="relative h-full flex items-center">
                {hasChildren ? (
                  <button
                    onClick={() => setOpenMenu(isOpen ? null : item.label)}
                    onMouseEnter={() => setOpenMenu(item.label)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      height: '100%', padding: '0 8px',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      fontSize: 16, fontFamily: 'var(--font-thai)', fontWeight: 600,
                      color: '#fff', whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                    <ChevronDown
                      style={{
                        width: 24, height: 24,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.15s',
                      }}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', height: '100%',
                      padding: '0 8px', fontSize: 16, fontFamily: 'var(--font-thai)',
                      fontWeight: 600, color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown panel */}
                {hasChildren && isOpen && (
                  <div
                    onMouseLeave={() => setOpenMenu(null)}
                    style={{
                      position: 'absolute', top: '100%', left: 0,
                      minWidth: 220, background: '#fff',
                      border: '1px solid #e5e7eb', borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      zIndex: 100, overflow: 'hidden', marginTop: 0,
                    }}
                  >
                    {item.children!.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        onClick={() => setOpenMenu(null)}
                        style={{
                          display: 'block', padding: '11px 18px', fontSize: 14,
                          fontFamily: 'var(--font-thai)', color: '#374151',
                          textDecoration: 'none', borderBottom: '1px solid #f3f4f6',
                          transition: 'background 0.1s',
                        }}
                        className="hover:bg-[#eff6ff] hover:text-[#1f4488]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ══════════ Mobile drawer ══════════ */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto" style={{ top: 136 }}>
          <nav className="flex flex-col px-4 py-4">
            {subMenuItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-[#1f4488] hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href}
                    className="flex items-center pl-8 py-2 text-sm text-gray-500 hover:text-[#1f4488]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-4 border-t border-gray-100 mt-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-4 py-3 rounded-xl bg-red-500 text-white font-medium"
                >
                  ออกจากระบบ
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-3 rounded-xl text-white font-medium"
                  style={{ background: 'linear-gradient(199.983deg, rgb(18,111,56) 0%, rgb(31,68,136) 100%)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
