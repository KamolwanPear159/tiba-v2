'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { adminService } from '@/lib/api/services/admin.service'
import { formatDateTime } from '@/lib/utils/format'

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: 'รอดำเนินการ', color: '#92610b', bg: '#fff8e6' },
    confirmed: { label: 'อนุมัติแล้ว', color: '#166534', bg: '#dcfce7' },
    cancelled: { label: 'ปฏิเสธแล้ว', color: '#991b1b', bg: '#fee2e2' },
    completed: { label: 'เสร็จสิ้น',  color: '#1d4ed8', bg: '#dbeafe' },
    accepted:  { label: 'อนุมัติแล้ว', color: '#166534', bg: '#dcfce7' },
    rejected:  { label: 'ปฏิเสธแล้ว', color: '#991b1b', bg: '#fee2e2' },
  }
  const s = map[status] ?? { label: status, color: '#6b7280', bg: '#f3f4f6' }
  return (
    <span style={{
      display: 'inline-block', padding: '4px 16px', borderRadius: 999,
      fontSize: 14, fontWeight: 700,
      color: s.color, backgroundColor: s.bg,
      fontFamily: 'var(--font-thai)',
    }}>
      {s.label}
    </span>
  )
}

// ─── Reject modal ─────────────────────────────────────────────────────────────

function RejectModal({
  onClose,
  onConfirm,
  isLoading,
}: {
  onClose: () => void
  onConfirm: (note: string) => void
  isLoading: boolean
}) {
  const [note, setNote] = useState('')
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
          maxWidth: 480, width: '100%',
          backgroundColor: '#fff', borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid #e5e7eb',
        }}>
          <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 18, color: '#dc2626' }}>
            ปฏิเสธคำขอสมาชิก
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#6b7280', lineHeight: 1 }}>
            ×
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 8 }}>
            หมายเหตุ (เหตุผลในการปฏิเสธ)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="ระบุเหตุผล..."
            rows={4}
            style={{
              width: '100%', boxSizing: 'border-box',
              border: '1.5px solid #d1d5db', borderRadius: 10,
              padding: '10px 14px', resize: 'vertical',
              fontFamily: 'var(--font-thai)', fontSize: 15, color: '#0a0a0a', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
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
              onClick={() => onConfirm(note)}
              disabled={isLoading}
              style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: '#dc2626', cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 15, color: '#fff',
              }}
            >
              {isLoading ? 'กำลังดำเนินการ...' : 'ยืนยันการปฏิเสธ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 0', borderBottom: '1px solid #f3f4f6',
    }}>
      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', minWidth: 180, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: '#0a0a0a', fontWeight: 500 }}>
        {value ?? '–'}
      </span>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminRegistrationDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const qc = useQueryClient()
  const [showRejectModal, setShowRejectModal] = useState(false)

  const { data: reg, isLoading, error } = useQuery({
    queryKey: ['admin-registration', id],
    queryFn: () => adminService.getAssociationRegistration(id),
    enabled: !!id,
  })

  const approveMutation = useMutation({
    mutationFn: () => adminService.updateAssociationRegistrationStatus(id, 'accepted'),
    onSuccess: () => {
      toast.success('อนุมัติคำขอสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-registration', id] })
      qc.invalidateQueries({ queryKey: ['admin-association-registrations'] })
    },
    onError: () => toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่'),
  })

  const rejectMutation = useMutation({
    mutationFn: (note: string) => adminService.updateAssociationRegistrationStatus(id, 'rejected', note),
    onSuccess: () => {
      toast.success('ปฏิเสธคำขอแล้ว')
      qc.invalidateQueries({ queryKey: ['admin-registration', id] })
      qc.invalidateQueries({ queryKey: ['admin-association-registrations'] })
      setShowRejectModal(false)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่'),
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid #e5e7eb', borderTopColor: '#1f4488',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !reg) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 40px', fontFamily: 'var(--font-thai)' }}>
        <p style={{ color: '#7b7b7b', fontSize: 16, marginBottom: 16 }}>ไม่พบข้อมูลคำขอสมาชิก</p>
        <Link href="/admin/registrations" style={{ color: '#1f4488', fontSize: 15 }}>← กลับรายการคำขอสมาชิก</Link>
      </div>
    )
  }

  // Cast to any for extended fields the API may return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const regAny = reg as any

  const isPending = reg.status === 'pending'

  return (
    <div style={{ fontFamily: 'var(--font-thai)', padding: '32px 40px', backgroundColor: '#f8f9fc', minHeight: '100vh' }}>

      {/* Back + Header */}
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/admin/registrations"
          style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#1f4488', textDecoration: 'none', marginBottom: 12, display: 'inline-block' }}
        >
          ← กลับรายการคำขอสมาชิก
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f4488', margin: 0 }}>
            รายละเอียดคำขอสมาชิกสมาคม
          </h1>
          <StatusBadge status={reg.status} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* Left: Registration details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Personal info */}
          <div style={{
            backgroundColor: '#fff', borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px 32px',
          }}>
            <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 17, color: '#1f4488', margin: '0 0 4px' }}>
              ข้อมูลผู้สมัคร
            </h2>
            <InfoRow label="ชื่อ-นามสกุล" value={reg.member_name} />
            <InfoRow label="อีเมล" value={reg.member_email} />
            <InfoRow label="วันที่ยื่นคำขอ" value={formatDateTime(reg.registered_at)} />
            <InfoRow label="รหัสคำขอ" value={
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#6b7280' }}>{reg.registration_id}</span>
            } />
          </div>

          {/* Organization info (if available from API) */}
          {(regAny.org_name || regAny.tax_id || regAny.entity_type) && (
            <div style={{
              backgroundColor: '#fff', borderRadius: 16,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px 32px',
            }}>
              <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 17, color: '#1f4488', margin: '0 0 4px' }}>
                ข้อมูลองค์กร
              </h2>
              {regAny.entity_type && (
                <InfoRow label="ประเภทสมาชิก" value={regAny.entity_type === 'company' ? 'บริษัท / นิติบุคคล' : 'บุคคลธรรมดา'} />
              )}
              {regAny.org_name && <InfoRow label="ชื่อองค์กร / บริษัท" value={regAny.org_name} />}
              {regAny.tax_id && <InfoRow label="เลขประจำตัวผู้เสียภาษี" value={regAny.tax_id} />}
              {regAny.address && <InfoRow label="ที่อยู่" value={regAny.address} />}
              {regAny.phone && <InfoRow label="เบอร์โทรศัพท์" value={regAny.phone} />}
            </div>
          )}

          {/* Documents */}
          {regAny.docs && Array.isArray(regAny.docs) && regAny.docs.length > 0 && (
            <div style={{
              backgroundColor: '#fff', borderRadius: 16,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px 32px',
            }}>
              <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 17, color: '#1f4488', margin: '0 0 16px' }}>
                เอกสารประกอบ
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {regAny.docs.map((doc: string, i: number) => (
                  <a
                    key={i}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 16px', borderRadius: 10,
                      border: '1.5px solid #e5e7eb', textDecoration: 'none',
                      fontFamily: 'var(--font-thai)', fontSize: 14, color: '#1f4488',
                      backgroundColor: '#f0f4ff',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4 2h7l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#1f4488" strokeWidth="1.5"/>
                      <path d="M11 2v4h4" stroke="#1f4488" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    เอกสาร {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Admin note (if any) */}
          {regAny.admin_note && (
            <div style={{
              backgroundColor: '#fff3cd', borderRadius: 16, padding: '20px 24px',
              border: '1px solid #fcd34d',
            }}>
              <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 14, color: '#92610b', margin: '0 0 6px' }}>
                หมายเหตุจากผู้ดูแล
              </p>
              <p style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: '#78350f', margin: 0 }}>
                {regAny.admin_note}
              </p>
            </div>
          )}

        </div>

        {/* Right: Actions */}
        <div>
          {isPending && (
            <div style={{
              backgroundColor: '#fff', borderRadius: 16,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px',
            }}>
              <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 17, color: '#1f4488', margin: '0 0 20px' }}>
                การจัดการ
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  style={{
                    padding: '13px 20px', borderRadius: 10, border: 'none',
                    background: '#126f38', cursor: approveMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: approveMutation.isPending ? 0.7 : 1,
                    fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 16, color: '#fff',
                    width: '100%',
                  }}
                >
                  {approveMutation.isPending ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={rejectMutation.isPending}
                  style={{
                    padding: '13px 20px', borderRadius: 10, border: 'none',
                    background: '#fee2e2', cursor: rejectMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: rejectMutation.isPending ? 0.7 : 1,
                    fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 16, color: '#dc2626',
                    width: '100%',
                  }}
                >
                  ปฏิเสธ
                </button>
              </div>
            </div>
          )}

          {!isPending && (
            <div style={{
              backgroundColor: '#fff', borderRadius: 16,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '24px',
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: '#7b7b7b', margin: 0 }}>
                คำขอนี้ได้รับการดำเนินการแล้ว
              </p>
              <div style={{ marginTop: 12 }}>
                <StatusBadge status={reg.status} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <RejectModal
          onClose={() => setShowRejectModal(false)}
          onConfirm={(note) => rejectMutation.mutate(note)}
          isLoading={rejectMutation.isPending}
        />
      )}
    </div>
  )
}
