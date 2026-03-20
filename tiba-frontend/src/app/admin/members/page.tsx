'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import ContentTable from '@/components/admin/ContentTable'
import { statusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal, { ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Input'
import { adminService } from '@/lib/api/services/admin.service'
import { mockMembers } from '@/lib/api/mock/members'
import { formatDateShort } from '@/lib/utils/format'
import { useForm } from 'react-hook-form'
import type { Member } from '@/types'

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export default function AdminMembersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-members', page, search],
    queryFn: () => {
      if (useMock) {
        const filtered = mockMembers.filter(m => !search || `${m.first_name} ${m.last_name}`.includes(search) || m.email.includes(search))
        return { data: filtered, pagination: { page: 1, page_size: 10, total_items: filtered.length, total_pages: 1 } }
      }
      return adminService.getMembers({ page, page_size: 10, search })
    },
  })

  const { register, handleSubmit, reset } = useForm<{ status: string }>()

  const updateMutation = useMutation({
    mutationFn: (d: { status: string }) => adminService.updateMemberStatus(selectedMember!.member_id, d),
    onSuccess: () => {
      toast.success('อัปเดตสถานะสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-members'] })
      setIsStatusModalOpen(false)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const openStatus = (m: Member) => {
    setSelectedMember(m)
    reset({ status: m.status })
    setIsStatusModalOpen(true)
  }

  const members = data?.data || []
  const pagination = data?.pagination

  return (
    <>
      <ContentTable
        title="รายการสมาชิก"
        data={members}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="ค้นหาชื่อ/อีเมล..."
        rowKey={(r) => r.member_id}
        page={page}
        totalPages={pagination?.total_pages}
        totalItems={pagination?.total_items}
        pageSize={10}
        onPageChange={setPage}
        columns={[
          { key: 'name', header: 'ชื่อ-นามสกุล', render: (r) => <div><p className="font-medium">{r.first_name} {r.last_name}</p><p className="text-xs text-gray-400">{r.email}</p></div> },
          { key: 'phone', header: 'เบอร์โทร', render: (r) => <span className="text-sm text-gray-600">{r.phone}</span> },
          { key: 'member_type', header: 'ประเภท', render: (r) => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.member_type === 'association' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>{r.member_type === 'association' ? 'สมาคม' : 'ทั่วไป'}</span> },
          { key: 'company_name', header: 'บริษัท', render: (r) => <span className="text-xs text-gray-500">{r.company_name || '-'}</span> },
          { key: 'status', header: 'สถานะ', render: (r) => statusBadge(r.status) },
          { key: 'created_at', header: 'สมัครเมื่อ', render: (r) => <span className="text-xs text-gray-400">{formatDateShort(r.created_at)}</span> },
          { key: 'action', header: '', render: (r) => <Button size="sm" variant="outline" onClick={() => openStatus(r)}>อัปเดต</Button> },
        ]}
      />

      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="อัปเดตสถานะสมาชิก" size="sm">
        <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))}>
          <ModalBody className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-medium">{selectedMember?.first_name} {selectedMember?.last_name}</p>
              <p className="text-gray-500 text-xs">{selectedMember?.email}</p>
            </div>
            <Select
              label="สถานะ"
              options={[
                { value: 'pending', label: 'รอดำเนินการ' },
                { value: 'approved', label: 'อนุมัติ' },
                { value: 'rejected', label: 'ปฏิเสธ' },
                { value: 'suspended', label: 'ระงับ' },
              ]}
              {...register('status')}
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
