'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import HeroBanner from '@/components/public/HeroBanner'
import PublicCourseCard, { EmptyCourseCard, type CourseStatus } from '@/components/public/CourseCard'
import { publicService } from '@/lib/api/services/public.service'
import { mockCourses } from '@/lib/api/mock/courses'
import { mockNews } from '@/lib/api/mock/news'
import type { Course, Article } from '@/types'
import {
  theme,
  whatWeDoConfig,
  partnerOffersConfig,
  coursesConfig,
  newsConfig,
  membershipConfig,
  sponsorsConfig,
} from '@/tokens/frontend-theme'

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

// "9 Jun 2025" format — matches Figma date display
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Megaphone Icon (fi_517943 — composite: 7 SVG layers, percentage-positioned) ──
const MEGAPHONE_PARTS = [
  { src: '/icons/icon-megaphone-part0.svg', inset: '37.79% 8.33% 57.33% 76.85%' },
  { src: '/icons/icon-megaphone-part1.svg', inset: '23.14% 8.33% 67.09% 76.85%' },
  { src: '/icons/icon-megaphone-part2.svg', inset: '47.56% 8.33% 42.68% 76.85%' },
  { src: '/icons/icon-megaphone-part3.svg', inset: '13.38% 28.03% 28.03% 62.21%' },
  { src: '/icons/icon-megaphone-part4.svg', inset: '62.21% 57.61% 13.38% 16.45%' },
  { src: '/icons/icon-megaphone-part5.svg', inset: '18.94% 42.68% 33.59% 32.91%' },
  { src: '/icons/icon-megaphone-part6.svg', inset: '28.03% 71.97% 42.68% 8.33%' },
]
function MegaphoneIcon({ size = 32 }: { size?: number }) {
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size, overflow: 'hidden' }}
    >
      {MEGAPHONE_PARTS.map((part, n) => (
        // Outer div handles absolute position; inner img fills it (mirrors Figma's double-nested)
        <div key={n} style={{ position: 'absolute', inset: part.inset }}>
          <img src={part.src} alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
      ))}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  ctaLabel,
  ctaIcon,
  href,
  useMegaphoneIcon,
}: {
  icon?: string
  title: string
  ctaLabel?: string
  ctaIcon?: string
  href?: string
  useMegaphoneIcon?: boolean
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ height: 48, marginBottom: 40 }}
    >
      <div className="flex items-center" style={{ gap: 16 }}>
        {useMegaphoneIcon ? (
          <MegaphoneIcon size={32} />
        ) : icon ? (
          <Image src={icon} alt="" width={32} height={32} />
        ) : null}
        <h2
          style={{
            fontFamily: theme.text.sectionHeading.fontFamily,
            fontWeight: theme.text.sectionHeading.fontWeight,
            fontSize: theme.text.sectionHeading.fontSize,
            lineHeight: theme.text.sectionHeading.lineHeight,
            color: theme.color.textPrimary,
          }}
        >
          {title}
        </h2>
      </div>

      {href && ctaLabel && (
        <Link
          href={href}
          className="inline-flex items-center transition hover:opacity-80"
          style={{
            gap: 8,
            height: 48,
            fontFamily: theme.text.buttonTha.fontFamily,
            fontWeight: theme.text.buttonTha.fontWeight,
            fontSize: theme.text.buttonTha.fontSize,
            color: theme.color.textPrimary,
            backgroundColor: theme.color.surfaceLight,
            borderRadius: theme.radius.button,
            paddingLeft: 32,
            paddingRight: 24,
            paddingTop: 12,
            paddingBottom: 12,
          }}
        >
          {ctaLabel}
          {ctaIcon && <Image src={ctaIcon} alt="" width={24} height={24} />}
        </Link>
      )}
    </div>
  )
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({
  course,
  fallbackThumb,
}: {
  course: Course
  fallbackThumb: string
}) {
  const isOnsite = course.format === 'onsite'
  const isDual = course.price_type === 'dual'

  const bannerBg = isOnsite ? '#ee7429' : '#1f4488'
  const bannerText = isOnsite ? 'เปิดรับสมัครแล้ว' : 'คอร์สออนไลน์'

  return (
    <Link
      href={`/courses/${course.course_id}`}
      className="flex flex-col overflow-hidden transition hover:opacity-95 flex-shrink-0"
      style={{
        borderRadius: theme.radius.card,
        backgroundColor: theme.color.surfaceWhite,
        boxShadow: '0px 0px 24px 0px rgba(0,0,0,0.1)',
        width: 416,
      }}
    >
      {/* Status banner — 56px */}
      <div
        style={{
          backgroundColor: bannerBg,
          height: 56,
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: theme.text.body.fontFamily, fontSize: 16, lineHeight: '20px', color: '#fff' }}>
          {bannerText}
        </span>
      </div>

      {/* Thumbnail — 186px */}
      <div style={{ height: 186, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <Image src={course.thumbnail_url || fallbackThumb} alt={course.title} fill className="object-cover" />
      </div>

      {/* Content area */}
      <div
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          borderBottom: `1px solid ${theme.color.surfaceBorder}`,
          flexShrink: 0,
        }}
      >
        {/* Location label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: 'var(--font-eng)',
              fontWeight: 600,
              fontSize: 16,
              lineHeight: '20px',
              color: isOnsite ? theme.color.brandBlue : theme.color.brandGreen,
            }}
          >
            {isOnsite ? 'ONSITE COURSE' : 'ONLINE COURSE'}
          </span>
        </div>

        {/* Title */}
        <h3
          className="line-clamp-2"
          style={{
            fontFamily: theme.text.cardTitle.fontFamily,
            fontWeight: theme.text.cardTitle.fontWeight,
            fontSize: theme.text.cardTitle.fontSize,
            lineHeight: '30px',
            color: theme.color.textPrimary,
          }}
        >
          {course.title}
        </h3>

        {/* Price boxes */}
        <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
          {isDual ? (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: 12, border: `1px solid ${theme.color.surfaceBorder}`, borderRadius: 8, background: '#fff' }}>
                <span style={{ fontFamily: theme.text.body.fontFamily, fontSize: 16, lineHeight: '20px', color: '#7b7b7b' }}>สมาชิกทั่วไป</span>
                <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 24, lineHeight: '32px', color: theme.color.textPrimary }}>
                  {course.price_general.toLocaleString('th-TH')}.-
                </span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: 12, borderRadius: 8, background: 'linear-gradient(204.394deg, rgb(31,68,136) 0%, rgb(111,138,186) 100%)' }}>
                <span style={{ fontFamily: theme.text.body.fontFamily, fontSize: 16, lineHeight: '20px', color: 'rgba(255,255,255,0.7)' }}>สมาชิกสมาคม</span>
                <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 24, lineHeight: '32px', color: '#fff' }}>
                  {(course.price_association ?? course.price_general).toLocaleString('th-TH')}.-
                </span>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: 12, borderRadius: 8, background: 'linear-gradient(204.394deg, rgb(31,68,136) 0%, rgb(111,138,186) 100%)' }}>
              <span style={{ fontFamily: theme.text.body.fontFamily, fontSize: 16, lineHeight: '20px', color: 'rgba(255,255,255,0.7)' }}>สมาชิกทั่วไป, สมาชิกสมาคม</span>
              <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 24, lineHeight: '32px', color: '#fff' }}>
                {course.price_general.toLocaleString('th-TH')}.-
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── News Card — Featured (left column) ──────────────────────────────────────
function NewsCardFeatured({
  article,
  fallbackThumb,
}: {
  article: Article
  fallbackThumb: string
}) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="flex flex-col overflow-hidden group transition hover:opacity-95"
      style={{
        borderRadius: theme.radius.card,
        backgroundColor: theme.color.surfaceWhite,
        border: `1px solid ${theme.color.surfaceBorder}`,
        boxShadow: theme.shadow.card,
        height: 556,
      }}
    >
      {/* Image — 584×292 with 24px margin */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          margin: 24,
          marginBottom: 0,
          height: 292,
          borderRadius: theme.radius.button,
        }}
      >
        <Image
          src={article.thumbnail_url || fallbackThumb}
          alt={article.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div
        className="flex flex-col flex-1"
        style={{ padding: 24, gap: 12 }}
      >
        <h3
          className="line-clamp-2 group-hover:underline"
          style={{
            fontFamily: theme.text.cardTitle.fontFamily,
            fontWeight: theme.text.cardTitle.fontWeight,
            fontSize: 20,
            lineHeight: '30px',
            color: theme.color.textPrimary,
          }}
        >
          {article.title}
        </h3>

        <p
          className="line-clamp-3 flex-1"
          style={{
            fontFamily: theme.text.body.fontFamily,
            fontSize: theme.text.body.fontSize,
            lineHeight: theme.text.body.lineHeight,
            color: theme.color.textBodyMuted,
          }}
        >
          {article.excerpt}
        </p>

        {/* Date */}
        <div className="flex items-center" style={{ gap: 8 }}>
          <Image src={theme.icons.calendar} alt="" width={16} height={16} />
          <span
            style={{
              fontFamily: theme.text.body.fontFamily,
              fontSize: 14,
              color: theme.color.textSecondary,
            }}
          >
            {article.published_at ? formatDate(article.published_at) : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── News Card — Side (right column, stacked × 3) ────────────────────────────
function NewsCardSide({
  article,
  fallbackThumb,
}: {
  article: Article
  fallbackThumb: string
}) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="flex overflow-hidden group transition hover:opacity-95 h-full"
      style={{
        borderRadius: theme.radius.card,
        backgroundColor: theme.color.surfaceWhite,
        border: `1px solid ${theme.color.surfaceBorder}`,
        boxShadow: theme.shadow.card,
        padding: 24,
        gap: 16,
      }}
    >
      {/* Thumbnail — 190×127 */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          width: 190,
          borderRadius: theme.radius.button,
          alignSelf: 'stretch',
        }}
      >
        <Image
          src={article.thumbnail_url || fallbackThumb}
          alt={article.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: 8 }}>
        <h4
          className="line-clamp-3 group-hover:underline"
          style={{
            fontFamily: theme.text.cardTitle.fontFamily,
            fontWeight: theme.text.cardTitle.fontWeight,
            fontSize: 16,
            lineHeight: '22px',
            color: theme.color.textPrimary,
          }}
        >
          {article.title}
        </h4>

        {/* Date */}
        <div className="flex items-center mt-auto" style={{ gap: 8 }}>
          <Image src={theme.icons.calendar} alt="" width={16} height={16} />
          <span
            style={{
              fontFamily: theme.text.body.fontFamily,
              fontSize: 14,
              color: theme.color.textSecondary,
            }}
          >
            {article.published_at ? formatDate(article.published_at) : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Membership Card ──────────────────────────────────────────────────────────
function MembershipCard({
  plan,
}: {
  plan: (typeof membershipConfig.plans)[number]
}) {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        borderRadius: theme.radius.card,
        backgroundColor: theme.color.surfaceWhite,
        boxShadow: theme.shadow.card,
        flex: 1,            // fills available space — each card = (1280-48)/2 = 616px
        minWidth: 0,
      }}
    >
      {/* Header — gradient bg, plan name + price */}
      <div
        className="flex flex-col flex-shrink-0"
        style={{
          background: plan.headerGradient,
          borderRadius: '16px 16px 0 0',
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 32,
          paddingBottom: 32,
          gap: 8,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-thai)',
            fontWeight: 500,
            fontSize: 32,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.7)',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {plan.title}
        </p>
        <p
          style={{
            /* Thai text → Anuphan; numeric price → Inter */
            fontFamily: /[\u0E00-\u0E7F]/.test(plan.price)
              ? 'var(--font-thai)'
              : 'var(--font-eng)',
            fontWeight: 700,
            fontSize: 48,
            lineHeight: 1,
            color: '#fff',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {plan.price}
        </p>
      </div>

      {/* Body — white, justify-between so button stays at bottom */}
      <div
        className="flex flex-col flex-1 justify-between"
        style={{ padding: 24 }}
      >
        {/* Content: description + benefits */}
        <div className="flex flex-col" style={{ gap: 24 }}>
          <p
            style={{
              fontFamily: 'var(--font-thai)',
              fontWeight: 600,
              fontSize: 24,
              lineHeight: '30px',
              color: '#0a0a0a',
            }}
          >
            {plan.description}
          </p>

          {/* Benefits list */}
          <div className="flex flex-col" style={{ gap: 8 }}>
            {plan.benefits.map((benefit) => (
              <div key={benefit} className="flex items-center" style={{ gap: 8 }}>
                <Image
                  src={theme.icons.checkmark}
                  alt=""
                  width={24}
                  height={24}
                  className="flex-shrink-0"
                />
                <span
                  style={{
                    fontFamily: 'var(--font-thai)',
                    fontWeight: 600,
                    fontSize: 16,
                    lineHeight: '20px',
                    color: 'rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA button — gradient, full width, mt-32 from content */}
        <Link
          href={plan.id === 'general' ? '/register' : '/register?type=association'}
          className="flex items-center justify-center transition hover:opacity-90"
          style={{
            background: plan.buttonGradient,
            borderRadius: 8,
            padding: '12px 16px',
            gap: 8,
            fontFamily: 'var(--font-thai)',
            fontWeight: 600,
            fontSize: 16,
            color: '#fff',
            textDecoration: 'none',
            marginTop: 32,
          }}
        >
          ลงทะเบียน
          <Image
            src={theme.icons.arrowRightWhite}
            alt=""
            width={24}
            height={24}
            style={{ transform: 'rotate(180deg)' }}
          />
        </Link>
      </div>
    </div>
  )
}

// ─── Content container helper ─────────────────────────────────────────────────
function Container({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: theme.layout.frameWidth,
        margin: '0 auto',
        paddingLeft: theme.layout.paddingX,
        paddingRight: theme.layout.paddingX,
      }}
    >
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { data: coursesData } = useQuery({
    queryKey: ['public-courses'],
    queryFn: () =>
      useMock
        ? {
            data: mockCourses.slice(0, 6),
            pagination: { page: 1, page_size: 6, total_items: 6, total_pages: 1 },
          }
        : publicService.getCourses({ page: 1, page_size: 6 }),
  })

  const { data: newsData } = useQuery({
    queryKey: ['public-news'],
    queryFn: () =>
      useMock
        ? {
            data: mockNews.slice(0, 4),
            pagination: { page: 1, page_size: 4, total_items: 4, total_pages: 1 },
          }
        : publicService.getNews({ page: 1, page_size: 4 }),
  })

  const courses = coursesData?.data ?? []
  const articles = newsData?.data ?? []

  return (
    <div>
      {/* ── 1. Hero ── */}
      <HeroBanner />

      {/* ── 2. What We Do ── */}
      {/* node 1:118414 — paddingTop 80, paddingBottom 120 */}
      <section
        style={{
          backgroundColor: theme.color.surfaceWhite,
          paddingTop: whatWeDoConfig.paddingTop,
          paddingBottom: whatWeDoConfig.paddingBottom,
        }}
      >
        <Container>
          <h2
            style={{
              fontFamily: theme.text.sectionHeading.fontFamily,
              fontWeight: theme.text.sectionHeading.fontWeight,
              fontSize: theme.text.sectionHeading.fontSize,
              lineHeight: theme.text.sectionHeading.lineHeight,
              color: theme.color.textPrimary,
              marginBottom: 64,
              textAlign: 'center',
            }}
          >
            สมาคมนายหน้าประกันภัยไทยทำอะไรบ้าง
          </h2>

          {/* 4 columns — 278px each, 56px gap */}
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(4, 278px)', gap: 56 }}
          >
            {whatWeDoConfig.items.map((item) => (
              <div key={item.title} className="flex flex-col" style={{ gap: 32 }}>
                {/* Icon — 80×80, centered in 278px column */}
                <div className="flex justify-center">
                  <Image src={item.icon} alt="" width={80} height={80} />
                </div>
                {/* Text */}
                <div className="flex flex-col" style={{ gap: 16 }}>
                  <h3
                    style={{
                      fontFamily: theme.text.cardTitle.fontFamily,
                      fontWeight: theme.text.cardTitle.fontWeight,
                      fontSize: theme.text.cardTitle.fontSize,
                      lineHeight: '30px',
                      color: theme.color.textPrimary,
                      whiteSpace: 'pre-line',
                      textAlign: 'center',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: theme.text.body.fontFamily,
                      fontWeight: theme.text.body.fontWeight,
                      fontSize: theme.text.body.fontSize,
                      lineHeight: theme.text.body.lineHeight,
                      color: theme.color.textBodyMuted,
                      textAlign: 'center',
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 3. Partner Offers ── */}
      {/* node 1:118460 — large banner top (1280×414), 3 equal below (416×414 each) */}
      <section
        style={{
          backgroundColor: theme.color.surfaceWhite,
          paddingTop: theme.spacing['5xl'],
          paddingBottom: theme.spacing['7xl'],
        }}
      >
        <Container>
          {/* Header — Figma megaphone icon (node 1:118463, 7 SVG parts) + title */}
          <div className="flex items-center" style={{ height: 48, marginBottom: 40, gap: 16 }}>
            {/* Composed megaphone icon from Figma — 7 absolutely-positioned SVG layers */}
            <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
              {([
                { i: 0, inset: '37.79% 8.33% 57.33% 76.85%' },
                { i: 1, inset: '23.14% 8.33% 67.09% 76.85%' },
                { i: 2, inset: '47.56% 8.33% 42.68% 76.85%' },
                { i: 3, inset: '13.38% 28.03% 28.03% 62.21%' },
                { i: 4, inset: '62.21% 57.61% 13.38% 16.45%' },
                { i: 5, inset: '18.94% 42.68% 33.59% 32.91%' },
                { i: 6, inset: '28.03% 71.97% 42.68% 8.33%' },
              ] as const).map(({ i, inset }) => (
                <div key={i} style={{ position: 'absolute', inset }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    src={`/icons/icon-megaphone-part${i}.svg`}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
                  />
                </div>
              ))}
            </div>
            <h2
              style={{
                fontFamily: theme.text.sectionHeading.fontFamily,
                fontWeight: theme.text.sectionHeading.fontWeight,
                fontSize: theme.text.sectionHeading.fontSize,
                lineHeight: theme.text.sectionHeading.lineHeight,
                color: theme.color.textPrimary,
              }}
            >
              {partnerOffersConfig.sectionTitle}
            </h2>
          </div>

          {/* Large banner — full content width, 414px tall */}
          <div
            className="overflow-hidden"
            style={{ borderRadius: theme.radius.card, marginBottom: 16, height: 414 }}
          >
            <Image
              src={partnerOffersConfig.images.large}
              alt="ข้อเสนอพิเศษจากพันธมิตร"
              width={1280}
              height={414}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 3 equal-width images — 416px each, 16px gap */}
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
          >
            {[
              partnerOffersConfig.images.sm1,
              partnerOffersConfig.images.sm2,
              partnerOffersConfig.images.sm3,
            ].map((src, i) => (
              <div
                key={i}
                className="overflow-hidden"
                style={{ borderRadius: theme.radius.card, height: 414 }}
              >
                <Image
                  src={src}
                  alt={`ข้อเสนอพันธมิตร ${i + 1}`}
                  width={416}
                  height={414}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 4. Courses ── */}
      {/* node 1:118495 — 3-col grid, 16px gap, cards h=588 */}
      <section
        style={{
          backgroundColor: theme.color.surfaceLight,
          paddingTop: theme.spacing['5xl'],
          paddingBottom: theme.spacing['5xl'],
        }}
      >
        <Container>
          <SectionHeader
            icon={coursesConfig.sectionIcon}
            title={coursesConfig.sectionTitle}
            ctaLabel={coursesConfig.ctaLabel}
            ctaIcon={coursesConfig.ctaIcon}
            href="/courses"
          />

          {(() => {
            const GRID_SIZE = 6
            const statuses: CourseStatus[] = ['urgent', 'upcoming', 'upcoming', 'ended']
            const display = courses.slice(0, GRID_SIZE)
            const slots = [...display, ...Array(Math.max(0, GRID_SIZE - display.length)).fill(null)]
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {slots.map((course, i) =>
                  course ? (
                    <PublicCourseCard
                      key={course.course_id}
                      course={course}
                      status={statuses[i % statuses.length]}
                      daysLeft={3}
                      fallbackThumb={coursesConfig.fallbackThumbs[i % coursesConfig.fallbackThumbs.length]}
                      instructorName={(course.tutors ?? [])[0]?.name}
                      instructorAvatars={((course.tutors ?? []) as Array<{ photo_url?: string }>).flatMap(t => t.photo_url ? [t.photo_url] : [])}
                    />
                  ) : (
                    <EmptyCourseCard key={`empty-${i}`} />
                  )
                )}
              </div>
            )
          })()}
        </Container>
      </section>

      {/* ── 5. News ── */}
      {/* node 1:118512 — 2 equal columns (632px each), 16px gap */}
      <section
        style={{
          backgroundColor: theme.color.surfaceWhite,
          paddingTop: theme.spacing['5xl'],
          paddingBottom: theme.spacing['7xl'],
        }}
      >
        <Container>
          <SectionHeader
            icon={newsConfig.sectionIcon}
            title={newsConfig.sectionTitle}
            ctaLabel={newsConfig.ctaLabel}
            ctaIcon={newsConfig.ctaIcon}
            href="/news"
          />

          {articles.length > 0 ? (
            <div
              className="grid"
              style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}
            >
              {/* Featured — left column, full 556px height */}
              <NewsCardFeatured
                article={articles[0]}
                fallbackThumb={newsConfig.fallbackThumbs[0]}
              />

              {/* Side cards — right column, 3 stacked with 16px gaps */}
              <div className="flex flex-col" style={{ gap: 16, height: 556 }}>
                {articles.slice(1, 4).map((article, i) => (
                  <div key={article.news_id} className="flex-1">
                    <NewsCardSide
                      article={article}
                      fallbackThumb={newsConfig.fallbackThumbs[i + 1]}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center"
              style={{ minHeight: 200, color: theme.color.textSecondary }}
            >
              ยังไม่มีข่าวสารในขณะนี้
            </div>
          )}
        </Container>
      </section>

      {/* ── 6. Membership ── */}
      {/* node 1:118566 — fixed height 802px, bg image + overlay, 2 cards centered */}
      <section className="relative overflow-hidden" style={{ height: 802 }}>
        {/* Background image */}
        <Image
          src={membershipConfig.bgImage}
          alt=""
          fill
          className="object-cover object-center"
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: membershipConfig.bgOverlay }}
        />

        {/* Content */}
        <div
          className="relative z-10"
          style={{
            maxWidth: theme.layout.frameWidth,
            margin: '0 auto',
            paddingLeft: theme.layout.paddingX,
            paddingRight: theme.layout.paddingX,
            paddingTop: theme.spacing['5xl'],
          }}
        >
          {/* Title — centered in content area */}
          <h2
            className="text-center"
            style={{
              fontFamily: theme.text.sectionHeading.fontFamily,
              fontWeight: theme.text.sectionHeading.fontWeight,
              fontSize: theme.text.sectionHeading.fontSize,
              lineHeight: theme.text.sectionHeading.lineHeight,
              color: theme.color.textWhite,
              marginBottom: 64,
            }}
          >
            {membershipConfig.sectionTitle}
          </h2>

          {/* Two cards — 464px each, 48px gap, centered */}
          <div className="flex justify-center" style={{ gap: 48 }}>
            {membershipConfig.plans.map((plan) => (
              <MembershipCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Sponsors ── */}
      {/* node 1:118629 — flex-col items-center gap-64 p-80, title centered */}
      <section style={{ backgroundColor: theme.color.surfaceWhite }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 64, padding: 80 }}>

          {/* Title — centered */}
          <h2
            style={{
              fontFamily: theme.text.sectionHeading.fontFamily,
              fontWeight: theme.text.sectionHeading.fontWeight,
              fontSize: theme.text.sectionHeading.fontSize,
              lineHeight: theme.text.sectionHeading.lineHeight,
              color: theme.color.textPrimary,
              textAlign: 'center',
            }}
          >
            {sponsorsConfig.sectionTitle}
          </h2>

          {/* 5 sponsor circles — each logo has Figma-exact absolute positioning */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 64, alignItems: 'center', justifyContent: 'center' }}>

            {/* Sponsor 1: MSIG — #272662 | aspect-square left 3.33% right 3.33% top 5px */}
            <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: '#272662', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '3.33%', right: '3.33%', top: 5, aspectRatio: '1/1', borderRadius: '50%' }}>
                <img src={sponsorsConfig.sponsors[0].image} alt="ผู้สนับสนุน 1" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
              </div>
            </div>

            {/* Sponsor 2: ธนาคาร — #f76f21 | aspect-square left 7.29% right 8.33% translateY(-50%) top 50% */}
            <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: '#f76f21', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '7.29%', right: '8.33%', top: '50%', transform: 'translateY(-50%)', aspectRatio: '1/1', borderRadius: '50%' }}>
                <img src={sponsorsConfig.sponsors[1].image} alt="ผู้สนับสนุน 2" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
              </div>
            </div>

            {/* Sponsor 3: คปภ — #124e82 | w-164 h-109 left-(-22) top-4 (bleeds; clipped by overflow:hidden) */}
            <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: '#124e82', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', width: 164, height: 109, left: -22, top: 4 }}>
                <img src={sponsorsConfig.sponsors[2].image} alt="ผู้สนับสนุน 3" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>

            {/* Sponsor 4: FWD — #124e82 | 125×125 left-0 top-(-2) */}
            <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: '#124e82', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', width: 125, height: 125, left: 0, top: -2 }}>
                <img src={sponsorsConfig.sponsors[3].image} alt="ผู้สนับสนุน 4" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>

            {/* Sponsor 5: รู้ใจ — #0a3d72 | 109×109 left-6 top-4 */}
            <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: '#0a3d72', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', width: 109, height: 109, left: 6, top: 4 }}>
                <img src={sponsorsConfig.sponsors[4].image} alt="ผู้สนับสนุน 5" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
