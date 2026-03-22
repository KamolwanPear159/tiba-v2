'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminService } from '@/lib/api/services/admin.service'
import { formatDateTime } from '@/lib/utils/format'
import type { SubUserRequest } from '@/types'

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending:  { label: 'รอดำเนินการ', color: '#92610b', bg: '#fff8e6' },
    approved: { label: 'อนุมัติแล้ว', color: '#166534', bg: '#dcfce7' },
    rejected: { label: 'ปฏิเสธแล้ว', color: '#991b1b', bg: '#fee2e2' },
  }
  const s = map[status] ?? { label: status, color: '#6b7280', bg: '#f3f4f6' }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 12px', borderRadius: 999,
      fontSize: 13, fontWeight: 600,
      color: s.color, backgroundColor: s.bg,
      fontFamily: 'var(--font-thai)',
    }}>
      {s.label}
    </span>
  )
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onClose,
  isLoading,
}: {
  title: string
  message: string
  confirmLabel: string
  confirmColor: string
  onConfirm: () => void
  onClose: () => void
  isLoading: boolean
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 420, width: '100%',
          backgroundColor: '#fff', borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          padding: '32px',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 18, color: '#0a0a0a', margin: '0 0 12px' }}>
          {title}
        </h3>
        <p style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: '#7b7b7b', margin: '0 0 28px', lineHeight: '22px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px', borderRadius: 8, border: '1.5px solid #d1d5db',
              background: '#fff', cursor: 'pointer',
              fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 15, color: '#374151',
            }}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: confirmColor, cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 15, color: '#fff',
            }}
          >
            {isLoading ? 'กำลังดำเนินการ...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSubUserRequestsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [approveTarget, setApproveTarget] = useState<SubUserRequest | null>(null)
  const [rejectTarget, setRejectTarget]   = useState<SubUserRequest | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sub-user-requests', page, search],
    queryFn: () => adminService.getSubUserRequests({ page, page_size: 10, search }),
  })

  const requests: SubUserRequest[] = data?.data ?? []
  const pagination = data?.pagination

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.updateSubUserRequest(id, 'approved'),
    onSuccess: () => {
      toast.success('อนุมัติคำขอสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-sub-user-requests'] })
      setApproveTarget(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่'),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminService.updateSubUserRequest(id, 'rejected'),
    onSuccess: () => {
      toast.success('ปฏิเสธคำขอแล้ว')
      qc.invalidateQueries({ queryKey: ['admin-sub-user-requests'] })
      setRejectTarget(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่'),
  })

  return (
    <div style={{ fontFamily: 'var(--font-thai)', padding: '32px 40px', backgroundColor: '#f8f9fc', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1f4488', margin: 0 }}>
          คำขอบัญชีผู้แทนรอง
        </h1>
        <p style={{ fontSize: 14, color: '#7b7b7b', margin: '6px 0 0' }}>
          ตรวจสอบและอนุมัติคำขอเพิ่มบัญชีผู้แทนรองของสมาชิก
        </p>
      </div>

      {/* Search */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 16, padding: '20px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24,
      }}>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="ค้นหาชื่อบัญชีหลัก / อีเมล..."
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '1.5px solid #e5e7eb', borderRadius: 10,
            padding: '10px 16px', fontSize: 15,
            fontFamily: 'var(--font-thai)', outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden',
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid #e5e7eb', borderTopColor: '#1f4488',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'var(--font-thai)', color: '#9ca3af', fontSize: 16 }}>ไม่พบคำขอบัญชีผู้แทนรอง</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 850 }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f4ff', borderBottom: '1px solid #e5e7eb' }}>
                  {['บัญชีหลัก', 'อีเมลที่เชิญ', 'สิทธิ์', 'วันที่', 'สถานะ', 'การจัดการ'].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 16px', textAlign: 'left',
                        fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 13,
                        color: '#1f4488', whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr
                    key={req.request_id}
                    style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafbff')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                  >
                    {/* บัญชีหลัก */}
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 15, color: '#0a0a0a', margin: 0 }}>
                        {req.parent_member_name}
                      </p>
                    </td>

                    {/* อีเมลที่เชิญ */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#374151' }}>
                        {req.sub_user_email}
                      </span>
                      {req.sub_user_name && (
                        <p style={{ fontFamily: 'var(--font-thai)', fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
                          {req.sub_user_name}
                        </p>
                      )}
                    </td>

                    {/* สิทธิ์ */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 12px', borderRadius: 999,
                        fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-thai)',
                        backgroundColor: '#f0f4ff', color: '#1f4488',
                      }}>
                        ผู้แทนรอง
                      </span>
                    </td>

                    {/* วันที่ */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#9ca3af' }}>
                        {formatDateTime(req.created_at)}
                      </span>
                    </td>

                    {/* สถานะ */}
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={req.status} />
                    </td>

                    {/* การจัดการ */}
                    <td style={{ padding: '14px 16px' }}>
                      {req.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => setApproveTarget(req)}
                            style={{
                              padding: '7px 14px', borderRadius: 7, border: 'none',
                              background: '#126f38', cursor: 'pointer',
                              fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 13, color: '#fff',
                            }}
                          >
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => setRejectTarget(req)}
                            style={{
                              padding: '7px 14px', borderRadius: 7, border: 'none',
                              background: '#fee2e2', cursor: 'pointer',
                              fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 13, color: '#dc2626',
                            }}
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#d1d5db' }}>–</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderTop: '1px solid #f3f4f6',
            flexWrap: 'wrap', gap: 12,
          }}>
            <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b' }}>
              ทั้งหมด {pagination.total_items.toLocaleString()} รายการ
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 14,
                    backgroundColor: p === page ? '#1f4488' : '#f0f4ff',
                    color: p === page ? '#fff' : '#1f4488',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Approve confirm */}
      {approveTarget && (
        <ConfirmDialog
          title="อนุมัติคำขอบัญชีผู้แทนรอง"
          message={`คุณต้องการอนุมัติคำขอจาก ${approveTarget.parent_member_name} สำหรับอีเมล ${approveTarget.sub_user_email} ใช่หรือไม่?`}
          confirmLabel="อนุมัติ"
          confirmColor="#126f38"
          onConfirm={() => approveMutation.mutate(approveTarget.request_id)}
          onClose={() => setApproveTarget(null)}
          isLoading={approveMutation.isPending}
        />
      )}

      {/* Reject confirm */}
      {rejectTarget && (
        <ConfirmDialog
          title="ปฏิเสธคำขอบัญชีผู้แทนรอง"
          message={`คุณต้องการปฏิเสธคำขอจาก ${rejectTarget.parent_member_name} สำหรับอีเมล ${rejectTarget.sub_user_email} ใช่หรือไม่?`}
          confirmLabel="ยืนยันการปฏิเสธ"
          confirmColor="#dc2626"
          onConfirm={() => rejectMutation.mutate(rejectTarget.request_id)}
          onClose={() => setRejectTarget(null)}
          isLoading={rejectMutation.isPending}
        />
      )}
    </div>
  )
}
