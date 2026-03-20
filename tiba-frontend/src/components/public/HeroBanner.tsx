'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { publicService } from '@/lib/api/services/public.service'
import { getImageUrl } from '@/lib/utils/format'
import type { Banner } from '@/types'

// ─── Static fallback (original hero design) ───────────────────────────────────

function StaticHero() {
  return (
    <section
      className="relative overflow-hidden flex flex-col items-start justify-end"
      style={{ height: 721, backgroundColor: '#126f38', paddingLeft: 80, paddingRight: 80, paddingBottom: 120 }}
    >
      <div
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ aspectRatio: '2048 / 1365', left: -603, right: -659, top: 'calc(50% - 331.5px)', transform: 'translateY(-50%)' }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <img alt="" src="/assets/hero-bg.png" className="absolute h-full top-0 left-0" style={{ width: '100.01%', maxWidth: 'none' }} />
        </div>
      </div>

      {/* Layer — gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 pointer-events-none"
        style={{ height: 721, top: 'calc(50% - 0.5px)', transform: 'translateY(-50%)', background: 'linear-gradient(to bottom, rgba(31,68,136,0) 0%, #1f4488 100%)' }}
      />

      {/* Layer — blur strip at top 217px (independent, not clipped by gradient) */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 pointer-events-none"
        style={{
          width: '100%',
          height: 217,
          flexShrink: 0,
          background: 'rgba(255,255,255,0.01)',
          backdropFilter: 'blur(5px)',
        }}
      />

      <div className="relative z-10 flex flex-col items-start w-full" style={{ gap: 64 }}>
        <div className="flex flex-col items-start w-full">
          <p className="font-semibold w-full" style={{ fontSize: 64, lineHeight: 1, color: '#f5f5f5' }}>
            สมาคมนายหน้าประกันภัยไทย
          </p>
          <div className="font-medium w-full" style={{ fontSize: 32, lineHeight: 1, color: 'rgba(255,255,255,0.7)' }}>
            <p className="mb-0">เราจะเป็นแรงขับเคลื่อน แห่งการเปลี่ยนแปลง</p>
            <p>ในวงการประกันภัยไทย</p>
          </div>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-[8px] font-semibold transition hover:opacity-90 shrink-0"
          style={{ backgroundColor: '#f5f5f5', color: '#0a0a0a', fontSize: 16, paddingLeft: 32, paddingRight: 24, paddingTop: 16, paddingBottom: 16 }}
        >
          สมัครสมาชิกสมาคม
          <span className="inline-flex items-center justify-center" style={{ width: 24, height: 24, fontSize: 20 }}>›</span>
        </Link>
      </div>
    </section>
  )
}

// ─── Banner slideshow ─────────────────────────────────────────────────────────

const SLIDE_INTERVAL = 5000

export default function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    publicService.getHeroBanners()
      .then((data) => {
        const active = (data ?? [])
          .filter((b) => b.is_active)
          .sort((a, b) => a.display_order - b.display_order)
        setBanners(active)
      })
      .catch(() => setBanners([]))
      .finally(() => setLoaded(true))
  }, [])

  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + banners.length) % banners.length), [banners.length])

  // Auto-advance
  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(next, SLIDE_INTERVAL)
    return () => clearInterval(id)
  }, [banners.length, next])

  // Not loaded yet — render nothing to avoid flash
  if (!loaded) return <div style={{ height: 721, backgroundColor: '#126f38' }} />

  // No active banners → fall back to static hero
  if (banners.length === 0) return <StaticHero />

  const banner = banners[current]
  const imgSrc = getImageUrl(banner.image_url) ?? banner.image_url

  return (
    <section className="relative overflow-hidden" style={{ height: 721 }}>
      {/* Layer 0 — banner image */}
      {banner.link_url ? (
        <a href={banner.link_url} target="_blank" rel="noopener noreferrer"
          className="absolute inset-0" style={{ zIndex: 0 }}>
          <img src={imgSrc} alt="banner"
            className="absolute inset-0 w-full h-full object-cover" />
        </a>
      ) : (
        <img src={imgSrc} alt="banner"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }} />
      )}

      {/* Layer 1 — gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          zIndex: 1,
          height: 721,
          top: 'calc(50% - 0.5px)',
          transform: 'translateY(-50%)',
          background: 'linear-gradient(to bottom, rgba(31,68,136,0) 0%, #1f4488 100%)',
        }}
      />

      {/* Layer 2 — blur strip at top 217px (independent layer, not inside gradient) */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 pointer-events-none"
        style={{
          zIndex: 2,
          width: '100%',
          height: 217,
          flexShrink: 0,
          background: 'rgba(255,255,255,0.01)',
          backdropFilter: 'blur(5px)',
        }}
      />

      {/* Layer 3 — text content (bottom-left) */}
      <div
        className="absolute"
        style={{ zIndex: 3, left: 80, right: 80, bottom: 120 }}
      >
        <div className="flex flex-col items-start" style={{ gap: 64 }}>
          <div className="flex flex-col items-start">
            <p className="font-semibold" style={{ fontSize: 64, lineHeight: 1, color: '#f5f5f5' }}>
              สมาคมนายหน้าประกันภัยไทย
            </p>
            <div className="font-medium" style={{ fontSize: 32, lineHeight: 1, color: 'rgba(255,255,255,0.7)' }}>
              <p className="mb-0">เราจะเป็นแรงขับเคลื่อน แห่งการเปลี่ยนแปลง</p>
              <p>ในวงการประกันภัยไทย</p>
            </div>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-[8px] font-semibold transition hover:opacity-90 shrink-0"
            style={{ backgroundColor: '#f5f5f5', color: '#0a0a0a', fontSize: 16, paddingLeft: 32, paddingRight: 24, paddingTop: 16, paddingBottom: 16 }}
          >
            สมัครสมาชิกสมาคม
            <span style={{ fontSize: 20 }}>›</span>
          </Link>
        </div>
      </div>

      {/* Prev / Next arrows — only when multiple banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition"
            aria-label="ก่อนหน้า"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition"
            aria-label="ถัดไป"
          >
            ›
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/50'}`}
              aria-label={`สไลด์ ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
