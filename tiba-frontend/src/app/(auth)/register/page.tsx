'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Check icon ───────────────────────────────────────────────────────────────

function CheckIcon({ color = '#126f38' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12" />
      <path d="M6 10l3 3 5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Feature lists ────────────────────────────────────────────────────────────

const GENERAL_FEATURES = [
  'เข้าถึงข้อมูลทั่วไป',
  'อัพเดตข่าวสาร',
  'รับสิทธิ์สมัครคอร์ส',
]

const ASSOC_FEATURES = [
  'ทุกสิทธิ์ของสมาชิกทั่วไป',
  'ได้รับการขึ้นโลโก้',
  'สามารถดาวน์โหลดประกาศ',
  'มีบัญชีผู้แทนรองได้ 2 บัญชี',
  'ราคาพิเศษสำหรับคอร์สอบรม',
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 40,
        width: '100%',
        maxWidth: 1000,
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontFamily: 'var(--font-thai)',
          fontWeight: 700,
          fontSize: 32,
          lineHeight: '40px',
          color: '#fff',
          margin: 0,
          textAlign: 'center',
          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        เลือกประเภทสมาชิก
      </h1>

      {/* Cards */}
      <div
        style={{
          display: 'flex',
          gap: 32,
          alignItems: 'stretch',
          justifyContent: 'center',
          width: '100%',
          flexWrap: 'wrap',
        }}
      >
        {/* General member */}
        <div
          style={{
            borderRadius: 16,
            boxShadow: '0px 0px 32px rgba(0,0,0,0.18)',
            width: 440,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(200.34deg, #126f38 0%, #51ba7c 100%)',
              padding: '28px 28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-thai)',
                fontWeight: 500,
                fontSize: 20,
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
              }}
            >
              สมาชิกทั่วไป
            </p>
            <p
              style={{
                fontFamily: 'var(--font-thai)',
                fontWeight: 700,
                fontSize: 40,
                color: '#fff',
                margin: 0,
                lineHeight: 1,
              }}
            >
              ฟรี
            </p>
          </div>

          <div
            style={{
              background: '#fff',
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {GENERAL_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <CheckIcon color="#126f38" />
                  <span
                    style={{
                      fontFamily: 'var(--font-thai)',
                      fontSize: 15,
                      color: '#444',
                      lineHeight: '22px',
                    }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/register/normal')}
              style={{
                height: 48,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(186.58deg, #126f38 0%, #51ba7c 100%)',
                fontFamily: 'var(--font-thai)',
                fontWeight: 600,
                fontSize: 16,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 'auto',
              }}
            >
              สมัครสมาชิกทั่วไป
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M10 4l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Association member */}
        <div
          style={{
            borderRadius: 16,
            boxShadow: '0px 0px 32px rgba(0,0,0,0.18)',
            width: 440,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(200.34deg, #1f4488 0%, #6f8aba 100%)',
              padding: '28px 28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-thai)',
                fontWeight: 500,
                fontSize: 20,
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
              }}
            >
              สมาชิกสมาคม
            </p>
            <p
              style={{
                fontFamily: 'var(--font-thai)',
                fontWeight: 700,
                fontSize: 40,
                color: '#fff',
                margin: 0,
                lineHeight: 1,
              }}
            >
              20,000 บาท/ปี
            </p>
          </div>

          <div
            style={{
              background: '#fff',
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ASSOC_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <CheckIcon color="#1f4488" />
                  <span
                    style={{
                      fontFamily: 'var(--font-thai)',
                      fontSize: 15,
                      color: '#444',
                      lineHeight: '22px',
                    }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/register/association')}
              style={{
                height: 48,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(186.58deg, #1f4488 0%, #6f8aba 100%)',
                fontFamily: 'var(--font-thai)',
                fontWeight: 600,
                fontSize: 16,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 'auto',
              }}
            >
              สมัครสมาชิกสมาคม
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M10 4l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Back to login */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-thai)',
            fontSize: 16,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          มีบัญชีอยู่แล้ว?
        </span>
        <Link
          href="/login"
          style={{
            fontFamily: 'var(--font-thai)',
            fontSize: 16,
            color: '#fff',
            fontWeight: 600,
            textDecoration: 'underline',
          }}
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </div>
  )
}
