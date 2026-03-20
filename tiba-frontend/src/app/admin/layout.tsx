'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'แดชบอร์ด',
  '/admin/registrations': 'คำขอลงทะเบียน',
  '/admin/members': 'รายการสมาชิก',
  '/admin/courses': 'คอร์สอบรม',
  '/admin/calendar': 'ปฏิทิน',
  '/admin/orders': 'คำสั่งซื้อ',
  '/admin/news': 'ข่าวสาร/บทความ',
  '/admin/ads': 'โฆษณา',
  '/admin/statistics': 'สถิติประกันภัย',
  '/admin/partners': 'พาร์ทเนอร์',
  '/admin/executives': 'คณะกรรมการ',
  '/admin/membership': 'ประเภทสมาชิก',
  '/admin/member-companies': 'บริษัทสมาชิก',
  '/admin/tutors': 'ผู้สอน',
  '/admin/user-logs': 'ประวัติการใช้งาน',
  '/admin/contact-setting': 'ติดต่อเรา',
  '/admin/activity-logs': 'บันทึกกิจกรรม',
  '/admin/content/banners': 'แบนเนอร์',
  '/admin/content/price-benefits': 'ราคา/สิทธิประโยชน์',
  '/admin/content/news': 'ข่าวสาร/บทความ',
  '/admin/content/ads': 'โฆษณา',
  '/admin/content/statistics': 'สถิติประกันภัย',
  '/admin/content/partners': 'พาร์ทเนอร์',
  '/admin/content/executives': 'คณะกรรมการ',
  '/admin/content/contact': 'ติดต่อเรา',
  '/admin/content/companies': 'บริษัทสมาชิก',
  '/admin/users': 'จัดการผู้ใช้',
  '/admin/profile': 'โปรไฟล์',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userName, setUserName] = useState('')
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsChecking(false)
      return
    }
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      setUserName(`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'ผู้ดูแลระบบ')
    } catch {}
    setIsChecking(false)
  }, [pathname, router])

  if (pathname === '/admin/login') return <>{children}</>

  if (isChecking) return null

  const pageTitle = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] || 'Admin'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isCollapsed={isCollapsed}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader
          title={pageTitle}
          onMenuClick={() => setIsMenuOpen(true)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          userName={userName}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
