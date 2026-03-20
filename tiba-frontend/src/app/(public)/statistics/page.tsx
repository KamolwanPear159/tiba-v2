'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/lib/api/services/public.service'
import type { Statistic } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPostDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear() + 543}`
}

const PAGE_SIZE = 9

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: Statistic }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, boxShadow: '0px 0px 24px rgba(0,0,0,0.10)',
      padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      overflow: 'hidden',
    }}>
      {/* Top section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* PDF thumbnail */}
        <div style={{
          background: '#e9ecf3', borderRadius: 8, height: 186,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="10" y="5" width="72" height="90" rx="6" fill="#fff" stroke="#c8cfe0" strokeWidth="2" />
            <rect x="10" y="5" width="72" height="90" rx="6" fill="#fff" />
            <path d="M52 5 L82 35 L52 35 Z" fill="#c8cfe0" />
            <path d="M52 5 L52 35 L82 35" fill="#e9ecf3" stroke="#c8cfe0" strokeWidth="2" />
            <rect x="22" y="75" width="48" height="16" rx="4" fill="#ec221f" />
            <text x="46" y="87" fontFamily="Arial" fontWeight="700" fontSize="11" fill="#fff" textAnchor="middle">PDF</text>
          </svg>
        </div>

        {/* Title */}
        <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#0a0a0a', margin: 0 }}>
          {stat.title}
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" stroke="#7b7b7b" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" stroke="#7b7b7b" strokeWidth="1.5" />
            </svg>
            <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#7b7b7b', whiteSpace: 'nowrap' }}>
              เข้าชม 0
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12M8 11l4 4 4-4" stroke="#7b7b7b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 20h14" stroke="#7b7b7b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#7b7b7b', whiteSpace: 'nowrap' }}>
              ดาวน์โหลด 0
            </span>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        {/* Download button */}
        {stat.pdf_url ? (
          <a
            href={stat.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
              height: 48, border: '1px solid #dfdfdf', borderRadius: 8, textDecoration: 'none',
              fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#0a0a0a',
              cursor: 'pointer', background: '#fff',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12M8 11l4 4 4-4" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 20h14" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            ดาวน์โหลด
          </a>
        ) : (
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
            height: 48, border: '1px solid #dfdfdf', borderRadius: 8,
            fontFamily: 'var(--font-thai)', fontSize: 16, color: '#b3b3b3',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12M8 11l4 4 4-4" stroke="#b3b3b3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 20h14" stroke="#b3b3b3" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            ดาวน์โหลด
          </div>
        )}

        {/* Date row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#7b7b7b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            วันที่โพสต์ : {formatPostDate(stat.created_at)}
          </span>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#7b7b7b', flexShrink: 0 }}>
            {stat.published_year + 543 > 2500 ? `ปี ${stat.published_year}` : `ปี พ.ศ. ${stat.published_year}`}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return <div style={{ height: 400, background: '#f5f5f5', borderRadius: 16 }} />
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function StatPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const btnBase: React.CSSProperties = {
    width: 40, height: 40, borderRadius: '50%', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 16,
    cursor: 'pointer', flexShrink: 0,
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 48, paddingBottom: 64 }}>
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
        style={{ ...btnBase, background: 'transparent', color: page === 1 ? '#b3b3b3' : '#0a0a0a', fontSize: 20 }}>‹</button>
      {pages.map((p, i) => (
        <button key={i} onClick={() => typeof p === 'number' && onPageChange(p)}
          style={{ ...btnBase, background: p === page ? 'linear-gradient(225deg, #126f38 0%, #1f4488 100%)' : 'transparent', color: p === page ? '#fff' : '#0a0a0a', cursor: typeof p === 'number' ? 'pointer' : 'default' }}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        style={{ ...btnBase, background: 'transparent', color: page === totalPages ? '#b3b3b3' : '#0a0a0a', fontSize: 20 }}>›</button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatisticsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['public-statistics', page],
    queryFn: () => publicService.getStatistics({ page, page_size: PAGE_SIZE }),
  })

  const stats = data?.data ?? []
  const totalPages = data?.pagination?.total_pages ?? 1

  return (
    <div>
      {/* Banner */}
      <section className="relative overflow-hidden" style={{ height: 350 }}>
        <img src="/assets/news-thumb-1.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(31,68,136,0.1) 0%, rgba(31,68,136,0.9) 100%)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 64, lineHeight: 1, color: '#f5f5f5', margin: 0 }}>
            สถิติประกัน
          </h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#132953', padding: '16px 80px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/home" style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff', textDecoration: 'none' }}>หน้าหลัก</Link>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#fff' }}>สถิติประกัน</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ backgroundColor: '#fff', padding: '48px 80px' }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : stats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'var(--font-thai)', color: '#b3b3b3', fontSize: 16 }}>
            ไม่พบข้อมูลสถิติ
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {stats.map(stat => <StatCard key={stat.stat_id} stat={stat} />)}
            </div>
            <StatPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
