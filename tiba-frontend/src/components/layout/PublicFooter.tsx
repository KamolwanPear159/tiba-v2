'use client'

import React from 'react'
import Link from 'next/link'

const aboutLinks = [
  { href: '/about',      label: 'ประวัติสมาคมฯ' },
  { href: '/executive',  label: 'กรรมการบริหาร' },
  { href: '/about',      label: 'ข้อบังคับสมาคมฯ' },
  { href: '/about',      label: 'สิทธิประโยชน์สมาชิก' },
]

const networkLinks = [
  { href: 'https://www.oic.or.th',                         label: 'คปภ.',                         external: true },
  { href: 'https://www.gif.or.th',                         label: 'กองทุนประกันวินาศภัย',          external: true },
  { href: 'https://www.tgia.org',                          label: 'สมาคมประกันวินาศภัยไทย',        external: true },
  { href: 'https://www.tlaa.org',                          label: 'สมาคมประกันชีวิตไทย',           external: true },
  { href: 'https://eservice.oic.or.th/licenseCheck',       label: 'ตรวจสอบใบอนุญาตนายหน้า',      external: true },
]

export default function PublicFooter() {
  return (
    <footer style={{ background: '#1f4488', color: '#fff' }}>
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: 80,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        {/* Column 1 — Logo card + Org name + Address + Phone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
          {/* Logo in white card */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '12px 18px 12px 17px', width: 285 }}>
            <img
              src="/assets/footer-logo.png"
              alt="สมาคมนายหน้าประกันภัยไทย"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap' }}>
            สมาคมนายหน้าประกันภัยไทย
          </p>
          <div style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, lineHeight: '20px', color: '#fff' }}>
            <p style={{ margin: 0 }}>สมาคมนายหน้าประกันภัยไทย อาคารวรสมบัติ</p>
            <p style={{ margin: 0 }}>ชั้น 1  RBB  ถนนพระราม 9 แขวงห้วยขวาง</p>
            <p style={{ margin: 0 }}>เขตห้วยขวาง กรุงเทพมหานคร 10310</p>
          </div>
          <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#fff' }}>
            <span>โทรสาร. 02 645 1134</span>
            <span>โทรศัพท์. 02 645 1133</span>
          </div>
        </div>

        {/* Column 2 — เกี่ยวกับเรา */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 160, flexShrink: 0 }}>
          <h4 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#fff', margin: 0 }}>
            เกี่ยวกับเรา
          </h4>
          {aboutLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}
              className="hover:opacity-75 transition-opacity"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Column 3 — เครือข่าย */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 160, flexShrink: 0 }}>
          <h4 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#fff', margin: 0 }}>
            เครือข่าย
          </h4>
          {networkLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}
              className="hover:opacity-75 transition-opacity"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Column 4 — โซเชียลมีเดีย */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
          <h4 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>
            โซเชียลมีเดีย
          </h4>
          <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
            <a href="https://facebook.com/tiba.or.th" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="/icons/icon-facebook.svg" alt="Facebook" width={56} height={56} />
            </a>
            <a href="https://line.me/ti/p/@tiba" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="/icons/icon-line.svg" alt="Line" width={56} height={56} />
            </a>
          </div>
        </div>

      </div>

      {/* Bottom bar — copyright */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.15)',
          padding: '20px 80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1440,
          margin: '0 auto',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'var(--font-thai)', margin: 0 }}>
          © {new Date().getFullYear()} สมาคมนายหน้าประกันภัยไทย. สงวนลิขสิทธิ์.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
          TIBA v2.0.0
        </p>
      </div>
    </footer>
  )
}
