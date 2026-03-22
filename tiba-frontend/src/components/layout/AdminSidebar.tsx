'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, Monitor, ShoppingCart,
  Users, Calendar, Building2, Settings, ChevronDown, X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubItem {
  href: string
  label: string
  disabled?: boolean   // individual sub-item disabled (e.g. การชำระเงิน)
}

interface NavItem {
  label: string
  icon: React.ElementType
  href?: string
  children?: SubItem[]
  disabled?: boolean   // whole row disabled — opacity 50%, no interaction
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
// Order matches Figma node 1-58246 (screenshot source of truth).
// รายงาน is fully removed.
// Active items: จัดการคำสั่งซื้อ, จัดการสมาชิก (รายการสมาชิก, คำขอสมัครสมาชิกสมาคม, คำขอบัญชีผู้แทนรอง)
// Disabled items: ปฏิทิน (+ sub-items); Disabled sub-item: การชำระเงิน inside ตั้งค่าระบบ

const navItems: NavItem[] = [
  // ── Active items ────────────────────────────────────────────────────────────
  { label: 'แดชบอร์ด', icon: LayoutDashboard, href: '/admin/dashboard' },

  { label: 'จัดการคอร์สอบรม', icon: BookOpen, href: '/admin/courses' },

  {
    label: 'จัดการคอนเทนต์', icon: Monitor,
    children: [
      { href: '/admin/content/banners', label: 'แบนเนอร์' },
      { href: '/admin/news',            label: 'ข่าวสารและบทความ' },
      { href: '/admin/ads',             label: 'โฆษณา' },
      { href: '/admin/partners',        label: 'ผู้สนับสนุน' },
    ],
  },

  // ── Orders ───────────────────────────────────────────────────────────────
  {
    label: 'จัดการคำสั่งซื้อ', icon: ShoppingCart,
    href: '/admin/orders',
  },

  // ── Members ──────────────────────────────────────────────────────────────
  {
    label: 'จัดการสมาชิก', icon: Users,
    children: [
      { href: '/admin/members',            label: 'รายการสมาชิก' },
      { href: '/admin/registrations',      label: 'คำขอสมัครสมาชิกสมาคม' },
      { href: '/admin/sub-user-requests',  label: 'คำขอบัญชีผู้แทนรอง' },
    ],
  },

  {
    label: 'ปฏิทิน', icon: Calendar, disabled: true,
    children: [
      { href: '/admin/calendar/bookings', label: 'จัดการการจอง' },
      { href: '/admin/calendar/training', label: 'จัดการอบรม' },
    ],
  },

  // ── Settings ────────────────────────────────────────────────────────────────
  {
    label: 'ตั้งค่าระบบ', icon: Building2,
    children: [
      { href: '/admin/member-companies', label: 'บริษัทสมาชิก' },
      { href: '/admin/tutors',           label: 'ผู้สอน' },
      { href: '/admin/statistics',       label: 'สถิติ' },
      { href: '/admin/executives',       label: 'กรรมการบริหาร' },
      { href: '/admin/membership',       label: 'ประเภทสมาชิก' },
      { href: '/admin/payments',         label: 'การชำระเงิน', disabled: true },
    ],
  },

  {
    label: 'ตั้งค่าทั่วไป', icon: Settings,
    children: [
      { href: '/admin/users',           label: 'ผู้ใช้งาน' },
      { href: '/admin/contact-setting', label: 'ข้อมูลติดต่อ' },
    ],
  },
]

// ─── Style constants ──────────────────────────────────────────────────────────
// Sizes are +2px from original Figma (Task 4 global resize applied)

const ITEM_H    = 56
const SIDEBAR_W = 250

const rowStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  gap: 10,
  paddingLeft: 10,
  paddingRight: 12,
  paddingTop: 8,
  paddingBottom: 8,
  borderRadius: 20,
  backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
})

const iconWrapStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
  borderRadius: 12,
  padding: '5px 8px',
  flexShrink: 0,
})

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isCollapsed?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminSidebar({ isOpen = false, onClose, isCollapsed = false }: AdminSidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) return item.href === '/admin/dashboard'
      ? pathname === item.href
      : pathname.startsWith(item.href)
    return item.children?.some((c) => pathname.startsWith(c.href)) ?? false
  }

  const toggleExpand = (label: string) => setExpanded((p) => ({ ...p, [label]: !p[label] }))
  const isGroupOpen  = (label: string, item: NavItem) =>
    expanded[label] !== undefined ? expanded[label] : isItemActive(item)

  // ─── Render a single nav row ─────────────────────────────────────────────

  const renderItem = (item: NavItem) => {
    const Icon     = item.icon
    const active   = isItemActive(item)
    const disabled = !!item.disabled

    // ── Disabled row (whole item) — no interaction, opacity 50% ───────────
    if (disabled) {
      return (
        <div
          key={item.label}
          title="ยังไม่เปิดใช้งาน"
          style={{
            opacity: 0.5,
            // children still shown for disabled groups (sub-items are static)
          }}
        >
          {/* Header row */}
          <div style={{
            height: ITEM_H, paddingLeft: 15, paddingRight: 15,
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{
              ...rowStyle(false),
              cursor: 'not-allowed',
              pointerEvents: 'none',
            }}>
              <span style={iconWrapStyle(false)}>
                <Icon style={{ width: 18, height: 18, color: '#ffffff' }} />
              </span>
              {!isCollapsed && (
                <span style={{ flex: 1, fontSize: 15, fontWeight: 400, color: '#ffffff', lineHeight: '20px' }}>
                  {item.label}
                </span>
              )}
              {!isCollapsed && item.children && (
                <ChevronDown style={{ width: 14, height: 14, color: '#ffffff', flexShrink: 0 }} />
              )}
            </div>
          </div>
        </div>
      )
    }

    // ── Standalone link ───────────────────────────────────────────────────
    if (item.href) {
      return (
        <div key={item.label} style={{
          height: ITEM_H, paddingLeft: 15, paddingRight: 15,
          display: 'flex', alignItems: 'center',
        }}>
          <Link
            href={item.href}
            onClick={onClose}
            style={{ ...rowStyle(active), textDecoration: 'none', flex: 1 }}
          >
            <span style={iconWrapStyle(active)}>
              <Icon style={{ width: 18, height: 18, color: '#ffffff' }} />
            </span>
            {!isCollapsed && (
              <span style={{ flex: 1, fontSize: 15, fontWeight: 400, color: '#ffffff', lineHeight: '20px' }}>
                {item.label}
              </span>
            )}
          </Link>
        </div>
      )
    }

    // ── Expandable group ──────────────────────────────────────────────────
    const open = isGroupOpen(item.label, item)
    return (
      <div key={item.label}>
        {/* Group header button */}
        <div style={{
          height: ITEM_H, paddingLeft: 15, paddingRight: 15,
          display: 'flex', alignItems: 'center',
        }}>
          <button
            onClick={() => toggleExpand(item.label)}
            style={{
              ...rowStyle(active),
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <span style={iconWrapStyle(active)}>
              <Icon style={{ width: 18, height: 18, color: '#ffffff' }} />
            </span>
            {!isCollapsed && (
              <span style={{ flex: 1, fontSize: 15, fontWeight: 400, color: '#ffffff', lineHeight: '20px' }}>
                {item.label}
              </span>
            )}
            {!isCollapsed && (
              <ChevronDown style={{
                width: 14, height: 14, color: '#ffffff', flexShrink: 0,
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }} />
            )}
          </button>
        </div>

        {/* Sub-items */}
        {open && !isCollapsed && (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
            {item.children!.map((child) => {
              const ca = pathname.startsWith(child.href)

              // Disabled sub-item (e.g. การชำระเงิน)
              if (child.disabled) {
                return (
                  <div
                    key={child.href}
                    title="ยังไม่เปิดใช้งาน"
                    style={{
                      display: 'flex', alignItems: 'center',
                      paddingLeft: 53, paddingRight: 15, height: 40,
                      fontSize: 14, lineHeight: '20px',
                      color: 'rgba(255,255,255,0.4)',
                      fontWeight: 400,
                      cursor: 'not-allowed',
                      borderLeft: '3px solid transparent',
                    }}
                  >
                    {child.label}
                  </div>
                )
              }

              // Normal sub-item link
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center',
                    paddingLeft: 53, paddingRight: 15, height: 40,
                    fontSize: 14, lineHeight: '20px',
                    color: ca ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    fontWeight: ca ? 600 : 400,
                    textDecoration: 'none',
                    borderLeft: ca ? '3px solid rgba(255,255,255,0.6)' : '3px solid transparent',
                    backgroundColor: ca ? 'rgba(255,255,255,0.08)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {child.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ─── Sidebar body ─────────────────────────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ width: SIDEBAR_W, backgroundColor: '#1f4488' }}>

      {/* Logo header */}
      <div
        className="flex items-center justify-center bg-white flex-shrink-0"
        style={{ height: 74, padding: '20px 24px' }}
      >
        <img src="/assets/footer-logo.png" alt="TIBA" style={{ height: 34, width: 'auto' }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto" style={{ paddingTop: 10, paddingBottom: 10 }}>
        {navItems.map(renderItem)}
      </nav>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="flex flex-col flex-shrink-0" style={{ width: SIDEBAR_W, backgroundColor: '#1f4488' }}>
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden" style={{ width: SIDEBAR_W, backgroundColor: '#1f4488' }}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
              aria-label="ปิดเมนู"
            >
              <X style={{ width: 20, height: 20 }} />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
