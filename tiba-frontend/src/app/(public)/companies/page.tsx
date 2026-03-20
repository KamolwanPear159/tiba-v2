'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/lib/api/services/public.service'
import type { Company } from '@/types'

const PAGE_SIZE = 9

// ─── Company Card ─────────────────────────────────────────────────────────────

function CompanyCard({ company }: { company: Company }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, boxShadow: '0px 0px 24px rgba(0,0,0,0.10)',
      padding: 24, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'hidden',
    }}>
      {/* Logo area */}
      <div style={{ height: 200, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {company.logo_url ? (
          <Image
            src={company.logo_url}
            alt={company.name}
            fill
            className="object-contain"
          />
        ) : (
          <div style={{
            width: 120, height: 120, borderRadius: 12, background: '#e9ecf3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 32, color: '#1f4488' }}>
              {company.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Name + description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#0a0a0a', margin: 0 }}>
            {company.name}
          </p>
          {company.description && (
            <p style={{
              fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px',
              color: 'rgba(0,0,0,0.7)', margin: 0,
              height: 72, overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            }}>
              {company.description}
            </p>
          )}
        </div>

        {/* Contact info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {company.website_url && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="9" stroke="rgba(0,0,0,0.7)" strokeWidth="1.5" />
                <path d="M12 3c0 0-4 3-4 9s4 9 4 9 4-3 4-9-4-9-4-9z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.5" />
                <path d="M3 12h18" stroke="rgba(0,0,0,0.7)" strokeWidth="1.5" />
              </svg>
              <a
                href={company.website_url.startsWith('http') ? company.website_url : `https://${company.website_url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-eng)', fontSize: 16, lineHeight: '20px',
                  color: 'rgba(0,0,0,0.7)', textDecoration: 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {company.website_url.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return <div style={{ height: 420, background: '#f5f5f5', borderRadius: 16 }} />
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function CompanyPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
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

export default function CompaniesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['public-companies', page],
    queryFn: () => publicService.getCompanies({ page, page_size: PAGE_SIZE }),
  })

  const companies = data?.data ?? []
  const filtered = search
    ? companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : companies
  const totalPages = data?.pagination?.total_pages ?? 1

  return (
    <div>
      {/* Banner */}
      <section className="relative overflow-hidden" style={{ height: 350 }}>
        <img src="/assets/hero-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(31,68,136,0.1) 0%, rgba(31,68,136,0.9) 100%)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 64, lineHeight: 1, color: '#f5f5f5', margin: 0 }}>
            บริษัทสมาชิก
          </h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#132953', padding: '16px 80px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/home" style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff', textDecoration: 'none' }}>หน้าหลัก</Link>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#fff' }}>บริษัทสมาชิก</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ backgroundColor: '#fff', padding: '48px 80px' }}>
        {/* Search + view toggle */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="7" stroke="#b3b3b3" strokeWidth="1.5" />
              <path d="M16.5 16.5L21 21" stroke="#b3b3b3" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="พิมข้อความค้นหา"
              style={{
                width: '100%', height: 48, paddingLeft: 52, paddingRight: 16,
                fontSize: 16, fontFamily: 'var(--font-thai)', border: 'none',
                borderRadius: 8, outline: 'none', background: '#f5f5f5', color: '#0a0a0a',
              }}
            />
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'var(--font-thai)', color: '#b3b3b3', fontSize: 16 }}>
            ไม่พบข้อมูลบริษัทสมาชิก
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {filtered.map(company => <CompanyCard key={company.company_id} company={company} />)}
            </div>
            <CompanyPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
