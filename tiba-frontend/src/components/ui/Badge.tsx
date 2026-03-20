import React from 'react'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-700',
  purple: 'bg-purple-100 text-purple-700',
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[variant]} ${className}
      `}
    >
      {children}
    </span>
  )
}

export function statusBadge(status: string) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    approved: { variant: 'success', label: 'อนุมัติ' },
    confirmed: { variant: 'success', label: 'ยืนยัน' },
    completed: { variant: 'success', label: 'เสร็จสิ้น' },
    active: { variant: 'success', label: 'ใช้งาน' },
    paid: { variant: 'success', label: 'ชำระแล้ว' },
    pending: { variant: 'warning', label: 'รอดำเนินการ' },
    rejected: { variant: 'danger', label: 'ปฏิเสธ' },
    cancelled: { variant: 'danger', label: 'ยกเลิก' },
    suspended: { variant: 'danger', label: 'ระงับ' },
    failed: { variant: 'danger', label: 'ล้มเหลว' },
    refunded: { variant: 'purple', label: 'คืนเงิน' },
    inactive: { variant: 'default', label: 'ไม่ใช้งาน' },
    online: { variant: 'info', label: 'ออนไลน์' },
    onsite: { variant: 'default', label: 'ออนไซต์' },
    news: { variant: 'info', label: 'ข่าวสาร' },
    blog: { variant: 'purple', label: 'บทความ' },
    single: { variant: 'default', label: 'ราคาเดียว' },
    dual: { variant: 'info', label: 'แยกราคา' },
  }
  const found = map[status]
  if (found) {
    return <Badge variant={found.variant}>{found.label}</Badge>
  }
  return <Badge>{status}</Badge>
}
