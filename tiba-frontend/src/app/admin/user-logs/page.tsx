'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Calendar, Filter, Monitor, Smartphone, Globe, Inbox } from 'lucide-react';
import { adminService } from '@/lib/api/services/admin.service';

const F = 'var(--font-thai)';

interface UserLog {
  id: number;
  date: string;
  action: string;
  detail: string;
  device: string;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

function DeviceIcon({ device }: { device: string }) {
  const d = (device || '').toLowerCase();
  if (d.includes('mobile') || d.includes('ios') || d.includes('android')) return <Smartphone size={15} color="#666" />;
  if (d.includes('web') || d.includes('browser')) return <Globe size={15} color="#666" />;
  return <Monitor size={15} color="#666" />;
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map(i => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div style={{ height: 14, background: '#f0f0f0', borderRadius: 6, width: i === 3 ? '70%' : '90%', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </td>
      ))}
    </tr>
  );
}

export default function UserLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const PAGE_SIZE = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['user-logs', page, search],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => adminService.getUserLogs({ page, page_size: PAGE_SIZE, search }),
    placeholderData: (prev) => prev,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logs: UserLog[] = (data?.data ?? []) as any;
  const total: number = data?.pagination?.total_items ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: F }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#1a1a1a', fontFamily: F }}>ประวัติการใช้งาน</h1>
          <p style={{ margin: '6px 0 0', fontSize: 16, color: '#888', fontFamily: F }}>ติดตามและตรวจสอบกิจกรรมของผู้ใช้ในระบบ</p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220, backgroundColor: '#f5f5f5', borderRadius: 8, padding: '0 16px' }}>
            <Search size={16} color="#aaa" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="ค้นหา..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '11px 0', fontSize: 16, fontFamily: F, color: '#333' }}
            />
          </div>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16, fontFamily: F, color: '#444' }}
          >
            <Calendar size={15} /> วันที่
          </button>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16, fontFamily: F, color: '#444' }}
          >
            <Filter size={15} /> ตัวกรอง
          </button>
          <button
            onClick={handleSearch}
            style={{ padding: '10px 22px', border: 'none', borderRadius: 8, background: '#1f4488', color: '#fff', cursor: 'pointer', fontSize: 16, fontFamily: F }}
          >
            ค้นหา
          </button>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fc', borderBottom: '1.5px solid #eee' }}>
                {['วันที่', 'การกระทำ', 'รายละเอียด', 'อุปกรณ์'].map(col => (
                  <th key={col} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 15, fontWeight: 600, color: '#555', fontFamily: F }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '60px 16px', textAlign: 'center' }}>
                    <Inbox size={40} color="#ccc" style={{ display: 'block', margin: '0 auto 12px' }} />
                    <p style={{ margin: 0, color: '#aaa', fontSize: 17, fontFamily: F }}>ไม่พบข้อมูล</p>
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '14px 16px', fontSize: 15, color: '#444', fontFamily: F, whiteSpace: 'nowrap' }}>
                      {formatDate(log.date)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block', fontSize: 14, fontWeight: 600, fontFamily: F,
                        padding: '3px 10px', borderRadius: 20,
                        backgroundColor: '#e8f0fd', color: '#1f4488',
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 15, color: '#555', fontFamily: F, maxWidth: 320 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {log.detail}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 15, color: '#555', fontFamily: F }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <DeviceIcon device={log.device} />
                        {log.device}
                      </div>
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
    </div>
  );
}
