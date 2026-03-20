'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import ContentTable from '@/components/admin/ContentTable'
import { statusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Modal, { ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Input'
import { adminService } from '@/lib/api/services/admin.service'
import { mockRegistrations } from '@/lib/api/mock/members'
import { formatDateTime } from '@/lib/utils/format'
import { useForm } from 'react-hook-form'
import type { Registration } from '@/types'

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export default function AdminRegistrationsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-registrations', page, search],
    queryFn: () => {
      if (useMock) {
        const filtered = mockRegistrations.filter(r => !search || r.member_name.includes(search) || r.course_title.includes(search))
        return { data: filtered, pagination: { page: 1, page_size: 10, total_items: filtered.length, total_pages: 1 } }
      }
      return adminService.getRegistrations({ page, page_size: 10, search })
    },
  })

  const { register, handleSubmit, reset } = useForm<{ status: string; payment_status: string }>()

  const updateMutation = useMutation({
    mutationFn: (d: { status: string; payment_status: string }) =>
      adminService.updateRegistrationStatus(selectedReg!.registration_id, d),
    onSuccess: () => {
      toast.success('อัปเดตสถานะสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-registrations'] })
      setIsStatusModalOpen(false)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const openStatus = (reg: Registration) => {
    setSelectedReg(reg)
    reset({ status: reg.status, payment_status: reg.payment_status })
    setIsStatusModalOpen(true)
  }

  const regs = data?.data || []
  const pagination = data?.pagination

  return (
    <>
      <ContentTable
        title="คำขอลงทะเบียน"
        data={regs}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="ค้นหาชื่อ/หลักสูตร..."
        rowKey={(r) => r.registration_id}
        page={page}
        totalPages={pagination?.total_pages}
        totalItems={pagination?.total_items}
        pageSize={10}
        onPageChange={setPage}
        columns={[
          { key: 'member_name', header: 'สมาชิก', render: (r) => <div><p className="font-medium">{r.member_name}</p><p className="text-xs text-gray-400">{r.member_email}</p></div> },
          { key: 'course_title', header: 'หลักสูตร', render: (r) => <div><p className="font-medium text-sm">{r.course_title}</p><p className="text-xs text-gray-400">{r.session_label}</p></div> },
          { key: 'status', header: 'สถานะ', render: (r) => statusBadge(r.status) },
          { key: 'payment_status', header: 'การชำระ', render: (r) => statusBadge(r.payment_status) },
          { key: 'registered_at', header: 'วันที่', render: (r) => <span className="text-xs text-gray-400">{formatDateTime(r.registered_at)}</span> },
          { key: 'action', header: '', render: (r) => <Button size="sm" variant="outline" onClick={() => openStatus(r)}>อัปเดต</Button> },
        ]}
      />

      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="อัปเดตสถานะ" size="sm">
        <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))}>
          <ModalBody className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-medium">{selectedReg?.member_name}</p>
              <p className="text-gray-500 text-xs">{selectedReg?.course_title} — {selectedReg?.session_label}</p>
            </div>
            <Select
              label="สถานะการลงทะเบียน"
              options={[
                { value: 'pending', label: 'รอดำเนินการ' },
                { value: 'confirmed', label: 'ยืนยัน' },
                { value: 'cancelled', label: 'ยกเลิก' },
                { value: 'completed', label: 'เสร็จสิ้น' },
              ]}
              {...register('status')}
            />
            <Select
              label="สถานะการชำระเงิน"
              options={[
                { value: 'pending', label: 'รอชำระ' },
                { value: 'paid', label: 'ชำระแล้ว' },
                { value: 'refunded', label: 'คืนเงิน' },
              ]}
              {...register('payment_status')}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" type="button" onClick={() => setIsStatusModalOpen(false)}>ยกเลิก</Button>
            <Button variant="primary" type="submit" isLoading={updateMutation.isPending}>บันทึก</Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  )
}
