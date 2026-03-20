'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Pencil, User } from 'lucide-react';
import { adminService } from '@/lib/api/services/admin.service';
import type { Tutor } from '@/types';

const F = 'var(--font-thai)';

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })
      + ' เวลา ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
  } catch {
    return dateStr;
  }
}

function SkeletonView() {
  return (
    <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ width: 200, height: 200, borderRadius: '50%', background: '#f0f0f0', margin: '0 auto 24px' }} />
      <div style={{ height: 28, background: '#f0f0f0', borderRadius: 8, width: 200, margin: '0 auto 12px' }} />
      <div style={{ height: 18, background: '#f0f0f0', borderRadius: 8, width: 140, margin: '0 auto 16px' }} />
      <div style={{ height: 28, background: '#f0f0f0', borderRadius: 14, width: 100, margin: '0 auto 24px' }} />
      <div style={{ height: 14, background: '#f0f0f0', borderRadius: 6, width: 220, margin: '0 auto' }} />
    </div>
  );
}

export default function TutorViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: tutor, isLoading, isError } = useQuery({
    queryKey: ['tutor', id],
    queryFn: () => adminService.getTutor(id),
    enabled: !!id,
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: F }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 24px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 17, color: '#555', fontFamily: F, padding: '6px 0' }}
          >
            <ArrowLeft size={18} color="#555" />
            ย้อนกลับ
          </button>
          {!isLoading && tutor && (
            <button
              onClick={() => router.push(`/admin/tutors/${id}/edit`)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', border: 'none', borderRadius: 8, background: '#1f4488', color: '#fff', cursor: 'pointer', fontSize: 16, fontFamily: F, fontWeight: 600 }}
            >
              <Pencil size={15} /> แก้ไข
            </button>
          )}
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#fff',
          border: '1.5px solid #e8eaf0',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: '48px 40px',
          textAlign: 'center',
        }}>
          {isLoading ? (
            <SkeletonView />
          ) : isError || !tutor ? (
            <div style={{ padding: '40px 0' }}>
              <User size={48} color="#ccc" style={{ display: 'block', margin: '0 auto 16px' }} />
              <p style={{ margin: 0, fontSize: 18, color: '#aaa', fontFamily: F }}>ไม่พบข้อมูลผู้สอน</p>
            </div>
          ) : (
            <>
              {/* Photo */}
              <div style={{ marginBottom: 24 }}>
                {tutor.photo_url ? (
                  <img
                    src={tutor.photo_url}
                    alt={tutor.name}
                    style={{ width: 200, height: 200, borderRadius: '50%', objectFit: 'cover', border: '4px solid #e8eaf0', display: 'block', margin: '0 auto' }}
                  />
                ) : (
                  <div style={{
                    width: 200, height: 200, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e8f0fd 0%, #c7d8f8 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto', border: '4px solid #e8eaf0',
                  }}>
                    <span style={{ fontSize: 64, fontWeight: 700, color: '#1f4488', fontFamily: F }}>
                      {tutor.name ? tutor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                    </span>
                  </div>
                )}
              </div>

              {/* Name */}
              <h2 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: '#1a1a1a', fontFamily: F }}>
                {tutor.name}
              </h2>

              {/* Position */}
              <p style={{ margin: '0 0 20px', fontSize: 18, color: '#666', fontFamily: F }}>
                {tutor.position}
              </p>

              {/* Status badge */}
              <div style={{ marginBottom: 28 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 18px', borderRadius: 20, fontSize: 16, fontWeight: 600, fontFamily: F,
                  backgroundColor: tutor.is_active ? '#e8f5e9' : '#f5f5f5',
                  color: tutor.is_active ? '#2e7d32' : '#888',
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: tutor.is_active ? '#22c55e' : '#bbb',
                    display: 'inline-block',
                  }} />
                  {tutor.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#f0f0f0', margin: '0 0 24px' }} />

              {/* Created at */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 15, color: '#aaa', fontFamily: F }}>วันที่สร้าง:</span>
                <span style={{ fontSize: 15, color: '#555', fontFamily: F }}>{formatDate(tutor.created_at)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
