'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Calendar, Filter, MoreVertical, Plus, Inbox, Eye, Pencil, Trash2 } from 'lucide-react';
import { adminService } from '@/lib/api/services/admin.service';
import type { Tutor } from '@/types';

const F = 'var(--font-thai)';

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

function Avatar({ name, photoUrl, size = 40 }: { name: string; photoUrl?: string; size?: number }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  return photoUrl ? (
    <img
      src={photoUrl}
      alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: '#e8f0fd',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: '#1f4488', fontFamily: F, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

interface ThreeDotsMenuProps {
  tutorId: string;
  onDelete: () => void;
}

function ThreeDotsMenu({ tutorId, onDelete }: ThreeDotsMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}
      >
        <MoreVertical size={18} color="#666" />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '110%', zIndex: 100,
          background: '#fff', borderRadius: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          border: '1px solid #eee', minWidth: 170, overflow: 'hidden',
        }}>
          {[
            { icon: <Eye size={15} />, label: 'ดูรายละเอียด', action: () => { router.push(`/admin/tutors/${tutorId}`); setOpen(false); } },
            { icon: <Pencil size={15} />, label: 'แก้ไข', action: () => { router.push(`/admin/tutors/${tutorId}/edit`); setOpen(false); } },
            { icon: <Trash2 size={15} />, label: 'ลบ', action: () => { onDelete(); setOpen(false); }, danger: true },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '11px 16px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 16, fontFamily: F,
                color: (item as any).danger ? '#f44336' : '#333',
                textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = (item as any).danger ? '#fff5f5' : '#f5f5f5')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ConfirmDeleteDialogProps {
  tutorName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function ConfirmDeleteDialog({ tutorName, onConfirm, onCancel, isDeleting }: ConfirmDeleteDialogProps) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: F }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ background: '#fff', borderRadius: 12, padding: 34, width: 420, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Trash2 size={24} color="#f44336" />
        </div>
        <h3 style={{ margin: '0 0 8px', textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#1a1a1a', fontFamily: F }}>ยืนยันการลบ</h3>
        <p style={{ margin: '0 0 24px', textAlign: 'center', fontSize: 16, color: '#666', fontFamily: F }}>
          คุณต้องการลบผู้สอน <strong>{tutorName}</strong> ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '13px', border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 17, fontFamily: F, color: '#444' }}>
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{ flex: 1, padding: '13px', border: 'none', borderRadius: 8, background: '#f44336', color: '#fff', cursor: isDeleting ? 'not-allowed' : 'pointer', fontSize: 17, fontFamily: F, opacity: isDeleting ? 0.7 : 1 }}
          >
            {isDeleting ? 'กำลังลบ...' : 'ลบ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[40, 120, 80, 60, 100, 40].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          {i === 0 ? (
            <div style={{ width: 40, height: 42, borderRadius: '50%', background: '#f0f0f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : (
            <div style={{ height: 14, background: '#f0f0f0', borderRadius: 6, width: w, animation: 'pulse 1.5s ease-in-out infinite' }} />
          )}
        </td>
      ))}
    </tr>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      style={{
        width: 42, height: 24, borderRadius: 12, border: 'none',
        background: checked ? '#22c55e' : '#ccc',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background 0.2s', padding: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: checked ? 21 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

export default function TutorsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Tutor | null>(null);
  const PAGE_SIZE = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['tutors', page, search],
    queryFn: () => adminService.getTutors({ page, page_size: PAGE_SIZE, search }),
    placeholderData: (prev) => prev,
  });

  const tutors: Tutor[] = data?.data ?? [];
  const total: number = data?.pagination?.total_items ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const { mutate: toggleStatus, isPending: isToggling } = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      adminService.toggleTutorStatus(id, is_active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tutors'] }),
  });

  const { mutate: deleteTutor, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => adminService.deleteTutor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutors'] });
      setDeleteTarget(null);
    },
  });

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: F }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#1a1a1a', fontFamily: F }}>ผู้สอน</h1>
          <p style={{ margin: '6px 0 0', fontSize: 16, color: '#888', fontFamily: F }}>จัดการรายชื่อผู้สอนในระบบ</p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220, backgroundColor: '#f5f5f5', borderRadius: 8, padding: '0 16px' }}>
            <Search size={16} color="#aaa" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="ค้นหาผู้สอน..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '11px 0', fontSize: 16, fontFamily: F, color: '#333' }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16, fontFamily: F, color: '#444' }}>
            <Calendar size={15} /> วันที่
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16, fontFamily: F, color: '#444' }}>
            <Filter size={15} /> ตัวกรอง
          </button>
          <button
            onClick={() => router.push('/admin/tutors/create')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', border: 'none', borderRadius: 8, background: '#1f4488', color: '#fff', cursor: 'pointer', fontSize: 16, fontFamily: F, fontWeight: 600 }}
          >
            <Plus size={16} /> สร้างผู้สอน
          </button>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fc', borderBottom: '1.5px solid #eee' }}>
                {['รูป', 'ชื่อ', 'ตำแหน่ง', 'สถานะ', 'วันที่-เวลา', 'การจัดการ'].map(col => (
                  <th key={col} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 15, fontWeight: 600, color: '#555', fontFamily: F }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : tutors.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 16px', textAlign: 'center' }}>
                    <Inbox size={40} color="#ccc" style={{ display: 'block', margin: '0 auto 12px' }} />
                    <p style={{ margin: 0, color: '#aaa', fontSize: 17, fontFamily: F }}>ไม่พบข้อมูล</p>
                  </td>
                </tr>
              ) : (
                tutors.map((tutor, idx) => (
                  <tr key={String(tutor.tutor_id)} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <Avatar name={tutor.name} photoUrl={tutor.photo_url} size={40} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 16, fontWeight: 600, color: '#1a1a1a', fontFamily: F }}>
                      {tutor.name}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 15, color: '#555', fontFamily: F }}>
                      {tutor.position}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <ToggleSwitch
                        checked={tutor.is_active}
                        onChange={() => toggleStatus({ id: String(tutor.tutor_id), is_active: !tutor.is_active })}
                        disabled={isToggling}
                      />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 15, color: '#666', fontFamily: F, whiteSpace: 'nowrap' }}>
                      {formatDate(tutor.created_at)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <ThreeDotsMenu
                        tutorId={String(tutor.tutor_id)}
                        onDelete={() => setDeleteTarget(tutor)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 15, color: '#666', fontFamily: F }}>
              แสดง {from} ถึง {to} จาก {total} รายการ
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '7px 16px', border: '1.5px solid #ddd', borderRadius: 7, background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 15, fontFamily: F, color: page === 1 ? '#bbb' : '#333', opacity: page === 1 ? 0.6 : 1 }}
              >
                ก่อนหน้า
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{ padding: '7px 13px', border: '1.5px solid', borderColor: p === page ? '#1f4488' : '#ddd', borderRadius: 7, background: p === page ? '#1f4488' : '#fff', color: p === page ? '#fff' : '#333', cursor: 'pointer', fontSize: 15, fontFamily: F, fontWeight: p === page ? 700 : 400 }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: '7px 16px', border: '1.5px solid #ddd', borderRadius: 7, background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 15, fontFamily: F, color: page === totalPages ? '#bbb' : '#333', opacity: page === totalPages ? 0.6 : 1 }}
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDeleteDialog
          tutorName={deleteTarget.name}
          onConfirm={() => deleteTutor(String(deleteTarget.tutor_id))}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
