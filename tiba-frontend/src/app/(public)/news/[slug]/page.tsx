'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/lib/api/services/public.service'
import type { Article } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Related News Card ────────────────────────────────────────────────────────

function RelatedCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      style={{
        display: 'flex', flexDirection: 'column', background: '#fff',
        borderRadius: 16, boxShadow: '0px 0px 24px rgba(0,0,0,0.10)',
        overflow: 'hidden', textDecoration: 'none', flex: 1,
      }}
      className="group transition hover:opacity-95"
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '600/400', flexShrink: 0, width: '100%' }}>
        <Image
          src={article.thumbnail_url || '/assets/news-thumb-1.png'}
          alt={article.title} fill className="object-cover"
        />
      </div>

      {/* Content */}
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ background: '#f5f5f5', color: '#0a0a0a', borderRadius: 8, padding: '4px 8px', fontFamily: 'var(--font-thai)', fontSize: 12, whiteSpace: 'nowrap' }}>
            {article.article_type === 'news' ? 'ข่าวสารสมาคม' : 'บทความ'}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#0a0a0a', margin: 0, flex: 1 }}
          className="group-hover:underline line-clamp-3"
        >
          {article.title}
        </h3>

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewsDetailPage() {
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : (params.slug?.[0] ?? '')

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['public-news-detail', slug],
    queryFn: () => publicService.getNewsDetail(slug),
    enabled: !!slug,
  })

  const { data: relatedData } = useQuery({
    queryKey: ['public-news', 1, ''],
    queryFn: () => publicService.getNews({ page: 1, page_size: 4 }),
    enabled: !!article,
  })

  const relatedArticles = (relatedData?.data ?? [])
    .filter(a => a.slug !== slug)
    .slice(0, 3)

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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
          <Link href="/home" style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff', textDecoration: 'none', flexShrink: 0 }}>
            หน้าหลัก
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>/</span>
          <Link href="/news" style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#fff', textDecoration: 'none', flexShrink: 0 }}>
            ข่าวสารและบทความ
          </Link>
          {article && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>/</span>
              <span style={{
                fontFamily: 'var(--font-thai)', fontSize: 16, color: '#fff',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300,
              }}>
                {article.title}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      {isLoading ? (
        <div style={{ backgroundColor: '#fff', padding: '80px 310px 120px', display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center' }}>
          {[100, 80, 100, 60].map((w, i) => (
            <div key={i} style={{ width: `${w}%`, height: i === 2 ? 400 : 32, background: '#f5f5f5', borderRadius: 8 }} />
          ))}
        </div>
      ) : isError || !article ? (
        <div style={{ backgroundColor: '#fff', padding: '80px', textAlign: 'center', fontFamily: 'var(--font-thai)', color: '#b3b3b3', fontSize: 16 }}>
          ไม่พบข้อมูลบทความ
        </div>
      ) : (
        <>
          {/* Article body */}
          <div style={{ backgroundColor: '#fff', padding: '80px 310px 120px', display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center' }}>

            {/* Header: tags + title + date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{
                  background: '#126f38', color: '#fff', borderRadius: 8, padding: '8px 16px',
                  fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 16, lineHeight: '20px',
                  whiteSpace: 'nowrap', height: 32, display: 'flex', alignItems: 'center',
                }}>
                  Pin
                </span>
                <span style={{
                  background: '#f5f5f5', color: '#0a0a0a', borderRadius: 8, padding: '8px 16px',
                  fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px',
                  whiteSpace: 'nowrap', height: 32, display: 'flex', alignItems: 'center',
                }}>
                  {article.article_type === 'news' ? 'ข่าวสาร' : 'บทความ'}
                </span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, lineHeight: 1,
                color: '#1f4488', margin: 0, textAlign: 'center', width: '100%',
              }}>
                {article.title}
              </h1>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <img src="/icons/icon-calendar.svg" alt="" style={{ width: 16, height: 16, flexShrink: 0 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <span style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)' }}>
                  {article.published_at ? formatDate(article.published_at) : ''}
                </span>
              </div>
            </div>

            {/* Thumbnail image */}
            {article.thumbnail_url && (
              <div style={{ width: '100%', position: 'relative', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden' }}>
                <Image src={article.thumbnail_url} alt={article.title} fill className="object-cover" />
              </div>
            )}

            {/* Rich-text content */}
            {article.content ? (
              <div
                className="article-content"
                style={{
                  width: '100%', fontFamily: 'var(--font-thai)', fontSize: 16,
                  lineHeight: '28px', color: '#0a0a0a',
                }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : article.excerpt ? (
              <p style={{ width: '100%', fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '28px', color: '#0a0a0a', margin: 0 }}>
                {article.excerpt}
              </p>
            ) : null}
          </div>

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <div style={{ backgroundColor: '#fff', padding: '0 80px 80px', display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center', overflow: 'hidden' }}>
              <h2 style={{
                fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 32, lineHeight: '40px',
                letterSpacing: '-0.16px', color: '#0a0a0a', margin: 0, textAlign: 'center', width: '100%',
              }}>
                บทความอื่นๆ
              </h2>
              <div style={{ display: 'flex', gap: 16, width: '100%', height: 471 }}>
                {relatedArticles.map(a => (
                  <RelatedCard key={a.news_id} article={a} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
