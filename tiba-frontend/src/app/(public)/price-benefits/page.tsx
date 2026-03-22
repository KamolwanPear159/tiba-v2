'use client'

import React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/lib/api/services/public.service'
import PricePlanCard from '@/components/public/PricePlanCard'
import type { PricePlan } from '@/types'

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonPlanCard() {
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0px 0px 24px rgba(0,0,0,0.10)' }}>
      <div style={{ height: 120, background: 'linear-gradient(135deg, #d1d5db, #e5e7eb)' }} />
      <div style={{ background: '#fff', padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: 16, background: '#f3f4f6', borderRadius: 8, width: i === 4 ? '60%' : '100%' }} />
        ))}
        <div style={{ height: 48, background: '#f3f4f6', borderRadius: 12, marginTop: 8 }} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PriceBenefitsPage() {
  const { data: plans, isLoading } = useQuery<PricePlan[]>({
    queryKey: ['public-price-benefits'],
    queryFn: () => publicService.getPricePlans(),
  })

  return (
    <div>
      {/* Banner */}
      <section className="relative overflow-hidden" style={{ height: 350 }}>
        <img src="/assets/course-thumb-1.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(31,68,136,0.1) 0%, rgba(31,68,136,0.9) 100%)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1
            style={{
              fontFamily: 'var(--font-thai)',
              fontWeight: 600,
              fontSize: 64,
              lineHeight: 1,
              color: '#f5f5f5',
              margin: 0,
            }}
          >
            ราคา / สิทธิประโยชน์สมาชิก
          </h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#132953', padding: '16px 80px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link
            href="/home"
            style={{
              fontFamily: 'var(--font-thai)',
              fontWeight: 600,
              fontSize: 16,
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            หน้าหลัก
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#fff' }}>
            ราคา / สิทธิประโยชน์
          </span>
        </div>
      </div>

      {/* Section intro */}
      <section style={{ backgroundColor: '#fafafa', paddingTop: 64, paddingBottom: 32 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 80px', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'var(--font-thai)',
              fontWeight: 700,
              fontSize: 40,
              color: '#132953',
              marginBottom: 16,
            }}
          >
            เลือกแผนที่เหมาะกับคุณ
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-thai)',
              fontSize: 18,
              color: '#6b7280',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            สมาคมนายหน้าประกันภัยไทยมีแผนสมาชิกหลากหลายระดับ
            เพื่อตอบสนองความต้องการของทุกกลุ่ม
          </p>
        </div>
      </section>

      {/* Price plan cards */}
      <section style={{ backgroundColor: '#fafafa', paddingTop: 32, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 80px' }}>
          {isLoading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 32,
              }}
            >
              {[1, 2, 3].map((i) => (
                <SkeletonPlanCard key={i} />
              ))}
            </div>
          ) : plans && plans.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`,
                gap: 32,
              }}
            >
              {plans.map((plan, idx) => (
                <PricePlanCard key={plan.plan_id} plan={plan} isHighlighted={idx === 1} />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', fontFamily: 'var(--font-thai)', fontSize: 16 }}>
              ไม่พบข้อมูลแผนสมาชิก
            </p>
          )}
        </div>
      </section>

      {/* CTA section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #132953 0%, #1f4488 100%)',
          padding: '64px 80px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-thai)',
            fontWeight: 700,
            fontSize: 36,
            color: '#fff',
            marginBottom: 16,
          }}
        >
          พร้อมเป็นสมาชิกแล้วหรือยัง?
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-thai)',
            fontSize: 18,
            color: 'rgba(255,255,255,0.80)',
            marginBottom: 36,
          }}
        >
          สมัครสมาชิกวันนี้ รับสิทธิประโยชน์มากมายทันที
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/register"
            style={{
              display: 'inline-block',
              padding: '14px 40px',
              borderRadius: 12,
              background: '#126f38',
              color: '#fff',
              fontFamily: 'var(--font-thai)',
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
            }}
          >
            สมัครสมาชิกทั่วไป
          </Link>
          <Link
            href="/register/association"
            style={{
              display: 'inline-block',
              padding: '14px 40px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.50)',
              color: '#fff',
              fontFamily: 'var(--font-thai)',
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
            }}
          >
            สมัครสมาชิกสมาคม
          </Link>
        </div>
      </section>
    </div>
  )
}
