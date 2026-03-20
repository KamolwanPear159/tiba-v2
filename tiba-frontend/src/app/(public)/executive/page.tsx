'use client'

import React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/lib/api/services/public.service'
import type { Executive } from '@/types'

// ─── Page Banner ─────────────────────────────────────────────────────────────

function PageBanner() {
  return (
    <section className="relative overflow-hidden" style={{ height: 350 }}>
      <img
        src="/assets/hero-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(31,68,136,0.1) 0%, rgba(31,68,136,0.9) 100%)' }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 64, lineHeight: 1, color: '#f5f5f5', margin: 0 }}>
          กรรมการบริหาร
        </h1>
      </div>
    </section>
  )
}

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

function Breadcrumb() {
  return (
    <div style={{ backgroundColor: '#132953', padding: '16px 80px' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Link href="/home" style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff', textDecoration: 'none' }}>
          หน้าหลัก
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>/</span>
        <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#fff' }}>กรรมการบริหาร</span>
      </div>
    </div>
  )
}

// ─── Executive Card ───────────────────────────────────────────────────────────

function ExecutiveCard({ executive }: { executive: Executive }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #dfdfdf', borderRadius: 16,
      padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Photo — 260:325 aspect */}
      <div style={{ width: '100%', aspectRatio: '260/325', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={executive.photo_url || '/assets/teacher-1.png'}
          alt={executive.full_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Name — gradient text */}
      <p style={{
        fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px',
        textAlign: 'center', width: '100%',
        background: 'linear-gradient(184.502deg, rgb(18,111,56) 0%, rgb(31,68,136) 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        {executive.full_name}
      </p>

      {/* Divider */}
      <div style={{ width: 32, height: 1, background: '#dfdfdf', flexShrink: 0 }} />

      {/* Position */}
      <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, lineHeight: '20px', color: '#7b7b7b', textAlign: 'center', width: '100%' }}>
        {executive.position_title}
      </p>
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ background: '#f5f5f5', borderRadius: 16, height: 380, animation: 'pulse 1.5s infinite' }} />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExecutivePage() {
  const { data: executives = [], isLoading } = useQuery({
    queryKey: ['public-executives'],
    queryFn: () => publicService.getExecutives(),
  })

  // Sort by display_order
  const sorted = [...executives].sort((a, b) => a.display_order - b.display_order)

  // First exec (นายกสมาคม) goes in center top, rest in grid of 4
  const [first, ...rest] = sorted

  return (
    <div>
      <PageBanner />
      <Breadcrumb />

      <div style={{ padding: '80px 80px', backgroundColor: '#fff' }}>
        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, lineHeight: 1, color: '#1f4488', margin: 0 }}>
            กรรมการบริหาร
          </h2>
          <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#1f4488', margin: 0 }}>
            ประจำปี 2568-2570
          </p>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* Featured president — centered */}
            {first && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ width: 302 }}>
                  <ExecutiveCard executive={first} />
                </div>
              </div>
            )}

            {/* Rest — grid of 4 per row */}
            {rest.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                {rest.map((exec) => (
                  <ExecutiveCard key={exec.executive_id} executive={exec} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
