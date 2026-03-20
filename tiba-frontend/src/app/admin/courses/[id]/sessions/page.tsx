'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import ContentTable from '@/components/admin/ContentTable'
import Modal from '@/components/ui/Modal'
import SessionForm from '@/components/admin/SessionForm'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { statusBadge } from '@/components/ui/Badge'
import { courseService } from '@/lib/api/services/course.service'
import { mockCourses, mockSessions } from '@/lib/api/mock/courses'
import { formatDate } from '@/lib/utils/format'
import type { CourseSession } from '@/types'

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export default function CourseSessionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editSession, setEditSession] = useState<CourseSession | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CourseSession | null>(null)

  const { data: course } = useQuery({
    queryKey: ['course', id],
    queryFn: () => {
      if (useMock) return mockCourses.find(c => c.course_id === id) || null
      return courseService.getCourse(id)
    },
  })

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', id],
    queryFn: () => {
      if (useMock) return mockSessions.filter(s => s.course_id === id)
      return courseService.getSessions(id)
    },
  })

  const saveMutation = useMutation({
    mutationFn: (data: Partial<CourseSession>) =>
      editSession
        ? courseService.updateSession(editSession.session_id, data)
        : courseService.createSession(id, data),
    onSuccess: () => {
      toast.success(editSession ? 'แก้ไขสำเร็จ' : 'เพิ่มรุ่นสำเร็จ')
      qc.invalidateQueries({ queryKey: ['sessions', id] })
      setIsModalOpen(false)
      setEditSession(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => courseService.deleteSession(sessionId),
    onSuccess: () => {
      toast.success('ลบสำเร็จ')
      qc.invalidateQueries({ queryKey: ['sessions', id] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const openAdd = () => { setEditSession(null); setIsModalOpen(true) }
  const openEdit = (s: CourseSession) => { setEditSession(s); setIsModalOpen(true) }

  return (
    <>
      <div className="mb-4">
        <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-light mb-2">
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าคอร์ส
        </Link>
        {course && (
          <h2 className="text-sm font-medium text-gray-500">
            {course.title}
          </h2>
        )}
      </div>

      <ContentTable
        title="รุ่น/รอบการอบรม"
        data={sessions}
        isLoading={isLoading}
        onAdd={openAdd}
        addLabel="เพิ่มรุ่น"
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        rowKey={(r) => r.session_id}
        showSearch={false}
        columns={[
          { key: 'session_label', header: 'รุ่น', render: (r) => <span className="font-medium">{r.session_label}</span> },
          { key: 'location', header: 'สถานที่', render: (r) => <span className="text-gray-600 text-sm">{r.location}</span> },
          { key: 'enrollment', header: 'ช่วงรับสมัคร', render: (r) => <span className="text-xs text-gray-500">{formatDate(r.enrollment_start)} – {formatDate(r.enrollment_end)}</span> },
          { key: 'training', header: 'วันอบรม', render: (r) => <span className="text-xs text-gray-500">{formatDate(r.training_start)} – {formatDate(r.training_end)}</span> },
          { key: 'seats', header: 'ที่นั่ง', render: (r) => <span className="text-sm">{r.enrolled_count || 0}/{r.seat_capacity}</span> },
          { key: 'is_cancelled', header: 'สถานะ', render: (r) => statusBadge(r.is_cancelled ? 'cancelled' : 'active') },
        ]}
      />

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditSession(null) }} title={editSession ? 'แก้ไขรุ่น' : 'เพิ่มรุ่น'}>
        <SessionForm
          session={editSession}
          onSubmit={async (data) => { await saveMutation.mutateAsync(data) }}
          onCancel={() => { setIsModalOpen(false); setEditSession(null) }}
          isLoading={saveMutation.isPending}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.session_id)}
        title="ลบรุ่น"
        message={`คุณต้องการลบรุ่น "${deleteTarget?.session_label}" หรือไม่?`}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}
