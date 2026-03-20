'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ContentTable from '@/components/admin/ContentTable'
import { statusBadge } from '@/components/ui/Badge'
import { adminService } from '@/lib/api/services/admin.service'
import { mockOrders } from '@/lib/api/mock/members'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import type { Order } from '@/types'

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search],
    queryFn: () => {
      if (useMock) {
        const filtered = mockOrders.filter(o => !search || o.member_name.includes(search) || o.course_title.includes(search))
        return { data: filtered, pagination: { page: 1, page_size: 10, total_items: filtered.length, total_pages: 1 } }
      }
      return adminService.getOrders({ page, page_size: 10, search })
    },
  })

  const orders = data?.data || []
  const pagination = data?.pagination

  return (
    <ContentTable
      title="คำสั่งซื้อ"
      data={orders}
      isLoading={isLoading}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="ค้นหาชื่อ/หลักสูตร..."
      rowKey={(r: Order) => r.order_id}
      page={page}
      totalPages={pagination?.total_pages}
      totalItems={pagination?.total_items}
      pageSize={10}
      onPageChange={setPage}
      columns={[
        { key: 'order_id', header: 'รหัสคำสั่งซื้อ', render: (r: Order) => <span className="font-mono text-xs text-gray-500">{r.order_id.slice(0, 12)}...</span> },
        { key: 'member_name', header: 'สมาชิก', render: (r: Order) => <span className="font-medium">{r.member_name}</span> },
        { key: 'course_title', header: 'หลักสูตร', render: (r: Order) => <span className="text-sm text-gray-600">{r.course_title}</span> },
        { key: 'amount', header: 'ยอดชำระ', render: (r: Order) => <span className="font-semibold text-accent">{formatCurrency(r.amount)}</span> },
        { key: 'payment_status', header: 'สถานะ', render: (r: Order) => statusBadge(r.payment_status) },
        { key: 'created_at', header: 'วันที่', render: (r: Order) => <span className="text-xs text-gray-400">{formatDateTime(r.created_at)}</span> },
      ]}
    />
  )
}
