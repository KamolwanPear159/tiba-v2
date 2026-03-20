'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/lib/api/services/public.service'
import type { Article } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const PAGE_SIZE = 9

const TYPE_TABS = [
  { value: '',      label: 'ทั้งหมด' },
  { value: 'news',  label: 'ข่าวสาร' },
  { value: 'blog',  label: 'บทความ' },
]

// ─── Featured Card (pinned wide card) ────────────────────────────────────────

function FeaturedCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      style={{
        display: 'flex', gap: 24, background: '#fff', borderRadius: 16,
        boxShadow: '0px 0px 24px rgba(0,0,0,0.10)', overflow: 'hidden',
        padding: 24, textDecoration: 'none', flexShrink: 0,
      }}
      className="group transition hover:opacity-95"
    >
      {/* Image */}
      <div style={{ width: 591, flexShrink: 0, borderRadius: 8, overflow: 'hidden', position: 'relative', height: 394 }}>
        <Image
          src={article.thumbnail_url || '/assets/news-featured.png'}
          alt={article.title} fill className="object-cover"
        />
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Tags */}
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ background: '#126f38', color: '#fff', borderRadius: 8, padding: '8px 16px', fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 16, lineHeight: '20px', whiteSpace: 'nowrap', height: 32, display: 'flex', alignItems: 'center' }}>
              Pin
            </span>
            <span style={{ background: '#f5f5f5', color: '#0a0a0a', borderRadius: 8, padding: '8px 16px', fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px', whiteSpace: 'nowrap', height: 32, display: 'flex', alignItems: 'center' }}>
              {article.article_type === 'news' ? 'ข่าวสาร' : 'บทความ'}
            </span>
          </div>

          {/* Title */}
          <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, lineHeight: 1, color: '#0a0a0a', margin: 0 }}
            className="group-hover:underline line-clamp-3">
            {article.title}
          </h2>

          {/* Date */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <img src="/icons/icon-calendar.svg" alt="" style={{ width: 16, height: 16, flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)' }}>
              {article.published_at ? formatDate(article.published_at) : ''}
            </span>
          </div>
        </div>

        {/* Excerpt */}
        <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 500, fontSize: 24, lineHeight: 1, color: 'rgba(0,0,0,0.7)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' }}>
          {article.excerpt || ''}
        </p>
      </div>
    </Link>
  )
}

// ─── News Card (small grid card) ─────────────────────────────────────────────

function NewsGridCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      style={{
        display: 'flex', flexDirection: 'column', background: '#fff',
        borderRadius: 16, boxShadow: '0px 0px 24px rgba(0,0,0,0.10)',
        overflow: 'hidden', textDecoration: 'none',
      }}
      className="group transition hover:opacity-95"
    >
      {/* Image */}
      <div style={{ height: 220, position: 'relative', flexShrink: 0 }}>
        <Image
          src={article.thumbnail_url || '/assets/news-thumb-1.png'}
          alt={article.title} fill className="object-cover"
        />
      </div>

      {/* Content */}
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ background: '#f5f5f5', color: '#0a0a0a', borderRadius: 8, padding: '4px 12px', fontFamily: 'var(--font-thai)', fontSize: 12, whiteSpace: 'nowrap' }}>
            {article.article_type === 'news' ? 'ข่าวสารสมาคม' : 'บทความ'}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 20, lineHeight: '26px', color: '#0a0a0a', margin: 0 }}
          className="group-hover:underline line-clamp-2">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)', margin: 0 }}
          className="line-clamp-3 flex-1">
          {article.excerpt || ''}
        </p>

        {/* Date */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 'auto' }}>
          <img src="/icons/icon-calendar.svg" alt="" style={{ width: 16, height: 16, flexShrink: 0 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#7b7b7b' }}>
            {article.published_at ? formatDate(article.published_at) : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function NewsPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
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

export default function NewsPage() {
  const [page, setPage] = useState(1)
  const [articleType, setArticleType] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['public-news', page, articleType],
    queryFn: () => publicService.getNews({ page, page_size: PAGE_SIZE, article_type: articleType || undefined }),
  })

  const articles = (data?.data ?? []).filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase())
  )
  const featured = articles[0]
  const rest = articles.slice(1)
  const totalPages = data?.pagination?.total_pages ?? 1

  return (
    <div>
      {/* Banner */}
      <section className="relative overflow-hidden" style={{ height: 350 }}>
        <img src="/assets/news-thumb-1.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(31,68,136,0.1) 0%, rgba(31,68,136,0.9) 100%)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 64, lineHeight: 1, color: '#f5f5f5', margin: 0 }}>
            ข่าวสารและบทความ
          </h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#132953', padding: '16px 80px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/home" style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff', textDecoration: 'none' }}>หน้าหลัก</Link>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#fff' }}>ข่าวสารและบทความ</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ backgroundColor: '#fff', padding: '48px 80px' }}>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="7" stroke="#b3b3b3" strokeWidth="1.5" />
              <path d="M16.5 16.5L21 21" stroke="#b3b3b3" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="พิมข้อความค้นหา"
              style={{ width: '100%', height: 48, paddingLeft: 52, paddingRight: 16, fontSize: 16, fontFamily: 'var(--font-thai)', border: 'none', borderRadius: 8, outline: 'none', background: '#f5f5f5', color: '#0a0a0a' }}
            />
          </div>

          {/* Type tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            {TYPE_TABS.map(tab => {
              const active = articleType === tab.value
              return (
                <button key={tab.value} onClick={() => { setArticleType(tab.value); setPage(1) }}
                  style={{
                    height: 48, padding: '0 24px', border: 'none', borderRadius: 8, cursor: 'pointer',
                    fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16,
                    background: active ? 'linear-gradient(225deg, #126f38 0%, #1f4488 100%)' : '#f5f5f5',
                    color: active ? '#fff' : '#0a0a0a', whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content area */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ height: 380, background: '#f5f5f5', borderRadius: 16 }} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'var(--font-thai)', color: '#b3b3b3', fontSize: 16 }}>
            ไม่พบข้อมูลข่าวสาร
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && page === 1 && (
              <div style={{ marginBottom: 32 }}>
                <FeaturedCard article={featured} />
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                {rest.map(article => (
                  <NewsGridCard key={article.news_id} article={article} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <NewsPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
