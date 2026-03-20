'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = {
  id: string
  label: string
}

const SECTIONS: Section[] = [
  { id: 'about',         label: 'เกี่ยวกับสมาคม' },
  { id: 'history',       label: 'ประวัติการก่อตั้ง' },
  { id: 'objectives',    label: 'วัตถุประสงค์และพันธกิจ' },
  { id: 'international', label: 'การพัฒนาสมาคมฯ และเครือข่ายระดับสากล' },
  { id: 'ethics',        label: 'จรรยาบรรณสมาชิก' },
  { id: 'presidents',    label: 'ทำเนียบนายกสมาคม' },
]

const PILLARS = [
  {
    icon: '/icons/icon-education.svg',
    title: 'พัฒนาความรู้\nและวิชาชีพ',
    desc: 'สมาคมฯ จัดหลักสูตรและเวิร์กช็อปด้านเทคนิคประกันภัยและทักษะธุรกิจอย่างต่อเนื่อง เพื่อยกระดับมาตรฐานการให้บริการ',
  },
  {
    icon: '/icons/icon-protect.svg',
    title: 'คุ้มครองและส่งเสริม\nนายหน้าประกันภัย',
    desc: 'สมาคมฯ เป็นตัวแทนเจรจาเงื่อนไขที่เป็นธรรม ช่วยแก้ไขอุปสรรคและรับรองผลประโยชน์ให้กับนายหน้าประกันภัย',
  },
  {
    icon: '/icons/icon-network.svg',
    title: 'ร่วมมือภาครัฐและ\nขยายเครือข่ายสากล',
    desc: 'สมาคมฯ ร่วมกำหนดนโยบายกับ คปภ. และเชื่อมโยงกับองค์กรโลก (CIIBA, CAPIBA, WFII) เพื่อแลกเปลี่ยนแนวปฏิบัติที่ดีและมาตรฐานสากล',
  },
  {
    icon: '/icons/icon-ethics.svg',
    title: 'ธำรงเกียรติ\nและจรรยาบรรณ',
    desc: 'สมาคมฯ กำหนดแนวปฏิบัติซื่อสัตย์ โปร่งใส รักษาผลประโยชน์ผู้เอาประกันเป็นหลัก เพื่อสร้างความเชื่อมั่นในวงการ',
  },
]

const OBJECTIVES = [
  'เพื่อคุ้มครอง ส่งเสริม สนับสนุนธุรกิจและสวัสดิภาพของนายหน้าประกันภัย และร่วมมือกับหน่วยราชการ บริษัทประกันชีวิต และบริษัทประกันวินาศภัย ในอันที่จะช่วยให้กิจการประกันภัยมีคุณค่าต่อสังคมกว้างขวางยิ่งขึ้น',
  'เพื่อธำรงไว้ซึ่งเกียรติ ศักดิ์ศรี และความสามัคคีในระหว่างมวลสมาชิก',
  'สนับสนุนและช่วยเหลือสมาชิกแก้ไขอุปสรรค ข้อขัดข้องต่างๆ รวมทั้งการเจรจาทำความตกลงกับบุคคลภายนอกเพื่อประโยชน์ร่วมกัน',
  'ทำการวิจัยเกี่ยวกับการประกอบอาชีพนายหน้าประกันภัย ส่งเสริมคุณภาพของนายหน้าประกันภัยให้เข้ามาตรฐาน แลกเปลี่ยนและเผยแพร่ความรู้ในทางวิชาการ การขยายงาน ตลอดจนข่าวสารอันเกี่ยวกับอาชีพนายหน้าประกันภัย',
  'เพื่อให้ความช่วยเหลือและบริจาคในการกุศลต่อผู้ที่ต้องการความช่วยเหลือ โดยเฉพาะผู้ที่เกี่ยวข้องกับการประกันภัย',
  'เพื่อร่วมมือ ติดต่อ หรือเป็นสมาชิกกับสมาคมฯ อื่นทั่วโลก ที่ทำงานหรือมีวัตถุประสงค์คล้ายคลึงกับสมาคมนี้',
  'ประนีประนอมข้อพิพาทระหว่างสมาชิก หรือระหว่างสมาชิกกับบุคคลภายนอก ในการประกอบอาชีพนายหน้าประกันภัย',
  'เพื่อส่งเสริมสุขภาพ พลานามัย การบันเทิง และการกีฬา แก่สมาชิกสมาคม',
  'ไม่เกี่ยวข้องกับการเมือง',
]

const MISSIONS = [
  'ให้คำแนะนำที่เป็นประโยชน์ รวมถึงความคุ้มครองที่เหมาะสมกับผู้เอาประกันภัย',
  'ศึกษากรมธรรม์ และต่อรองเงื่อนไข พร้อมทั้งเบี้ยประกันภัยที่เป็นธรรมให้กับผู้เอาประกันภัยและบริษัทประกันภัย',
  'ดูแลเรื่องการเรียกร้องค่าเสียหายของผู้เอาประกันภัย',
  'จัดหาแหล่งที่สามารถรับประกันภัยที่เป็นประโยชน์ต่อสังคม',
  'ให้ความรู้และประสบการณ์กับสถาบันการศึกษาต่างๆ',
  'การสร้างงานให้กับสังคม',
]

const ETHICS = [
  'สมาคมฯ ได้กำหนดจรรยาบรรณให้สมาชิกยึดถือปฏิบัติอย่างเคร่งครัด เพื่อสร้างมาตรฐานและความน่าเชื่อถือให้แก่วิชาชีพ',
  'สมาชิกฯ จะประกอบธุรกิจด้วยความซื่อสัตย์ สุจริต และไม่สนับสนุนการกระทำอันเป็นความผิดตามกฎหมาย ผิดศีลธรรมและผิดจริยธรรมใดๆ',
  'สมาชิกฯ จะปฏิบัติต่อลูกค้าและผู้รับประกันภัยอย่างเป็นธรรม และยึดถือประโยชน์ของลูกค้าเป็นสำคัญ',
  'สมาชิกฯ จะปฏิบัติงานตามมาตรฐานวิชาชีพและพัฒนาความรู้ ความสามารถให้รองรับต่อการเปลี่ยนแปลงของธุรกิจโดยตลอด',
  'สมาชิกฯ จะประกอบธุรกิจโดยมีระบบการดำเนินงานที่เป็นมาตรฐาน มีการควบคุมที่ดี มีความโปร่งใสเพียงพอที่จะสร้างความเชื่อมั่นให้กับประชาชนได้',
  'สมาชิกฯ จะรักษาความลับของลูกค้าที่ตนได้ล่วงรู้มาจากการดำเนินธุรกิจอย่างยิ่งยวด ไม่เปิดเผยแก่บุคคลภายนอกอื่นใด ยกเว้นเป็นการเปิดเผยตามหน้าที่หรือตามกฎหมาย',
  'สมาชิกฯ จะไม่ใช้ถ้อยคำหรือการแสดงออกในการโฆษณา ประชาสัมพันธ์กิจการของสมาชิกฯ ที่เกินจริง หรือก่อให้เกิดความเข้าใจผิด',
]

const PRESIDENTS = [
  { name: 'นายเจนกิจ ตันสกุล',               term: '(พ.ศ. 2512 และ พ.ศ. 2520 – 2522)' },
  { name: 'ม.ล. สมศักดิ์ กำภู',              term: '(พ.ศ. 2522 – 2528)' },
  { name: 'นายสมศักดิ์ ดุรงค์พันธ์',           term: '(พ.ศ. 2528 – 2530)' },
  { name: 'นายอุดม รัมมณีย์',                term: '(พ.ศ. 2530-2534)' },
  { name: 'นายพัลลภ อิศรางกูร ณ อยุธยา',      term: '(พ.ศ. 2534 – 2536)' },
  { name: 'นายเปรมศักดิ์ คล้ายสังข์',          term: '(พ.ศ. 2536 – 2540)' },
  { name: 'นายพิชิต เมฆกิตติกุล',             term: '(พ.ศ. 2540 – 2546)' },
  { name: 'นางวรรณี คงภักดีพงษ์',             term: '(พ.ศ. 2546 – 2550)' },
  { name: 'นายเรืองวิทย์ นันทาภิวัฒน์',        term: '(พ.ศ. 2550 – 2554)' },
  { name: 'นายปานวัฒน์ กูรมาภิรักษ์',          term: '(พ.ศ 2554 – 2556)' },
  { name: 'นายจิตวุฒิ ศศิบุตร',               term: '(พ.ศ 2556 – 2560)' },
  { name: 'นายชนะพันธุ์ พิริยะพันธุ์',          term: '(พ.ศ. 2560-2564)' },
  { name: 'นายจิตวุฒิ ศศิบุตร',               term: '(พ.ศ. 2564-ปัจจุบัน)' },
]

// ─── Scroll hook ──────────────────────────────────────────────────────────────

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const onScroll = () => {
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i])
        if (el && el.getBoundingClientRect().top <= 160) {
          setActive(ids[i])
          return
        }
      }
      setActive(ids[0])
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])

  return active
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutAssociationPage() {
  const sectionIds = SECTIONS.map(s => s.id)
  const active = useActiveSection(sectionIds)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      {/* ── Banner ── */}
      <section style={{ height: 350, position: 'relative', overflow: 'hidden' }}>
        <img src="/assets/hero-bg.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(31,68,136,0.1) 0%, rgba(31,68,136,0.9) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 64, lineHeight: 1, color: '#f5f5f5', margin: 0 }}>
            เกี่ยวกับสมาคม
          </h1>
        </div>
      </section>

      {/* ── Breadcrumb ── */}
      <div style={{ backgroundColor: '#132953', padding: '16px 80px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/home" style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, color: '#fff', textDecoration: 'none' }}>หน้าหลัก</Link>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, color: '#fff' }}>เกี่ยวกับสมาคม</span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ backgroundColor: '#fff', padding: '80px 80px' }}>
        <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start' }}>

          {/* ── Left sidebar nav ── */}
          <div style={{ flex: 1, flexShrink: 0, position: 'sticky', top: 100 }}>
            <div style={{ borderRadius: 16, boxShadow: '0px 0px 24px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#1f4488', padding: 24 }}>
                <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#fff', margin: 0 }}>
                  พาฉันไปที่
                </p>
              </div>
              <div style={{ backgroundColor: '#fff', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {SECTIONS.map(s => {
                  const isActive = active === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        height: 57, padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: isActive ? '#e7f1eb' : 'transparent',
                        fontFamily: 'var(--font-thai)',
                        fontWeight: isActive ? 600 : 400,
                        fontSize: 16, lineHeight: '20px',
                        color: isActive ? '#126f38' : '#0a0a0a',
                        textAlign: 'left',
                      }}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Right content ── */}
          <div style={{ width: 820, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 40 }}>

            {/* ── Hero image ── */}
            <div style={{ height: 320, borderRadius: 16, overflow: 'hidden' }}>
              <img src="/assets/news-thumb-1.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* ── Title + desc ── */}
            <div id="about" style={{ scrollMarginTop: 100, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, lineHeight: '100%', color: '#1f4488', margin: 0 }}>
                เกี่ยวกับสมาคมนายหน้าประกันภัยไทย
              </p>
              <p style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)', margin: 0 }}>
                สมาคมนายหน้าประกันภัยไทย ก่อตั้งขึ้นเพื่อเป็นศูนย์กลางของผู้ประกอบวิชาชีพนายหน้าประกันภัย{' '}
                ทำหน้าที่ส่งเสริมสนับสนุน และยกระดับมาตรฐานวิชาชีพให้เป็นที่ยอมรับในระดับสากล{' '}
                เพื่อสร้างประโยชน์สูงสุดต่อผู้เอาประกันภัย สังคม และเศรษฐกิจของประเทศ
              </p>
            </div>

            {/* ── Sections block (gap-80) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>

              {/* ── 4 Pillars ── */}
              <div style={{
                backgroundColor: '#fff', borderRadius: 16,
                display: 'flex', flexWrap: 'wrap', gap: 40,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {PILLARS.map(p => (
                  <div key={p.title} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 32, minWidth: 278, flexShrink: 0,
                  }}>
                    <Image src={p.icon} alt="" width={80} height={80} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', textAlign: 'center' }}>
                      <p style={{
                        fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 24, lineHeight: '30px',
                        color: '#0a0a0a', margin: 0, whiteSpace: 'pre-line',
                      }}>
                        {p.title}
                      </p>
                      <p style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)', margin: 0 }}>
                        {p.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── 2. History ── */}
              <div id="history" style={{ scrollMarginTop: 100, display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                {/* Left image */}
                <div style={{ width: 303, flexShrink: 0, borderRadius: 16, overflow: 'hidden', alignSelf: 'stretch', position: 'relative' }}>
                  <img
                    src="/assets/news-thumb-2.png"
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                {/* Right text */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, lineHeight: '100%', color: '#1f4488', margin: 0 }}>
                    ประวัติการก่อตั้ง
                  </p>
                  <div style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)' }}>
                    <p style={{ margin: '0 0 16px' }}>
                      ธุรกิจประกันภัย ไม่ว่าจะเป็นการประกันชีวิตหรือการประกันวินาศภัย ล้วนมี "คนกลาง" เป็นผู้เข้ามาช่วยจัดการให้เกิดสัญญาขึ้นระหว่างบริษัทประกันภัยและผู้เอาประกันภัย ซึ่งอาชีพนี้มีมาอย่างยาวนาน
                    </p>
                    <p style={{ margin: '0 0 16px' }}>
                      จุดเปลี่ยนที่สำคัญเกิดขึ้นเมื่อปีพุทธศักราช 2510 ได้มีการประกาศใช้พระราชบัญญัติประกันวินาศภัย ซึ่งมีการแบ่งแยกและระบุสถานะระหว่าง "ตัวแทน" และ "นายหน้า" อย่างชัดเจน ทั้งในรูปแบบบุคคลธรรมดาและนิติบุคคล เพื่อส่งเสริมให้ธุรกิจประกันภัยมีความมั่นคงและก้าวหน้ายิ่งขึ้น
                    </p>
                    <p style={{ margin: '0 0 16px' }}>
                      ด้วยเหตุนี้ คณะบุคคลผู้ประกอบอาชีพนายหน้าประกันวินาศภัยและนายหน้าประกันชีวิตในยุคบุกเบิก นำโดย นายเจนกิจ ตันสกุล ได้เล็งเห็นถึงความสำคัญของการรวมกลุ่ม เพื่อพัฒนาการประกอบอาชีพให้มีประสิทธิภาพ สร้างความเป็นธรรมทั้งในด้านเบี้ยประกันภัยและการเรียกร้องค่าสินไหมทดแทน จึงได้ร่วมกันก่อตั้ง สมาคมนายหน้าประกัน (Insurance Brokers Association) ขึ้นเมื่อวันที่ 9 มกราคม พ.ศ. 2512
                    </p>
                    <p style={{ margin: '0 0 16px' }}>
                      ในช่วงแรกของการก่อตั้ง สมาคมฯ ยังไม่เป็นที่รู้จักแพร่หลาย ทำให้มีสมาชิกเข้าร่วมจำนวนน้อย และการดำเนินงานเป็นไปอย่างช้าๆ ต้องอาศัยสถานที่ของสมาชิกเป็นสำนักงานชั่วคราว โดยมีสมาชิกร่วมก่อตั้งประมาณ 12 บริษัท
                    </p>
                    <p style={{ margin: 0 }}>
                      ต่อมาสมาคมฯ ได้เปลี่ยนชื่อเป็น สมาคมนายหน้าประกันภัยไทย (Thai Insurance Brokers Association) และได้รับการรับรองจากกรมพัฒนาธุรกิจการค้า เมื่อวันที่ 1 ตุลาคม พ.ศ. 2550
                    </p>
                  </div>
                </div>
              </div>

              {/* ── 3. Objectives ── */}
              <div id="objectives" style={{ scrollMarginTop: 100, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, lineHeight: '100%', color: '#1f4488', margin: 0 }}>
                  วัตถุประสงค์และพันธกิจ
                </p>

                {/* วัตถุประสงค์หลัก — blue gradient */}
                <div style={{
                  borderRadius: 16, padding: 32,
                  background: 'linear-gradient(203.173deg, #1f4488 0%, #6f8aba 100%)',
                  display: 'flex', flexDirection: 'column', gap: 16, color: '#fff',
                }}>
                  <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 500, fontSize: 24, lineHeight: '100%', margin: 0 }}>
                    วัตถุประสงค์หลักของสมาคมฯ
                  </p>
                  <ol style={{
                    fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16,
                    margin: 0, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                    {OBJECTIVES.map((item, i) => (
                      <li key={i} style={{ lineHeight: '20px' }}>{item}</li>
                    ))}
                  </ol>
                </div>

                {/* พันธกิจ — green gradient */}
                <div style={{
                  borderRadius: 16, padding: 32,
                  background: 'linear-gradient(195.733deg, #126f38 0%, #51ba7c 100%)',
                  display: 'flex', flexDirection: 'column', gap: 16, color: '#fff',
                }}>
                  <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 500, fontSize: 24, lineHeight: '100%', margin: 0 }}>
                    พันธกิจของสมาชิกต่อสังคม
                  </p>
                  <ol style={{
                    fontFamily: 'var(--font-thai)', fontWeight: 400, fontSize: 16,
                    margin: 0, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                    {MISSIONS.map((item, i) => (
                      <li key={i} style={{ lineHeight: '20px' }}>{item}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* ── 4. International ── */}
              <div id="international" style={{ scrollMarginTop: 100, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, lineHeight: '100%', color: '#1f4488', margin: 0 }}>
                  การพัฒนาสมาคมฯ และเครือข่ายระดับสากล
                </p>
                <div style={{ height: 320, borderRadius: 16, overflow: 'hidden' }}>
                  <img src="/assets/news-thumb-3.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)' }}>
                  <p style={{ margin: '0 0 16px' }}>
                    คณะกรรมการบริหารของสมาคมฯ ในทุกยุคทุกสมัย ได้พยายามสานต่อนโยบายและพัฒนาวิชาชีพนายหน้าประกันภัยให้มีประสิทธิภาพยิ่งขึ้นอย่างต่อเนื่อง เพื่อให้เป็นที่ยอมรับจากองค์กรกำกับดูแล เช่น กรมการประกันภัย (ปัจจุบันคือ สำนักงาน คปภ.) สมาคมประกันวินาศภัยไทย และสมาคมประกันชีวิตไทย
                  </p>
                  <p style={{ margin: '0 0 16px' }}>
                    สมาคมฯ ได้มีโอกาสเข้าร่วมประชุมเชิงปฏิบัติการเรื่อง "การกำหนดยุทธศาสตร์การประกันภัยแห่งชาติ" ซึ่งเป็นก้าวสำคัญในการร่วมพัฒนาวงการธุรกิจประกันภัยของประเทศ
                  </p>
                  <p style={{ margin: 0 }}>
                    ในระดับนานาชาติ เมื่อปี พ.ศ. 2545 สมาคมฯ ได้สมัครเข้าเป็นสมาชิกของ Council of International Insurance Brokers Associations (CIIBA) ซึ่งต่อมาได้แยกเป็น CAPIBA (COUNCIL OF ASIA PACIFIC INSURANCE BROKERS ASSOCIATIONS) และเป็นสมาชิกของ WFII (World Federation of Insurance Intermediaries) ในปัจจุบัน
                  </p>
                </div>
              </div>

              {/* ── 5. Ethics ── */}
              <div id="ethics" style={{ scrollMarginTop: 100 }}>
                <div style={{ borderRadius: 16, boxShadow: '0px 0px 24px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
                  {/* Header — white bg + border bottom */}
                  <div style={{
                    backgroundColor: '#fff', padding: '40px 40px',
                    borderBottom: '1px solid #dfdfdf',
                  }}>
                    <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, lineHeight: '100%', color: '#1f4488', margin: 0 }}>
                      จรรยาบรรณสมาชิก
                    </p>
                  </div>
                  {/* Items */}
                  <div style={{ backgroundColor: '#fff', padding: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {ETHICS.map((text, i) => (
                      <div key={i} style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-eng)', fontWeight: 700, fontSize: 48, lineHeight: '100%',
                          color: '#126f38', flexShrink: 0, width: 32, textAlign: 'center',
                        }}>
                          {i + 1}
                        </span>
                        <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#0a0a0a', margin: 0, flex: 1 }}>
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── 6. Presidents ── */}
              <div id="presidents" style={{ scrollMarginTop: 100, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontFamily: 'var(--font-thai)', fontWeight: 700, fontSize: 32, lineHeight: '100%', color: '#1f4488', margin: 0 }}>
                  ทำเนียบนายกสมาคม
                </p>
                <div style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)' }}>
                  <p style={{ margin: 0 }}>นับตั้งแต่ก่อตั้งเมื่อปีพุทธศักราช 2512 จวบจนถึงปัจจุบัน สมาคมฯ ได้รับเกียรติจากผู้ทรงคุณวุฒิหลายท่านในการ</p>
                  <p style={{ margin: 0 }}>ดำรงตำแหน่งนายกสมาคม ดังนี้</p>
                </div>

                {/* Timeline */}
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  {/* Vertical line + dots */}
                  <div style={{ width: 42, flexShrink: 0, position: 'relative', alignSelf: 'stretch' }}>
                    <div style={{
                      position: 'absolute', left: 21, top: 11, bottom: 11,
                      width: 0, borderLeft: '1px solid #dfdfdf',
                    }} />
                    {PRESIDENTS.map((_, i) => (
                      <div key={i} style={{
                        position: 'absolute', left: 17, top: 7 + i * 28,
                        width: 8, height: 8, borderRadius: '50%', backgroundColor: '#126f38',
                      }} />
                    ))}
                  </div>
                  {/* Names */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {PRESIDENTS.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'var(--font-thai)', fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </span>
                        <span style={{ fontFamily: 'var(--font-thai)', fontSize: 12, lineHeight: '100%', color: 'rgba(0,0,0,0.7)', whiteSpace: 'nowrap' }}>
                          {p.term}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>{/* end sections block */}
          </div>{/* end right col */}
        </div>
      </div>
    </div>
  )
}
