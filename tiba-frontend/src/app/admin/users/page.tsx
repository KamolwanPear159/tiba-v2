'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Search, Calendar, Plus, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { adminService } from '@/lib/api/services/admin.service'
import type { AdminUser } from '@/types'

const F = 'var(--font-thai)'

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  superadmin: { label: 'Super Admin', bg: '#fef3c7', color: '#b45309' },
  admin:      { label: 'Admin',       bg: '#dbeafe', color: '#1d4ed8' },
  editor:     { label: 'Editor',      bg: '#dcfce7', color: '#15803d' },
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', backgroundColor: value ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

// ─── Action Menu ──────────────────────────────────────────────────────────────
function ActionMenu({ user, onToggle }: { user: AdminUser; onToggle: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#6b7280', fontSize: 20, lineHeight: 1 }}>
        ⋮
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e6f0', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', minWidth: 140, padding: '4px 0' }}>
          <button onClick={() => { onToggle(); setOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: user.is_active ? '#ef4444' : '#16a34a', fontFamily: F }}>
            {user.is_active ? 'ระงับบัญชี' : 'เปิดใช้งาน'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Create User Modal ────────────────────────────────────────────────────────
function CreateUserModal({ onClose, onSave }: { onClose: () => void; onSave: (data: { email: string; first_name: string; last_name: string; role: string; password: string }) => void }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('admin')
  const [password, setPassword] = useState('')

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) { toast.error('กรุณากรอกชื่อ-นามสกุล'); return }
    if (!email.includes('@')) { toast.error('อีเมลไม่ถูกต้อง'); return }
    if (password.length < 8) { toast.error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return }
    onSave({ email, first_name: firstName, last_name: lastName, role, password })
  }

  const inputStyle: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', border: '1px solid #e5e6f0', borderRadius: 8, fontSize: 16, color: '#374151', outline: 'none', fontFamily: F, boxSizing: 'border-box', backgroundColor: '#fff' }
  const labelStyle: React.CSSProperties = { fontSize: 15, color: '#374151', fontFamily: F, display: 'block', marginBottom: 4, fontWeight: 500 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 16, width: 480, padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', fontFamily: F }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>สร้างผู้ใช้งาน</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>ชื่อ <span style={{ color: '#ef4444' }}>*</span></label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} placeholder="ชื่อ..." />
          </div>
          <div>
            <label style={labelStyle}>นามสกุล <span style={{ color: '#ef4444' }}>*</span></label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} placeholder="นามสกุล..." />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>อีเมล <span style={{ color: '#ef4444' }}>*</span></label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="email@example.com" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>บทบาท</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
            <option value="editor">Editor</option>
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>รหัสผ่าน <span style={{ color: '#ef4444' }}>*</span></label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="อย่างน้อย 8 ตัวอักษร" />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e6f0', backgroundColor: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F, color: '#374151' }}>ยกเลิก</button>
          <button onClick={handleSubmit} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: '#132953', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>สร้างผู้ใช้</button>
        </div>
      </div>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }: { page: number; totalPages: number; totalItems: number; pageSize: number; onPageChange: (p: number) => void }) {
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 15, color: '#9ca3af', fontFamily: F }}>แสดง {from} ถึง {to} จาก {totalItems} รายการ</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e6f0', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}><ChevronLeft size={14} /></button>
        {pages.map(p => <button key={p} onClick={() => onPageChange(p)} style={{ width: 32, height: 32, borderRadius: 6, border: p === page ? 'none' : '1px solid #e5e6f0', backgroundColor: p === page ? '#132953' : '#fff', color: p === page ? '#fff' : '#374151', fontSize: 15, cursor: 'pointer', fontFamily: F }}>{p}</button>)}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e6f0', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}><ChevronRight size={14} /></button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminService.getAdminUsers({ page, page_size: 10, search }),
  })

  const createMutation = useMutation({
    mutationFn: (d: { email: string; first_name: string; last_name: string; role: string; password: string }) => adminService.createAdminUser(d),
    onSuccess: () => {
      toast.success('เพิ่มผู้ใช้สำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setShowModal(false)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => adminService.updateAdminUserStatus(id, { is_active }),
    onSuccess: () => {
      toast.success('อัปเดตสำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const users = data?.data ?? []
  const pagination = data?.pagination

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 15, color: '#6b7280', fontWeight: 500, fontFamily: F, borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', whiteSpace: 'nowrap' }
  const tdStyle: React.CSSProperties = { padding: '14px 16px', fontSize: 16, color: '#374151', fontFamily: F, borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }

  const formatDate = (s: string) => { try { return new Date(s).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return s } }

  // Format user_id as TB#### (zero-padded 4 digits)
  const formatUserId = (id: string) => {
    const num = parseInt(id, 10)
    if (!isNaN(num)) return `TB${String(num).padStart(4, '0')}`
    return `TB${id.slice(0, 4).toUpperCase()}`
  }

  return (
    <div style={{ fontFamily: F }}>
      {/* 1. Page title */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20, fontFamily: F }}>ผู้ใช้งาน</h1>

      {/* 2. Controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 400 }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="ค้นหารหัสผู้ใช้งาน, ชื่อ, เบอร์, อีเมล..."
            style={{ width: '100%', height: 42, paddingLeft: 16, paddingRight: 42, borderRadius: 8, border: 'none', backgroundColor: '#f5f5f5', fontSize: 16, color: '#374151', outline: 'none', boxSizing: 'border-box', fontFamily: F }}
          />
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
          <Calendar size={16} color="#6b7280" /> เลือกวันที่
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: 16, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}>
          <Filter size={16} color="#6b7280" /> ตัวกรอง
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42, padding: '0 20px', borderRadius: 8, border: 'none', backgroundColor: '#132953', color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F }}
        >
          <Plus size={16} /> สร้างผู้ใช้งาน
        </button>
      </div>

      {/* 3. Table card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 62, textAlign: 'center', color: '#9ca3af', fontFamily: F }}>กำลังโหลด...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 62, textAlign: 'center', color: '#9ca3af', fontFamily: F }}>ไม่พบข้อมูล</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>ผู้ใช้งาน</th>
                  <th style={thStyle}>เบอร์</th>
                  <th style={thStyle}>อีเมล</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>สถานะ</th>
                  <th style={thStyle}>เข้าใช้งานล่าสุด</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const initial = (user.first_name?.[0] ?? '?').toUpperCase()
                  const rc = ROLE_CONFIG[user.role] ?? { label: user.role, bg: '#f3f4f6', color: '#374151' }
                  return (
                    <tr key={user.user_id}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* ผู้ใช้งาน — gold circle avatar + TB#### + name */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 38, height: 40, borderRadius: '50%', backgroundColor: '#d4a017', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', fontFamily: F }}>{initial}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 14, color: '#9ca3af', fontFamily: F }}>{formatUserId(user.user_id)}</div>
                            <div style={{ fontWeight: 600, color: '#111827', fontFamily: F }}>{user.first_name} {user.last_name}</div>
                          </div>
                        </div>
                      </td>

                      {/* เบอร์ */}
                      <td style={{ ...tdStyle, color: '#6b7280', fontSize: 15 }}>
                        {(user as unknown as { phone?: string }).phone ?? '-'}
                      </td>

                      {/* อีเมล */}
                      <td style={{ ...tdStyle, color: '#6b7280' }}>{user.email}</td>

                      {/* สถานะ Toggle */}
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <Toggle value={user.is_active} onChange={val => toggleMutation.mutate({ id: user.user_id, is_active: val })} />
                        </div>
                      </td>

                      {/* เข้าใช้งานล่าสุด */}
                      <td style={{ ...tdStyle, color: '#9ca3af', fontSize: 15 }}>{formatDate(user.created_at)}</td>

                      {/* การจัดการ */}
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <ActionMenu user={user} onToggle={() => toggleMutation.mutate({ id: user.user_id, is_active: !user.is_active })} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <Pagination page={page} totalPages={pagination.total_pages} totalItems={pagination.total_items} pageSize={10} onPageChange={setPage} />
        )}
      </div>

      {showModal && (
        <CreateUserModal onClose={() => setShowModal(false)} onSave={d => createMutation.mutate(d)} />
      )}
    </div>
  )
}
