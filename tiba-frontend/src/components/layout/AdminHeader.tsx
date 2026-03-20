'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Bell, User, LogOut, ChevronDown, Settings } from 'lucide-react'
import { authService } from '@/lib/api/services/auth.service'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
  href?: string
  isToday: boolean
}

interface AdminHeaderProps {
  title: string
  onMenuClick: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  userName?: string
}

// ─── Confirm Logout Dialog ────────────────────────────────────────────────────

function ConfirmLogoutDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-[20px] flex flex-col items-center"
        style={{ width: 400, padding: '40px 40px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Illustration */}
        <div
          className="flex items-center justify-center rounded-full mb-6"
          style={{ width: 80, height: 80, background: '#fff4e5' }}
        >
          <span style={{ fontSize: 40 }}>🚪</span>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f4488', marginBottom: 8, fontFamily: 'var(--font-thai)' }}>
          ออกจากระบบ
        </h2>
        <p style={{ fontSize: 17, color: '#6b7280', marginBottom: 28, textAlign: 'center', fontFamily: 'var(--font-thai)' }}>
          คุณต้องการออกจากระบบใช่หรือไม่
        </p>

        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              border: '1.5px solid #d1d5db',
              background: '#fff',
              fontSize: 17,
              fontWeight: 500,
              color: '#374151',
              cursor: 'pointer',
              fontFamily: 'var(--font-thai)',
            }}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              border: 'none',
              background: '#1f4488',
              fontSize: 17,
              fontWeight: 500,
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'var(--font-thai)',
            }}
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminHeader({
  title,
  onMenuClick,
  isCollapsed,
  onToggleCollapse,
  userName = 'ผู้ดูแลระบบ',
}: AdminHeaderProps) {
  const router = useRouter()
  const [showLogout, setShowLogout] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const bellRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)

  // Load notifications (try API, fall back to empty)
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        const items = (data?.data ?? data ?? []).map((n: any) => ({
          id: String(n.id ?? n.notification_id ?? Math.random()),
          title: n.title ?? n.subject ?? '',
          description: n.body ?? n.description ?? n.message ?? '',
          timestamp: n.created_at ?? n.timestamp ?? '',
          read: !!(n.read_at ?? n.is_read),
          href: n.href ?? n.link ?? undefined,
          isToday: isToday(n.created_at ?? n.timestamp ?? ''),
        }))
        setNotifications(items)
      })
      .catch(() => setNotifications([]))
  }, [])

  function isToday(dateStr: string) {
    if (!dateStr) return false
    const d = new Date(dateStr)
    const now = new Date()
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length
  const todayNotifs = notifications.filter((n) => n.isToday)
  const oldNotifs = notifications.filter((n) => !n.isToday)

  const handleNotifClick = (n: Notification) => {
    setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))
    setBellOpen(false)
    if (n.href) router.push(n.href)
  }

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true)
    try {
      await authService.logout()
    } catch {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/admin/login')
  }

  const initials = userName ? userName.charAt(0).toUpperCase() : 'A'

  return (
    <>
      <header
        className="bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0"
        style={{ height: 60 }}
      >
        {/* Hamburger — toggle sidebar */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title="เมนู"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Title */}
        <h1
          className="flex-1 truncate"
          style={{ fontSize: 18, fontWeight: 600, color: '#1f2937', fontFamily: 'var(--font-thai)' }}
        >
          {title}
        </h1>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2">

          {/* Bell notification */}
          <div ref={bellRef} className="relative">
            <button
              onClick={() => { setBellOpen(!bellOpen); setAvatarOpen(false) }}
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span
                  className="absolute flex items-center justify-center text-white"
                  style={{
                    top: 4, right: 4,
                    minWidth: 16, height: 16,
                    background: '#ef4444',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '0 5px',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification panel */}
            {bellOpen && (
              <div
                className="absolute right-0 bg-white border border-gray-200 rounded-xl overflow-hidden"
                style={{
                  top: 'calc(100% + 8px)',
                  width: 340,
                  maxHeight: 480,
                  overflowY: 'auto',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 50,
                }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-100"
                  style={{ background: '#f9fafb' }}
                >
                  <span style={{ fontSize: 17, fontWeight: 600, color: '#1f2937', fontFamily: 'var(--font-thai)' }}>
                    การแจ้งเตือน
                  </span>
                  {unreadCount > 0 && (
                    <span style={{ fontSize: 14, color: '#6b7280' }}>{unreadCount} ยังไม่อ่าน</span>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <Bell className="h-8 w-8 mb-2 opacity-30" />
                    <p style={{ fontSize: 16, fontFamily: 'var(--font-thai)' }}>ไม่มีการแจ้งเตือน</p>
                  </div>
                ) : (
                  <>
                    {todayNotifs.length > 0 && (
                      <>
                        <div className="px-4 py-2" style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', background: '#f9fafb', fontFamily: 'var(--font-thai)' }}>
                          วันนี้
                        </div>
                        {todayNotifs.map((n) => (
                          <NotifItem key={n.id} n={n} onClick={() => handleNotifClick(n)} />
                        ))}
                      </>
                    )}
                    {oldNotifs.length > 0 && (
                      <>
                        <div className="px-4 py-2" style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', background: '#f9fafb', fontFamily: 'var(--font-thai)' }}>
                          เก่า
                        </div>
                        {oldNotifs.map((n) => (
                          <NotifItem key={n.id} n={n} onClick={() => handleNotifClick(n)} />
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Avatar + dropdown */}
          <div ref={avatarRef} className="relative">
            <button
              onClick={() => { setAvatarOpen(!avatarOpen); setBellOpen(false) }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Avatar circle */}
              <div
                className="flex items-center justify-center rounded-full bg-primary text-white font-bold flex-shrink-0"
                style={{ width: 34, height: 36, fontSize: 16, background: '#1f4488' }}
              >
                {initials}
              </div>
              <span
                className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate"
                style={{ fontFamily: 'var(--font-thai)' }}
              >
                {userName}
              </span>
              <ChevronDown
                className="hidden sm:block text-gray-400"
                style={{
                  width: 14, height: 14,
                  transform: avatarOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.15s',
                }}
              />
            </button>

            {/* Avatar dropdown */}
            {avatarOpen && (
              <div
                className="absolute right-0 bg-white border border-gray-200 rounded-xl overflow-hidden"
                style={{
                  top: 'calc(100% + 8px)',
                  width: 200,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 50,
                }}
              >
                <button
                  onClick={() => { setAvatarOpen(false); router.push('/admin/profile') }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: 'var(--font-thai)' }}
                >
                  <User className="h-4 w-4 text-gray-400" />
                  โปรไฟล์
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={() => { setAvatarOpen(false); setShowLogout(true) }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  style={{ fontFamily: 'var(--font-thai)' }}
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout confirm dialog */}
      {showLogout && (
        <ConfirmLogoutDialog
          onCancel={() => setShowLogout(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}
    </>
  )
}

// ─── Notification item ────────────────────────────────────────────────────────

function NotifItem({ n, onClick }: { n: Notification; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
      style={{ background: n.read ? '#fff' : '#eff6ff' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex-shrink-0 rounded-full"
          style={{ width: 8, height: 8, background: n.read ? '#d1d5db' : '#1f4488', marginTop: 6 }}
        />
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 16, fontWeight: n.read ? 400 : 600, color: '#1f2937', fontFamily: 'var(--font-thai)', marginBottom: 2 }}>
            {n.title}
          </p>
          {n.description && (
            <p style={{ fontSize: 15, color: '#6b7280', fontFamily: 'var(--font-thai)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {n.description}
            </p>
          )}
          {n.timestamp && (
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
              {new Date(n.timestamp).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
