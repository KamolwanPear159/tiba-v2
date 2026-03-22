'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminService } from '@/lib/api/services/admin.service'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import type { Order } from '@/types'

// ─── Status helpers ────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'pending' | 'paid' | 'failed'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',     label: 'ทั้งหมด' },
  { key: 'pending', label: 'รอยืนยัน' },
  { key: 'paid',    label: 'ยืนยันแล้ว' },
  { key: 'failed',  label: 'ปฏิเสธแล้ว' },
]

function statusBadgeInline(status: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending:  { label: 'รอยืนยัน',   color: '#92610b', bg: '#fff8e6' },
    paid:     { label: 'ยืนยันแล้ว', color: '#166534', bg: '#dcfce7' },
    failed:   { label: 'ปฏิเสธแล้ว', color: '#991b1b', bg: '#fee2e2' },
    refunded: { label: 'คืนเงิน',    color: '#6b7280', bg: '#f3f4f6' },
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

// ─── Slip modal ────────────────────────────────────────────────────────────────

function SlipModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', maxWidth: 480, width: '100%',
          backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
        }}>
          <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 16, color: '#1f4488' }}>
            สลิปการชำระเงิน
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#6b7280', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="สลิปการชำระเงิน"
          style={{ width: '100%', display: 'block', maxHeight: '70vh', objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}

// ─── Reject note modal ─────────────────────────────────────────────────────────

function RejectModal({
  order,
  onClose,
  onConfirm,
  isLoading,
}: {
  order: Order
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
          backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
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
          <div style={{ backgroundColor: '#f8f9fc', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 15, color: '#0a0a0a', margin: '0 0 4px' }}>
              {order.member_name}
            </p>
            <p style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#7b7b7b', margin: 0 }}>
              {order.course_title} · {formatCurrency(order.amount)}
            </p>
          </div>
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [slipUrl, setSlipUrl] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Order | null>(null)

  const statusParam = activeTab === 'all' ? undefined : activeTab

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders-v2', page, activeTab, search],
    queryFn: () => adminService.getOrders({ page, page_size: 10, search, status: statusParam }),
  })

  const orders: Order[] = data?.data ?? []
  const pagination = data?.pagination

  const confirmMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      adminService.confirmPayment(id, note),
    onSuccess: () => {
      toast.success('ยืนยันคำสั่งซื้อสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-orders-v2'] })
    },
    onError: () => toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      adminService.rejectPayment(id, note),
    onSuccess: () => {
      toast.success('ปฏิเสธคำสั่งซื้อแล้ว')
      qc.invalidateQueries({ queryKey: ['admin-orders-v2'] })
      setRejectTarget(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่'),
  })

  const handleReject = (note: string) => {
    if (!rejectTarget) return
    rejectMutation.mutate({ id: rejectTarget.order_id, note })
  }

  return (
    <div style={{ fontFamily: 'var(--font-thai)', padding: '32px 40px', backgroundColor: '#f8f9fc', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1f4488', margin: 0 }}>
          จัดการคำสั่งซื้อ
        </h1>
        <p style={{ fontSize: 14, color: '#7b7b7b', margin: '6px 0 0' }}>
          ตรวจสอบและอนุมัติการชำระเงินของสมาชิก
        </p>
      </div>

      {/* Search + Filter */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 16, padding: '20px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24,
      }}>
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="ค้นหาชื่อสมาชิก / คอร์ส..."
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '1.5px solid #e5e7eb', borderRadius: 10,
            padding: '10px 16px', fontSize: 15,
            fontFamily: 'var(--font-thai)', outline: 'none', marginBottom: 16,
          }}
        />

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setPage(1) }}
              style={{
                padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 14,
                backgroundColor: activeTab === t.key ? '#1f4488' : '#f0f4ff',
                color: activeTab === t.key ? '#fff' : '#1f4488',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
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
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'var(--font-thai)', color: '#9ca3af', fontSize: 16 }}>ไม่พบข้อมูลคำสั่งซื้อ</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f4ff', borderBottom: '1px solid #e5e7eb' }}>
                  {['ลำดับ', 'ชื่อสมาชิก', 'คอร์ส', 'จำนวนเงิน', 'วันที่', 'สถานะ', 'สลิป', 'การจัดการ'].map(h => (
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
                {orders.map((order, idx) => (
                  <tr
                    key={order.order_id}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafbff')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                  >
                    {/* ลำดับ */}
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-thai)', fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>
                      {(page - 1) * 10 + idx + 1}
                    </td>

                    {/* ชื่อสมาชิก */}
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 15, color: '#0a0a0a', margin: 0 }}>
                        {order.member_name}
                      </p>
                    </td>

                    {/* คอร์ส */}
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontFamily: 'var(--font-thai)', fontSize: 14, color: '#374151', margin: 0, maxWidth: 220 }}>
                        {order.course_title}
                      </p>
                    </td>

                    {/* จำนวนเงิน */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 15, color: '#ee7429' }}>
                        {formatCurrency(order.amount)}
                      </span>
                    </td>

                    {/* วันที่ */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#9ca3af' }}>
                        {formatDateTime(order.created_at)}
                      </span>
                    </td>

                    {/* สถานะ */}
                    <td style={{ padding: '14px 16px' }}>
                      {statusBadgeInline(order.payment_status)}
                    </td>

                    {/* สลิป */}
                    <td style={{ padding: '14px 16px' }}>
                      {order.slip_url ? (
                        <button
                          onClick={() => setSlipUrl(order.slip_url!)}
                          style={{
                            padding: '6px 14px', borderRadius: 7, border: '1.5px solid #1f4488',
                            background: 'none', cursor: 'pointer',
                            fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 13, color: '#1f4488',
                          }}
                        >
                          ดูสลิป
                        </button>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-thai)', fontSize: 13, color: '#d1d5db' }}>–</span>
                      )}
                    </td>

                    {/* การจัดการ */}
                    <td style={{ padding: '14px 16px' }}>
                      {order.payment_status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => confirmMutation.mutate({ id: order.order_id })}
                            disabled={confirmMutation.isPending}
                            style={{
                              padding: '7px 14px', borderRadius: 7, border: 'none',
                              background: '#126f38', cursor: 'pointer',
                              fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 13, color: '#fff',
                              opacity: confirmMutation.isPending ? 0.6 : 1,
                            }}
                          >
                            ยืนยัน
                          </button>
                          <button
                            onClick={() => setRejectTarget(order)}
                            disabled={rejectMutation.isPending}
                            style={{
                              padding: '7px 14px', borderRadius: 7, border: 'none',
                              background: '#fee2e2', cursor: 'pointer',
                              fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 13, color: '#dc2626',
                              opacity: rejectMutation.isPending ? 0.6 : 1,
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

      {/* Slip modal */}
      {slipUrl && <SlipModal url={slipUrl} onClose={() => setSlipUrl(null)} />}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          order={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
          isLoading={rejectMutation.isPending}
        />
      )}
    </div>
  )
}
