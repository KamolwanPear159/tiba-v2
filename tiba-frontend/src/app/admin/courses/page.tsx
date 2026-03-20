'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { courseService } from '@/lib/api/services/course.service'
import { mockCourses } from '@/lib/api/mock/courses'
import { formatCurrency } from '@/lib/utils/format'
import {
  Search,
  Calendar,
  SlidersHorizontal,
  Plus,
  Eye,
  FileText,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react'
import type { Course } from '@/types'

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
const PAGE_SIZE = 10

// ─── Status helpers ──────────────────────────────────────────────────────────

type StatusKey = 'upcoming' | 'soon' | 'ongoing' | 'finished'

const STATUS_LABELS: Record<StatusKey, string> = {
  upcoming: 'ยังไม่ถึงกำหนด',
  soon: 'ใกล้ถึงกำหนด',
  ongoing: 'ระหว่างอบรม',
  finished: 'จบการอบรม',
}

const STATUS_STYLES: Record<StatusKey, React.CSSProperties> = {
  upcoming: { color: '#7c3aed', backgroundColor: '#ede9fe' },
  soon: { color: '#d97706', backgroundColor: '#fef3c7' },
  ongoing: { color: '#1d4ed8', backgroundColor: '#dbeafe' },
  finished: { color: '#15803d', backgroundColor: '#dcfce7' },
}

function getStatusKey(index: number): StatusKey {
  const keys: StatusKey[] = ['upcoming', 'soon', 'ongoing', 'finished']
  return keys[index % 4]
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ statusKey }: { statusKey: StatusKey }) {
  return (
    <span
      style={{
        ...STATUS_STYLES[statusKey],
        display: 'inline-block',
        padding: '2px 12px',
        borderRadius: 999,
        fontSize: 15,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-thai)',
      }}
    >
      {STATUS_LABELS[statusKey]}
    </span>
  )
}

// ─── Action Dropdown ─────────────────────────────────────────────────────────

interface ActionDropdownProps {
  course: Course
  statusKey: StatusKey
  onClose: () => void
  onDelete: (c: Course) => void
  onEdit: (id: string) => void
  onView: (id: string) => void
  onSummary: (id: string) => void
}

function ActionDropdown({ course, statusKey, onClose, onDelete, onEdit, onView, onSummary }: ActionDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    fontSize: 16,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'var(--font-thai)',
    color: '#374151',
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        right: 0,
        top: '100%',
        marginTop: 4,
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        zIndex: 100,
        minWidth: 160,
        overflow: 'hidden',
      }}
    >
      {/* ดูรายการ */}
      <button
        style={menuItemStyle}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9fafb')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={() => { onView(course.course_id); onClose() }}
      >
        <Eye size={15} color="#16a34a" />
        <span style={{ color: '#16a34a' }}>ดูรายการ</span>

      </button>

      {/* ดูตัวอย่าง */}
      <button
        style={menuItemStyle}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9fafb')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={() => { window.open(`/courses/${course.course_id}`, '_blank'); onClose() }}
      >
        <Eye size={15} color="#374151" />
        <span>ดูตัวอย่าง</span>
      </button>

      {/* สรุปการอบรม — only for finished */}
      {statusKey === 'finished' && (
        <button
          style={menuItemStyle}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9fafb')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          onClick={() => { onSummary(course.course_id); onClose() }}
        >
          <FileText size={15} color="#374151" />
          <span>สรุปการอบรม</span>
        </button>
      )}

      {/* แก้ไข */}
      <button
        style={menuItemStyle}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9fafb')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={() => { onEdit(course.course_id); onClose() }}
      >
        <Pencil size={15} color="#374151" />
        <span>แก้ไข</span>
      </button>

      {/* ลบ */}
      <button
        style={{ ...menuItemStyle, color: '#dc2626' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff1f2')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={() => { onDelete(course); onClose() }}
      >
        <Trash2 size={15} color="#dc2626" />
        <span style={{ color: '#dc2626' }}>ลบ</span>
      </button>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (p: number) => void
}

function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  // Build page numbers with ellipsis
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const btnBase: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    color: '#374151',
    fontFamily: 'var(--font-thai)',
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderTop: '1px solid #f3f4f6',
      }}
    >
      <span style={{ fontSize: 16, color: '#6b7280', fontFamily: 'var(--font-thai)' }}>
        แสดง {from} ถึง {to} จาก {totalItems} รายการ
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          style={{ ...btnBase, opacity: page === 1 ? 0.4 : 1 }}
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '0 6px', color: '#9ca3af', fontSize: 15 }}>
              …
            </span>
          ) : (
            <button
              key={p}
              style={{
                ...btnBase,
                background: p === page ? '#132953' : '#fff',
                color: p === page ? '#fff' : '#374151',
                border: p === page ? '1px solid #132953' : '1px solid #e5e7eb',
                fontWeight: p === page ? 600 : 400,
              }}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </button>
          )
        )}

        <button
          style={{ ...btnBase, opacity: page === totalPages ? 0.4 : 1 }}
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  const qc = useQueryClient()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [openActionId, setOpenActionId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-courses', page, search],
    queryFn: () => {
      if (useMock) {
        const filtered = mockCourses.filter(c => !search || c.title.includes(search))
        const sliced = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        return {
          data: sliced,
          pagination: {
            page,
            page_size: PAGE_SIZE,
            total_items: filtered.length,
            total_pages: Math.ceil(filtered.length / PAGE_SIZE) || 1,
          },
        }
      }
      return courseService.getCourses({ page, page_size: PAGE_SIZE, search })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: () => {
      toast.success('ลบสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-courses'] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const courses = data?.data || []
  const pagination = data?.pagination

  const totalPages = pagination?.total_pages || 1
  const totalItems = pagination?.total_items || 0

  // Column header style
  const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 15,
    fontWeight: 600,
    color: '#6b7280',
    borderBottom: '1px solid #f3f4f6',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-thai)',
    backgroundColor: '#f9fafb',
  }

  const tdStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontSize: 16,
    color: '#374151',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'middle',
    fontFamily: 'var(--font-thai)',
  }

  return (
    <>
      <div
        style={{
          padding: '28px 32px',
          minHeight: '100vh',
          backgroundColor: '#f8f9fb',
          fontFamily: 'var(--font-thai)',
        }}
      >
        {/* Page title */}
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#111827',
            marginBottom: 20,
            fontFamily: 'var(--font-thai)',
          }}
        >
          จัดการคอร์สอบรม
        </h1>

        {/* Controls bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="ค้นหาชื่อ..."
              style={{
                width: '100%',
                height: 42,
                paddingLeft: 16,
                paddingRight: 42,
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#f5f5f5',
                fontSize: 16,
                color: '#374151',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'var(--font-thai)',
              }}
            />
            <Search
              size={16}
              color="#9ca3af"
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          {/* Date filter */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 42,
              padding: '0 16px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              backgroundColor: '#fff',
              fontSize: 16,
              color: '#374151',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-thai)',
            }}
          >
            <Calendar size={16} color="#6b7280" />
            เลือกวันที่
          </button>

          {/* Filter */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 42,
              padding: '0 16px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              backgroundColor: '#fff',
              fontSize: 16,
              color: '#374151',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-thai)',
            }}
          >
            <SlidersHorizontal size={16} color="#6b7280" />
            ฟิลเตอร์
          </button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Create button */}
          <button
            onClick={() => router.push('/admin/courses/create')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 42,
              padding: '0 20px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#132953',
              color: '#fff',
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-thai)',
            }}
          >
            <Plus size={16} />
            สร้างคอร์สอบรม
          </button>
        </div>

        {/* Table card */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            border: '1px solid #f3f4f6',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>ชื่ออบรม</th>
                  <th style={thStyle}>สถานะ</th>
                  <th style={thStyle}>วันเวลาอบรม</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>ราคาคอร์ส</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>ผู้สมัคร</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>รอยืนยัน</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>สำเร็จ</th>
                  <th style={thStyle}>วันที่สร้าง</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} style={{ ...tdStyle, textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ ...tdStyle, textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  courses.map((course, index) => {
                    const globalIndex = (page - 1) * PAGE_SIZE + index
                    const statusKey = getStatusKey(globalIndex)
                    const isOpen = openActionId === course.course_id

                    return (
                      <tr
                        key={course.course_id}
                        style={{ transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* ชื่ออบรม */}
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{course.title}</span>
                        </td>

                        {/* สถานะ */}
                        <td style={tdStyle}>
                          <StatusBadge statusKey={statusKey} />
                        </td>

                        {/* วันเวลาอบรม */}
                        <td style={tdStyle}>
                          <span style={{ color: '#6b7280', fontSize: 15 }}>-</span>
                        </td>

                        {/* ราคาคอร์ส */}
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          {formatCurrency(course.price_general)}
                        </td>

                        {/* ผู้สมัคร (enrolled/capacity — requires session data; show sessions count for now) */}
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ color: '#374151' }}>-/-</span>
                        </td>

                        {/* รอยืนยัน */}
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ color: '#374151' }}>0</span>
                        </td>

                        {/* สำเร็จ */}
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ color: '#374151' }}>0</span>
                        </td>

                        {/* วันที่สร้าง */}
                        <td style={tdStyle}>
                          <span style={{ color: '#6b7280', fontSize: 15 }}>{formatDate(course.created_at)}</span>
                        </td>

                        {/* การจัดการ */}
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                setOpenActionId(isOpen ? null : course.course_id)
                              }}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: '1px solid #e5e7eb',
                                backgroundColor: isOpen ? '#f3f4f6' : '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <MoreVertical size={16} color="#6b7280" />
                            </button>

                            {isOpen && (
                              <ActionDropdown
                                course={course}
                                statusKey={statusKey}
                                onClose={() => setOpenActionId(null)}
                                onDelete={setDeleteTarget}
                                onEdit={id => router.push(`/admin/courses/${id}/edit`)}
                                onView={id => router.push(`/admin/courses/${id}`)}
                                onSummary={id => router.push(`/admin/courses/${id}/summary`)}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalItems > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.course_id)}
        title="ลบหลักสูตร"
        message={`คุณต้องการลบ "${deleteTarget?.title}" หรือไม่? การลบจะลบรุ่นทั้งหมดด้วย`}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}
