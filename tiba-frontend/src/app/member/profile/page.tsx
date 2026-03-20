'use client'

import React, { useEffect, useState } from 'react'
import { User, Mail, Phone, Building2 } from 'lucide-react'
import type { User as UserType } from '@/types'

export default function MemberProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
  }, [])

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">กำลังโหลดข้อมูล...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-main mb-6">โปรไฟล์ของฉัน</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-light p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.first_name} {user.last_name}</h2>
              <p className="text-white/70 text-sm capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400">อีเมล</p>
              <p className="text-sm font-medium text-text-main">{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">โทรศัพท์</p>
                <p className="text-sm font-medium text-text-main">{user.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-2 rounded-lg">
              <Building2 className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-gray-400">สถานะ</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                {user.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
