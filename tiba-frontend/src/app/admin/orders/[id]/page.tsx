'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { adminService } from '@/lib/api/services/admin.service'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending:  { label: 'รอยืนยัน',   color: '#92610b', bg: '#fff8e6' },
    paid:     { label: 'ยืนยันแล้ว', color: '#166534', bg: '#dcfce7' },
    failed:   { label: 'ปฏิเสธแล้ว', color: '#991b1b', bg: '#fee2e2' },
    refunded: { label: 'คืนเงิน',    color: '#6b7280', bg: '#f3f4f6' },
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

// ─── Reject note modal ─────────────────────────────────────────────────────────

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
            ปฏิเสธคำสั่งซื้อ
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#6b7280', lineHeight: 1 }}
          >
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
              fontFamily: 'var(--font-thai)', fontSize: 15, color: '#0a0a0a',
              outline: 'none',
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
      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#7b7b7b', minWidth: 160, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 15, color: '#0a0a0a', fontWeight: 500 }}>
        {value}
      </span>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const qc = useQueryClient()
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showSlip, setShowSlip] = useState(false)

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => adminService.getOrder(id),
    enabled: !!id,
  })

  const confirmMutation = useMutation({
    mutationFn: () => adminService.confirmPayment(id),
    onSuccess: () => {
      toast.success('ยืนยันคำสั่งซื้อสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-order', id] })
      qc.invalidateQueries({ queryKey: ['admin-orders-v2'] })
    },
    onError: () => toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่'),
  })

  const rejectMutation = useMutation({
    mutationFn: (note: string) => adminService.rejectPayment(id, note),
    onSuccess: () => {
      toast.success('ปฏิเสธคำสั่งซื้อแล้ว')
      qc.invalidateQueries({ queryKey: ['admin-order', id] })
      qc.invalidateQueries({ queryKey: ['admin-orders-v2'] })
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

  if (error || !order) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 40px', fontFamily: 'var(--font-thai)' }}>
        <p style={{ color: '#7b7b7b', fontSize: 16, marginBottom: 16 }}>ไม่พบข้อมูลคำสั่งซื้อ</p>
        <Link href="/admin/orders" style={{ color: '#1f4488', fontSize: 15 }}>← กลับรายการคำสั่งซื้อ</Link>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'var(--font-thai)', padding: '32px 40px', backgroundColor: '#f8f9fc', minHeight: '100vh' }}>

      {/* Back + Header */}
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/admin/orders"
          style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#1f4488', textDecoration: 'none', marginBottom: 12, display: 'inline-block' }}
        >
          ← กลับรายการคำสั่งซื้อ
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f4488', margin: 0 }}>
            รายละเอียดคำสั่งซื้อ
          </h1>
          <StatusBadge status={order.payment_status} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

        {/* Left: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Member info */}
          <div style={{
            backgroundColor: '#fff', borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px 32px',
          }}>
            <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 17, color: '#1f4488', margin: '0 0 4px' }}>
              ข้อมูลสมาชิก
            </h2>
            <InfoRow label="ชื่อสมาชิก" value={order.member_name} />
            <InfoRow label="รหัสคำสั่งซื้อ" value={
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#6b7280' }}>{order.order_id}</span>
            } />
          </div>

          {/* Course info */}
          <div style={{
            backgroundColor: '#fff', borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px 32px',
          }}>
            <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 17, color: '#1f4488', margin: '0 0 4px' }}>
              ข้อมูลคอร์ส
            </h2>
            <InfoRow label="ชื่อคอร์ส" value={order.course_title} />
            <InfoRow label="จำนวนเงิน" value={
              <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 20, color: '#ee7429' }}>
                {formatCurrency(order.amount)}
              </span>
            } />
            <InfoRow label="วิธีชำระเงิน" value={order.payment_method ?? '–'} />
            <InfoRow label="วันที่สั่งซื้อ" value={formatDateTime(order.created_at)} />
            {order.paid_at && (
              <InfoRow label="วันที่ชำระเงิน" value={formatDateTime(order.paid_at)} />
            )}
          </div>

        </div>

        {/* Right: Slip + Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Slip */}
          <div style={{
            backgroundColor: '#fff', borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px',
          }}>
            <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 17, color: '#1f4488', margin: '0 0 16px' }}>
              สลิปการชำระเงิน
            </h2>
            {order.slip_url ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.slip_url}
                  alt="สลิปการชำระเงิน"
                  onClick={() => setShowSlip(true)}
                  style={{
                    width: '100%', borderRadius: 10, cursor: 'pointer',
                    border: '1.5px solid #e5e7eb',
                    transition: 'opacity 0.15s',
                    maxHeight: 320, objectFit: 'contain',
                  }}
                />
                <p style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#9ca3af', textAlign: 'center', margin: '8px 0 0' }}>
                  คลิกเพื่อดูแบบเต็ม
                </p>
              </div>
            ) : (
              <div style={{
                height: 160, borderRadius: 10, backgroundColor: '#f8f9fc',
                border: '2px dashed #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#d1d5db' }}>ยังไม่มีสลิป</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {order.payment_status === 'pending' && (
            <div style={{
              backgroundColor: '#fff', borderRadius: 16,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px',
            }}>
              <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 17, color: '#1f4488', margin: '0 0 16px' }}>
                การจัดการ
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={() => confirmMutation.mutate()}
                  disabled={confirmMutation.isPending}
                  style={{
                    padding: '13px 20px', borderRadius: 10, border: 'none',
                    background: '#126f38', cursor: confirmMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: confirmMutation.isPending ? 0.7 : 1,
                    fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 16, color: '#fff',
                    width: '100%',
                  }}
                >
                  {confirmMutation.isPending ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
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
                  ปฏิเสธคำสั่งซื้อ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slip fullscreen overlay */}
      {showSlip && order.slip_url && (
        <div
          onClick={() => setShowSlip(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 40,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={order.slip_url}
            alt="สลิปการชำระเงิน"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12 }}
          />
          <button
            onClick={() => setShowSlip(false)}
            style={{
              position: 'fixed', top: 20, right: 20,
              background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
              borderRadius: '50%', width: 40, height: 40,
              color: '#fff', fontSize: 20, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      )}

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
