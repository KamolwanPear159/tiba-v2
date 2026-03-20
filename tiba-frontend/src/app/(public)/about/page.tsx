'use client'

import React, { useState } from 'react'
import Link from 'next/link'

// ─── Static Data ─────────────────────────────────────────────────────────────

const TABS = [
  { key: 'history',     label: 'ประวัติการก่อตั้ง' },
  { key: 'mission',     label: 'วัตถุประสงค์และพันธกิจ' },
  { key: 'development', label: 'การพัฒนาสมาคมฯ' },
  { key: 'ethics',      label: 'จรรยาบรรณสมาชิก' },
  { key: 'presidents',  label: 'ทำเนียบนายกสมาคม' },
  { key: 'board',       label: 'กรรมการบริหาร' },
]

const PRESIDENTS = [
  { name: 'นายเจนกิจ ตันสกุล',              period: '(พ.ศ. 2512 และ พ.ศ. 2520 – 2522)' },
  { name: 'ม.ล. สมศักดิ์ กำภู',             period: '(พ.ศ. 2522 – 2528)' },
  { name: 'นายสมศักดิ์ ดุรงค์พันธ์',         period: '(พ.ศ. 2528 – 2530)' },
  { name: 'นายอุดม รัมมณีย์',               period: '(พ.ศ. 2530-2534)' },
  { name: 'นายพัลลภ อิศรางกูร ณ อยุธยา',    period: '(พ.ศ. 2534 – 2536)' },
  { name: 'นายเปรมศักดิ์ คล้ายสังข์',        period: '(พ.ศ. 2536 – 2540)' },
  { name: 'นายพิชิต เมฆกิตติกุล',           period: '(พ.ศ. 2540 – 2546)' },
  { name: 'นางวรรณี คงภักดีพงษ์',           period: '(พ.ศ. 2546 – 2550)' },
  { name: 'นายเรืองวิทย์ นันทาภิวัฒน์',      period: '(พ.ศ. 2550 – 2554)' },
  { name: 'นายปานวัฒน์ กูรมาภิรักษ์',        period: '(พ.ศ 2554 – 2556)' },
  { name: 'นายจิตวุฒิ ศศิบุตร',             period: '(พ.ศ 2556 – 2560)' },
  { name: 'นายชนะพันธุ์ พิริยะพันธุ์',        period: '(พ.ศ. 2560-2564)' },
  { name: 'นายจิตวุฒิ ศศิบุตร',             period: '(พ.ศ. 2564-ปัจจุบัน)' },
]

// ─── Tab Content ─────────────────────────────────────────────────────────────

function HistoryContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, color: '#1f4488', margin: 0 }}>
        ประวัติการก่อตั้ง
      </h2>
      <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, lineHeight: '28px', color: 'rgba(0,0,0,0.7)' }}>
        สมาคมนายหน้าประกันภัยไทย ก่อตั้งขึ้นเมื่อปีพุทธศักราช 2512 โดยกลุ่มผู้ประกอบธุรกิจนายหน้าประกันภัย
        ที่ต้องการรวมตัวกันเพื่อพัฒนาวิชาชีพและส่งเสริมมาตรฐานการดำเนินธุรกิจนายหน้าประกันภัยในประเทศไทย
      </p>
      <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, lineHeight: '28px', color: 'rgba(0,0,0,0.7)' }}>
        ตลอดระยะเวลากว่า 50 ปีที่ผ่านมา สมาคมได้ทำหน้าที่เป็นตัวแทนของนายหน้าประกันภัยในการประสานงานกับ
        หน่วยงานภาครัฐและเอกชน รวมถึงการพัฒนาทักษะและความรู้ให้กับสมาชิก
      </p>
    </div>
  )
}

function MissionContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, color: '#1f4488', margin: 0 }}>
        วัตถุประสงค์และพันธกิจ
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          'ส่งเสริมและพัฒนาวิชาชีพนายหน้าประกันภัยให้มีมาตรฐานและคุณภาพ',
          'ให้การศึกษาและฝึกอบรมแก่สมาชิกและบุคคลทั่วไปในด้านการประกันภัย',
          'ประสานงานและให้ความร่วมมือกับหน่วยงานภาครัฐและเอกชนที่เกี่ยวข้อง',
          'ส่งเสริมและรักษาผลประโยชน์ของสมาชิกและผู้บริโภค',
          'พัฒนาเทคโนโลยีและนวัตกรรมในธุรกิจนายหน้าประกันภัย',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1f4488', flexShrink: 0, marginTop: 7 }} />
            <p style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '28px', color: 'rgba(0,0,0,0.7)', margin: 0 }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DevelopmentContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, color: '#1f4488', margin: 0 }}>
        การพัฒนาสมาคมฯ
      </h2>
      <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, lineHeight: '28px', color: 'rgba(0,0,0,0.7)' }}>
        สมาคมนายหน้าประกันภัยไทยมุ่งมั่นในการพัฒนาอย่างต่อเนื่อง โดยมีโครงการและกิจกรรมต่างๆ ที่ส่งเสริม
        การเติบโตของสมาชิกและวงการประกันภัยไทยในภาพรวม
      </p>
    </div>
  )
}

function EthicsContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, color: '#1f4488', margin: 0 }}>
        จรรยาบรรณสมาชิก
      </h2>
      <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, lineHeight: '28px', color: 'rgba(0,0,0,0.7)' }}>
        สมาชิกของสมาคมนายหน้าประกันภัยไทยต้องปฏิบัติตามจรรยาบรรณวิชาชีพอย่างเคร่งครัด เพื่อรักษา
        มาตรฐานและความน่าเชื่อถือของวิชาชีพนายหน้าประกันภัย
      </p>
    </div>
  )
}

function PresidentsContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, color: '#1f4488', margin: 0 }}>
        ทำเนียบนายกสมาคม
      </h2>
      <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)' }}>
        นับตั้งแต่ก่อตั้งเมื่อปีพุทธศักราช 2512 จวบจนถึงปัจจุบัน สมาคมฯ ได้รับเกียรติจากผู้ทรงคุณวุฒิหลายท่าน<br />
        ในการดำรงตำแหน่งนายกสมาคม ดังนี้
      </p>

      {/* Timeline */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Line + dots column */}
        <div style={{ position: 'relative', width: 42, flexShrink: 0 }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            left: 21,
            top: 11,
            width: 1,
            height: `${PRESIDENTS.length * 28 - 8}px`,
            background: '#dfdfdf',
          }} />
          {/* Dots */}
          {PRESIDENTS.map((_, i) => (
            <div key={i} style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center' }}>
              <div style={{
                position: 'absolute', left: 17, width: 8, height: 8,
                borderRadius: '50%', background: '#1f4488',
              }} />
            </div>
          ))}
        </div>

        {/* Names column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {PRESIDENTS.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', height: 28 }}>
              <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)' }}>
                {p.name}
              </span>
              <span style={{ fontFamily: 'var(--font-thai)', fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>
                {p.period}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BoardContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, color: '#1f4488', margin: 0 }}>
        กรรมการบริหาร
      </h2>
      <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16, lineHeight: '28px', color: 'rgba(0,0,0,0.7)' }}>
        ดูรายชื่อกรรมการบริหารสมาคมนายหน้าประกันภัยไทย ประจำปี 2568-2570 ได้ที่หน้า
        <Link href="/executive" style={{ color: '#1f4488', fontWeight: 600, marginLeft: 4 }}>กรรมการบริหาร</Link>
      </p>
    </div>
  )
}

const TAB_CONTENT: Record<string, React.ReactNode> = {
  history:     <HistoryContent />,
  mission:     <MissionContent />,
  development: <DevelopmentContent />,
  ethics:      <EthicsContent />,
  presidents:  <PresidentsContent />,
  board:       <BoardContent />,
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('history')

  return (
    <div>
      {/* Banner */}
      <section className="relative overflow-hidden" style={{ height: 350 }}>
        <img src="/assets/hero-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(31,68,136,0.1) 0%, rgba(31,68,136,0.9) 100%)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 64, lineHeight: 1, color: '#f5f5f5', margin: 0 }}>
            เกี่ยวกับสมาคม
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
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#fff' }}>เกี่ยวกับสมาคม</span>
        </div>
      </div>

      {/* Content: sidebar + main */}
      <div style={{ display: 'flex', minHeight: 600, backgroundColor: '#fff' }}>

        {/* Sidebar navigation */}
        <aside style={{ width: 280, flexShrink: 0, borderRight: '1px solid #dfdfdf', paddingTop: 32 }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', width: '100%', height: 52,
                  padding: '0 32px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-thai)', fontSize: 16,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : '#0a0a0a',
                  background: active
                    ? 'linear-gradient(184.502deg, rgb(18,111,56) 0%, rgb(31,68,136) 100%)'
                    : 'transparent',
                  borderLeft: active ? 'none' : '4px solid transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '48px 64px', minWidth: 0 }}>
          {TAB_CONTENT[activeTab]}
        </main>
      </div>
    </div>
  )
}
