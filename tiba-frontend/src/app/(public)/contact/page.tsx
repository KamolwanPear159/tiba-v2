'use client'

import React from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/lib/api/services/public.service'
import type { ContactInfo } from '@/types'

const DEFAULT_CONTACT: Partial<ContactInfo> = {
  address: '100/1, อาคารวรสมบัติ ชั้น 1  RBB  ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310',
  phone: '02 645 1133',
  email: 'ibathai@gmail.com',
  line_id: '@TIBA',
  facebook_url: 'https://facebook.com/TIBAThailand',
  map_embed_url: '',
}

// ─── Contact Card ─────────────────────────────────────────────────────────────
function ContactCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '24px 32px',
      boxShadow: '0px 0px 24px rgba(0,0,0,0.10)', height: 200,
      display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {icon}
        <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 32, lineHeight: '40px', letterSpacing: '-0.16px', color: '#126f38', whiteSpace: 'nowrap' }}>
          {title}
        </span>
      </div>
      <p style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 24, lineHeight: '25px', letterSpacing: '-0.08px', color: '#7b7b7b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const { data: contact } = useQuery({
    queryKey: ['public-contact'],
    queryFn: () => publicService.getContact(),
  })

  const info = { ...DEFAULT_CONTACT, ...contact }

  return (
    <div>
      {/* Banner */}
      <section className="relative overflow-hidden" style={{ height: 350 }}>
        <img src="/assets/hero-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(31,68,136,0.1) 0%, rgba(31,68,136,0.9) 100%)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 64, lineHeight: 1, color: '#f5f5f5', margin: 0 }}>
            ติดต่อสมาคม
          </h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#132953', padding: '16px 80px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/home" style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff', textDecoration: 'none' }}>
            หน้าหลัก
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>/</span>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#fff' }}>ติดต่อสมาคม</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 80, backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Map + address card */}
        <div style={{ borderRadius: 16, boxShadow: '0px 0px 24px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
          {/* Map */}
          <div style={{ height: 556, backgroundColor: '#e5e7eb', position: 'relative' }}>
            {info.map_embed_url ? (
              <iframe
                src={info.map_embed_url}
                width="100%" height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="แผนที่สมาคมนายหน้าประกันภัยไทย"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: '#e5e7eb' }}>
                <div className="text-center">
                  <MapPin style={{ width: 48, height: 48, color: '#b3b3b3', margin: '0 auto 12px' }} />
                  <a
                    href="https://maps.google.com/?q=สมาคมนายหน้าประกันภัยไทย+อาคารวรสมบัติ+ถนนพระราม9+กรุงเทพ"
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#1f4488', textDecoration: 'underline' }}
                  >
                    เปิดใน Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Address bar */}
          <div style={{ background: '#fff', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 4, borderRadius: '0 0 16px 16px' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', height: 64 }}>
              <img src="/icons/icon-location.svg" alt="" style={{ width: 48, height: 48, flexShrink: 0 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <span style={{ fontFamily: 'var(--font-eng)', fontWeight: 600, fontSize: 32, lineHeight: '40px', letterSpacing: '-0.16px', color: '#126f38', whiteSpace: 'nowrap' }}>
                Office Location
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#0a0a0a', margin: 0 }}>
                สมาคมนายหน้าประกันภัยไทย
              </p>
              <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#7b7b7b', margin: 0 }}>
                {info.address}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom row: Social + Contact cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Left — Facebook feed / social card */}
          <div style={{
            background: '#fff', borderRadius: 16,
            boxShadow: '0px 0px 24px rgba(0,0,0,0.10)',
            overflow: 'hidden', minHeight: 648,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {info.facebook_url ? (
              <iframe
                src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(info.facebook_url)}&tabs=timeline&width=600&height=640&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
                width="100%" height="648"
                style={{ border: 0, display: 'block', overflow: 'hidden' }}
                scrolling="no"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="Facebook Page"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <img src="/icons/icon-facebook.svg" alt="Facebook" style={{ width: 56, height: 56, margin: '0 auto 16px' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <p style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#7b7b7b' }}>
                  ติดตามเราบน Facebook
                </p>
                {info.facebook_url && (
                  <a href={info.facebook_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#1f4488', textDecoration: 'underline', marginTop: 8, display: 'block' }}>
                    คลิกเพื่อดูเพจ
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right — 3 contact cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Contact Number */}
            <ContactCard
              icon={<Phone style={{ width: 48, height: 48, color: '#126f38', flexShrink: 0 }} />}
              title="Contact Number"
              value={`Call : ${info.phone ?? '02 645 1133'}   Fax : 02 645 1134`}
            />
            {/* Email */}
            <ContactCard
              icon={<Mail style={{ width: 48, height: 48, color: '#126f38', flexShrink: 0 }} />}
              title="Email"
              value={info.email ?? 'ibathai@gmail.com'}
            />
            {/* Line */}
            <ContactCard
              icon={
                <img src="/icons/icon-line.svg" alt="LINE" style={{ width: 48, height: 48, flexShrink: 0 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              }
              title="Line"
              value={info.line_id ?? '@TIBA'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
