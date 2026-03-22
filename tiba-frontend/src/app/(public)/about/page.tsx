'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const NAV_ITEMS = [
  { id: 'about-tiba', label: 'เกี่ยวกับสมาคม' },
  { id: 'history-tiba', label: 'ประวัติการก่อตั้ง' },
  { id: 'mission-tiba', label: 'วัตถุประสงค์และพันธกิจ' },
  { id: 'connection-tiba', label: 'การพัฒนาสมาคมฯ และเครือข่ายระดับสากล' },
  { id: 'rule-tiba', label: 'จรรยาบรรณสมาชิก' },
  { id: 'organize-tiba', label: 'ทำเนียบนายกสมาคม' },
];

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
];

const MISSIONS = [
  'ให้คำแนะนำที่เป็นประโยชน์ รวมถึงความคุ้มครองที่เหมาะสมกับผู้เอาประกันภัย',
  'ศึกษากรมธรรม์ และต่อรองเงื่อนไข พร้อมทั้งเบี้ยประกันภัยที่เป็นธรรมให้กับผู้เอาประกันภัยและบริษัทประกันภัย',
  'ดูแลเรื่องการเรียกร้องค่าเสียหายของผู้เอาประกันภัย',
  'จัดหาแหล่งที่สามารถรับประกันภัยที่เป็นประโยชน์ต่อสังคม',
  'ให้ความรู้และประสบการณ์กับสถาบันการศึกษาต่างๆ',
  'การสร้างงานให้กับสังคม',
];

const ETHICS = [
  'สมาคมฯ ได้กำหนดจรรยาบรรณให้สมาชิกยึดถือปฏิบัติอย่างเคร่งครัด เพื่อสร้างมาตรฐานและความน่าเชื่อถือให้แก่วิชาชีพ',
  'สมาชิกฯ จะประกอบธุรกิจด้วยความซื่อสัตย์ สุจริต และไม่สนับสนุนการกระทำอันเป็นความผิดตามกฎหมาย ผิดศีลธรรมและผิดจริยธรรมใดๆ',
  'สมาชิกฯ จะปฏิบัติต่อลูกค้าและผู้รับประกันภัยอย่างเป็นธรรม และยึดถือประโยชน์ของลูกค้าเป็นสำคัญ',
  'สมาชิกฯ จะปฏิบัติงานตามมาตรฐานวิชาชีพและพัฒนาความรู้ ความสามารถให้รองรับต่อการเปลี่ยนแปลงของธุรกิจโดยตลอด',
  'สมาชิกฯ จะประกอบธุรกิจโดยมีระบบการดำเนินงานที่เป็นมาตรฐาน มีการควบคุมที่ดี มีความโปร่งใสเพียงพอที่จะสร้างความเชื่อมั่นให้กับประชาชนได้',
  'สมาชิกฯ จะรักษาความลับของลูกค้าที่ตนได้ล่วงรู้มาจากการดำเนินธุรกิจอย่างยิ่งยวด ไม่เปิดเผยแก่บุคคลภายนอกอื่นใด ยกเว้นเป็นการเปิดเผยตามหน้าที่หรือตามกฎหมาย',
  'สมาชิกฯ จะไม่ใช้ถ้อยคำหรือการแสดงออกในการโฆษณา ประชาสัมพันธ์กิจการของสมาชิกฯ ที่เกินจริง หรือก่อให้เกิดความเข้าใจผิด',
];

const PRESIDENTS = [
  { name: 'นายเจนกิจ ตันสกุล', term: '(พ.ศ. 2512 และ พ.ศ. 2520 – 2522)' },
  { name: 'ม.ล. สมศักดิ์ กำภู', term: '(พ.ศ. 2522 – 2528)' },
  { name: 'นายสมศักดิ์ ดุรงค์พันธ์', term: '(พ.ศ. 2528 – 2530)' },
  { name: 'นายอุดม รัมมณีย์', term: '(พ.ศ. 2530-2534)' },
  { name: 'นายพัลลภ อิศรางกูร ณ อยุธยา', term: '(พ.ศ. 2534 – 2536)' },
  { name: 'นายเปรมศักดิ์ คล้ายสังข์', term: '(พ.ศ. 2536 – 2540)' },
  { name: 'นายพิชิต เมฆกิตติกุล', term: '(พ.ศ. 2540 – 2546)' },
  { name: 'นางวรรณี คงภักดีพงษ์', term: '(พ.ศ. 2546 – 2550)' },
  { name: 'นายเรืองวิทย์ นันทาภิวัฒน์', term: '(พ.ศ. 2550 – 2554)' },
  { name: 'นายปานวัฒน์ กูรมาภิรักษ์', term: '(พ.ศ 2554 – 2556)' },
  { name: 'นายจิตวุฒิ ศศิบุตร', term: '(พ.ศ 2556 – 2560)' },
  { name: 'นายชนะพันธุ์ พิริยะพันธุ์', term: '(พ.ศ. 2560-2564)' },
  { name: 'นายจิตวุฒิ ศศิบุตร', term: '(พ.ศ. 2564-ปัจจุบัน)' },
];

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('about-tiba');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.2, rootMargin: '-80px 0px -50% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ fontFamily: 'var(--font-thai), sans-serif' }}>
      {/* Hero Banner */}
      <div style={{ position: 'relative', width: '100%', height: 320, overflow: 'hidden' }}>
        <Image
          src="/assets/hero-bg.png"
          alt="เกี่ยวกับสมาคม"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(31,68,136,0.1), rgba(31,68,136,0.9))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-thai), sans-serif',
              fontWeight: 600,
              fontSize: 64,
              color: '#f5f5f5',
              margin: 0,
              textAlign: 'center',
            }}
          >
            เกี่ยวกับสมาคม
          </h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div
        style={{
          backgroundColor: '#132953',
          padding: '16px 80px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 16, lineHeight: '20px', color: '#fff' }}>
          หน้าหลัก
        </span>
        <span style={{ fontWeight: 400, fontSize: 16, lineHeight: '20px', color: '#fff' }}>/</span>
        <span style={{ fontWeight: 400, fontSize: 16, lineHeight: '20px', color: '#fff' }}>
          เกี่ยวกับสมาคม
        </span>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 80,
          display: 'flex',
          gap: 80,
          alignItems: 'flex-start',
          alignSelf: 'stretch',
        }}
      >
        {/* Sidebar Nav */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            position: 'sticky',
            top: 80,
            boxShadow: '0px 0px 24px 0px rgba(0,0,0,0.1)',
            borderRadius: 16,
          }}
        >
          <div
            style={{
              backgroundColor: '#1f4488',
              borderRadius: '16px 16px 0 0',
              padding: 24,
            }}
          >
            <p style={{ fontWeight: 600, fontSize: 24, lineHeight: '30px', color: '#fff', margin: 0 }}>
              พาฉันไปที่
            </p>
          </div>
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '0 0 16px 16px',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {NAV_ITEMS.map(({ id, label }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 57,
                    padding: '8px 16px',
                    borderRadius: 8,
                    width: '100%',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    backgroundColor: isActive ? '#e7f1eb' : 'transparent',
                    color: isActive ? '#126f38' : '#0a0a0a',
                    fontFamily: 'var(--font-thai), sans-serif',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 16,
                    lineHeight: '20px',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Sections */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 64 }}>

          {/* 1. About TIBA */}
          <section
            id="about-tiba"
            style={{ display: 'flex', flexDirection: 'column', gap: 32, textAlign: 'center' }}
          >

            {/* ── Event Photo (node 1:119009) — full width of content column ── */}
            <div
              style={{
                position: 'relative',
                borderRadius: 16,
                overflow: 'hidden',
                width: '100%',
                height: 369,          /* visible area = image_h(397) - top_offset(28) */
                flexShrink: 0,
              }}
            >
              {/* inner wrapper matches Figma: w-1018px h-397px left-(-81px) top-(-28px) */}
              <div
                style={{
                  position: 'absolute',
                  width: 1018,
                  height: 397,
                  left: -81,
                  top: -28,
                }}
              >
                <Image
                  src="/assets/about-banner.png"
                  alt="สมาคมนายหน้าประกันภัยไทย กิจกรรม"
                  fill
                  style={{ objectFit: 'cover', pointerEvents: 'none' }}
                  priority
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: 32, color: '#1f4488', margin: 0 }}>
                เกี่ยวกับสมาคมนายหน้าประกันภัยไทย
              </h2>
              <p style={{ fontWeight: 400, fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)', margin: 0 }}>
                สมาคมนายหน้าประกันภัยไทย ก่อตั้งขึ้นเพื่อเป็นศูนย์กลางของผู้ประกอบวิชาชีพนายหน้าประกันภัย{' '}
                ทำหน้าที่ส่งเสริมสนับสนุน และยกระดับมาตรฐานวิชาชีพให้เป็นที่ยอมรับในระดับสากล{' '}
                เพื่อสร้างประโยชน์สูงสุดต่อผู้เอาประกันภัย สังคม และเศรษฐกิจของประเทศ
              </p>
            </div>

            {/* ── 4 Pillars Cards (node 1:119015) ── */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: '48px 40px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 40,
                justifyContent: 'center',
                alignItems: 'flex-start',
                boxShadow: '0px 0px 24px 0px rgba(0,0,0,0.06)',
              }}
            >
              {/* Card 1 — พัฒนาความรู้และวิชาชีพ */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 32,
                  alignItems: 'center',
                  minWidth: 278,
                  flex: '1 1 278px',
                  maxWidth: 320,
                  textAlign: 'center',
                }}
              >
                {/* Icon: teaching/education */}
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1f4488"/>
                      <stop offset="100%" stopColor="#126f38"/>
                    </linearGradient>
                  </defs>
                  {/* Whiteboard */}
                  <rect x="14" y="10" width="44" height="32" rx="2" stroke="url(#grad1)" strokeWidth="2.5" fill="none"/>
                  {/* Board stand lines */}
                  <line x1="36" y1="42" x2="32" y2="56" stroke="url(#grad1)" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="44" y1="42" x2="48" y2="56" stroke="url(#grad1)" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="28" y1="56" x2="52" y2="56" stroke="url(#grad1)" strokeWidth="2.5" strokeLinecap="round"/>
                  {/* Star on board */}
                  <polygon points="36,18 37.8,23.5 43.5,23.5 38.9,26.9 40.7,32.4 36,29 31.3,32.4 33.1,26.9 28.5,23.5 34.2,23.5"
                    fill="url(#grad1)" stroke="none"/>
                  {/* Person */}
                  <circle cx="60" cy="25" r="5" stroke="url(#grad1)" strokeWidth="2.5" fill="none"/>
                  <path d="M54 42 C54 35 66 35 66 42" stroke="url(#grad1)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  {/* Pointing arm */}
                  <line x1="54" y1="38" x2="46" y2="33" stroke="url(#grad1)" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-thai), sans-serif',
                      fontWeight: 600,
                      fontSize: 24,
                      lineHeight: '30px',
                      color: '#0a0a0a',
                      margin: 0,
                    }}
                  >
                    พัฒนาความรู้<br />และวิชาชีพ
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-thai), sans-serif',
                      fontWeight: 400,
                      fontSize: 16,
                      lineHeight: '20px',
                      color: 'rgba(0,0,0,0.7)',
                      margin: 0,
                    }}
                  >
                    สมาคมฯ จัดหลักสูตรและเวิร์กช็อป<br />
                    ด้านเทคนิคประกันภัยและทักษะธุรกิจ<br />
                    อย่างต่อเนื่อง เพื่อยกระดับมาตรฐาน<br />
                    การให้บริการ
                  </p>
                </div>
              </div>

              {/* Card 2 — คุ้มครองและส่งเสริมนายหน้าประกันภัย */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 32,
                  alignItems: 'center',
                  minWidth: 278,
                  flex: '1 1 278px',
                  maxWidth: 320,
                  textAlign: 'center',
                }}
              >
                {/* Icon: shield protection */}
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad2" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1f4488"/>
                      <stop offset="100%" stopColor="#126f38"/>
                    </linearGradient>
                  </defs>
                  {/* Shield outline */}
                  <path d="M40 10 L62 20 L62 40 C62 54 52 64 40 70 C28 64 18 54 18 40 L18 20 Z"
                    stroke="url(#grad2)" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
                  {/* Shield inner lines */}
                  <path d="M40 20 L54 27 L54 40 C54 50 47 57 40 61 C33 57 26 50 26 40 L26 27 Z"
                    stroke="url(#grad2)" strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeDasharray="0"/>
                  {/* Curved accent lines */}
                  <path d="M32 38 Q40 32 48 38" stroke="url(#grad2)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M35 44 Q40 40 45 44" stroke="url(#grad2)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-thai), sans-serif',
                      fontWeight: 600,
                      fontSize: 24,
                      lineHeight: '30px',
                      color: '#0a0a0a',
                      margin: 0,
                    }}
                  >
                    คุ้มครองและส่งเสริม<br />นายหน้าประกันภัย
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-thai), sans-serif',
                      fontWeight: 400,
                      fontSize: 16,
                      lineHeight: '20px',
                      color: 'rgba(0,0,0,0.7)',
                      margin: 0,
                    }}
                  >
                    สมาคมฯ เป็นตัวแทนเจรจาเงื่อนไขที่<br />
                    เป็นธรรม ช่วยแก้ไขอุปสรรคและรับรอง<br />
                    ผลประโยชน์ให้กับนายหน้าประกันภัย
                  </p>
                </div>
              </div>

              {/* Card 3 — ร่วมมือภาครัฐและขยายเครือข่ายสากล */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 32,
                  alignItems: 'center',
                  minWidth: 278,
                  flex: '1 1 278px',
                  maxWidth: 320,
                  textAlign: 'center',
                }}
              >
                {/* Icon: handshake collaboration */}
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad3" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1f4488"/>
                      <stop offset="100%" stopColor="#126f38"/>
                    </linearGradient>
                  </defs>
                  {/* Left hand/arm */}
                  <path d="M10 48 L22 36 L30 40 L36 34" stroke="url(#grad3)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Right hand/arm */}
                  <path d="M70 48 L58 36 L50 40 L44 34" stroke="url(#grad3)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Clasped hands center */}
                  <path d="M36 34 C37 30 43 30 44 34 L46 38 C47 42 33 42 34 38 Z"
                    stroke="url(#grad3)" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
                  {/* Fingers left */}
                  <line x1="34" y1="38" x2="30" y2="44" stroke="url(#grad3)" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="36" y1="40" x2="32" y2="48" stroke="url(#grad3)" strokeWidth="2" strokeLinecap="round"/>
                  {/* Fingers right */}
                  <line x1="46" y1="38" x2="50" y2="44" stroke="url(#grad3)" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="44" y1="40" x2="48" y2="48" stroke="url(#grad3)" strokeWidth="2" strokeLinecap="round"/>
                  {/* Globe/network hint */}
                  <circle cx="40" cy="22" r="8" stroke="url(#grad3)" strokeWidth="2" fill="none"/>
                  <path d="M32 22 Q40 18 48 22" stroke="url(#grad3)" strokeWidth="1.5" fill="none"/>
                  <path d="M32 22 Q40 26 48 22" stroke="url(#grad3)" strokeWidth="1.5" fill="none"/>
                  <line x1="40" y1="14" x2="40" y2="30" stroke="url(#grad3)" strokeWidth="1.5"/>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-thai), sans-serif',
                      fontWeight: 600,
                      fontSize: 24,
                      lineHeight: '30px',
                      color: '#0a0a0a',
                      margin: 0,
                    }}
                  >
                    ร่วมมือภาครัฐและ<br />ขยายเครือข่ายสากล
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-thai), sans-serif',
                      fontWeight: 400,
                      fontSize: 16,
                      lineHeight: '20px',
                      color: 'rgba(0,0,0,0.7)',
                      margin: 0,
                    }}
                  >
                    สมาคมฯ ร่วมกำหนดนโยบายกับ คปภ.<br />
                    และเชื่อมโยงกับองค์กรโลก (CIIBA,<br />
                    CAPIBA, WFII) เพื่อแลกเปลี่ยนแนว<br />
                    ปฏิบัติที่ดีและมาตรฐานสากล
                  </p>
                </div>
              </div>

              {/* Card 4 — ธำรงเกียรติและจรรยาบรรณ */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 32,
                  alignItems: 'center',
                  minWidth: 278,
                  flex: '1 1 278px',
                  maxWidth: 320,
                  textAlign: 'center',
                }}
              >
                {/* Icon: hand holding book/ethics */}
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad4" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1f4488"/>
                      <stop offset="100%" stopColor="#126f38"/>
                    </linearGradient>
                  </defs>
                  {/* Open book */}
                  <path d="M20 18 L20 56 Q20 58 22 58 L40 52 L58 58 Q60 58 60 56 L60 18 Q60 16 58 16 L40 22 L22 16 Q20 16 20 18 Z"
                    stroke="url(#grad4)" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
                  {/* Book spine */}
                  <line x1="40" y1="22" x2="40" y2="52" stroke="url(#grad4)" strokeWidth="2" strokeLinecap="round"/>
                  {/* Lines on left page */}
                  <line x1="26" y1="28" x2="38" y2="25" stroke="url(#grad4)" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="26" y1="34" x2="38" y2="31" stroke="url(#grad4)" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="26" y1="40" x2="38" y2="37" stroke="url(#grad4)" strokeWidth="1.5" strokeLinecap="round"/>
                  {/* Lines on right page */}
                  <line x1="42" y1="25" x2="54" y2="28" stroke="url(#grad4)" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="42" y1="31" x2="54" y2="34" stroke="url(#grad4)" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="42" y1="37" x2="54" y2="40" stroke="url(#grad4)" strokeWidth="1.5" strokeLinecap="round"/>
                  {/* Bookmark ribbon */}
                  <path d="M54 16 L54 30 L50 26 L46 30 L46 16" stroke="url(#grad4)" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-thai), sans-serif',
                      fontWeight: 600,
                      fontSize: 24,
                      lineHeight: '30px',
                      color: '#0a0a0a',
                      margin: 0,
                    }}
                  >
                    ธำรงเกียรติ<br />และจรรยาบรรณ
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-thai), sans-serif',
                      fontWeight: 400,
                      fontSize: 16,
                      lineHeight: '20px',
                      color: 'rgba(0,0,0,0.7)',
                      margin: 0,
                    }}
                  >
                    สมาคมฯ กำหนดแนวปฏิบัติซื่อสัตย์<br />
                    โปร่งใส รักษาผลประโยชน์ผู้เอาประกัน<br />
                    เป็นหลัก เพื่อสร้างความเชื่อมั่น<br />
                    ในวงการ
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. History TIBA */}
          <section id="history-tiba">
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 303,
                  flexShrink: 0,
                  borderRadius: 16,
                  overflow: 'hidden',
                  alignSelf: 'stretch',
                  position: 'relative',
                  minHeight: 400,
                }}
              >
                <Image
                  src="/assets/membership-bg.png"
                  alt="ประวัติการก่อตั้ง"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center center' }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontWeight: 700, fontSize: 32, color: '#1f4488', margin: 0 }}>
                  ประวัติการก่อตั้ง
                </h2>
                <div
                  style={{
                    fontWeight: 400,
                    fontSize: 16,
                    lineHeight: '28px',
                    color: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <p style={{ margin: 0 }}>
                    ธุรกิจประกันภัย ไม่ว่าจะเป็นการประกันชีวิตหรือการประกันวินาศภัย ล้วนมี &ldquo;คนกลาง&rdquo;
                    เป็นผู้เข้ามาช่วยจัดการให้เกิดสัญญาขึ้นระหว่างบริษัทประกันภัยและผู้เอาประกันภัย
                    ซึ่งอาชีพนี้มีมาอย่างยาวนาน
                  </p>
                  <p style={{ margin: 0 }}>
                    จุดเปลี่ยนที่สำคัญเกิดขึ้นเมื่อปีพุทธศักราช 2510 ได้มีการประกาศใช้พระราชบัญญัติประกันวินาศภัย
                    ซึ่งมีการแบ่งแยกและระบุสถานะระหว่าง &ldquo;ตัวแทน&rdquo; และ &ldquo;นายหน้า&rdquo; อย่างชัดเจน
                    ทั้งในรูปแบบบุคคลธรรมดาและนิติบุคคล เพื่อส่งเสริมให้ธุรกิจประกันภัยมีความมั่นคงและก้าวหน้ายิ่งขึ้น
                  </p>
                  <p style={{ margin: 0 }}>
                    ด้วยเหตุนี้ คณะบุคคลผู้ประกอบอาชีพนายหน้าประกันวินาศภัยและนายหน้าประกันชีวิตในยุคบุกเบิก
                    นำโดย นายเจนกิจ ตันสกุล ได้เล็งเห็นถึงความสำคัญของการรวมกลุ่ม
                    เพื่อพัฒนาการประกอบอาชีพให้มีประสิทธิภาพ สร้างความเป็นธรรมทั้งในด้านเบี้ยประกันภัยและการเรียกร้องค่าสินไหมทดแทน
                    จึงได้ร่วมกันก่อตั้ง สมาคมนายหน้าประกัน (Insurance Brokers Association)
                    ขึ้นเมื่อวันที่ 9 มกราคม พ.ศ. 2512
                  </p>
                  <p style={{ margin: 0 }}>
                    ในช่วงแรกของการก่อตั้ง สมาคมฯ ยังไม่เป็นที่รู้จักแพร่หลาย ทำให้มีสมาชิกเข้าร่วมจำนวนน้อย
                    และการดำเนินงานเป็นไปอย่างช้าๆ ต้องอาศัยสถานที่ของสมาชิกเป็นสำนักงานชั่วคราว
                    โดยมีสมาชิกร่วมก่อตั้งประมาณ 12 บริษัท
                  </p>
                  <p style={{ margin: 0 }}>
                    ต่อมาสมาคมฯ ได้เปลี่ยนชื่อเป็น สมาคมนายหน้าประกันภัยไทย (Thai Insurance Brokers Association)
                    และได้รับการรับรองจากกรมพัฒนาธุรกิจการค้า เมื่อวันที่ 1 ตุลาคม พ.ศ. 2550
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Mission TIBA */}
          <section id="mission-tiba" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: 32, color: '#1f4488', margin: 0 }}>
              วัตถุประสงค์และพันธกิจ
            </h2>
            {/* Blue gradient box */}
            <div
              style={{
                background: 'linear-gradient(203.173deg, #1f4488 0%, #6f8aba 100%)',
                borderRadius: 16,
                padding: 32,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <p style={{ fontWeight: 500, fontSize: 24, lineHeight: 1, margin: 0 }}>
                วัตถุประสงค์หลักของสมาคมฯ
              </p>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: 24,
                  fontWeight: 400,
                  fontSize: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {OBJECTIVES.map((item, i) => (
                  <li key={i} style={{ lineHeight: '20px' }}>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            {/* Green gradient box */}
            <div
              style={{
                background: 'linear-gradient(195.733deg, #126f38 0%, #51ba7c 100%)',
                borderRadius: 16,
                padding: 32,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <p style={{ fontWeight: 500, fontSize: 24, lineHeight: 1, margin: 0 }}>
                พันธกิจของสมาชิกต่อสังคม
              </p>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: 24,
                  fontWeight: 400,
                  fontSize: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {MISSIONS.map((item, i) => (
                  <li key={i} style={{ lineHeight: '20px' }}>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* 4. Connection TIBA */}
          <section id="connection-tiba" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: 32, color: '#1f4488', margin: 0 }}>
              การพัฒนาสมาคมฯ และเครือข่ายระดับสากล
            </h2>
            <div
              style={{
                height: 320,
                borderRadius: 16,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Image
                src="/assets/hero-bg.png"
                alt="การพัฒนาสมาคมฯ และเครือข่ายระดับสากล"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center center' }}
              />
            </div>
            <div
              style={{
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '28px',
                color: 'rgba(0,0,0,0.7)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <p style={{ margin: 0 }}>
                คณะกรรมการบริหารของสมาคมฯ ในทุกยุคทุกสมัย ได้พยายามสานต่อนโยบายและพัฒนาวิชาชีพนายหน้าประกันภัย
                ให้มีประสิทธิภาพยิ่งขึ้นอย่างต่อเนื่อง เพื่อให้เป็นที่ยอมรับจากองค์กรกำกับดูแล
                เช่น กรมการประกันภัย (ปัจจุบันคือ สำนักงาน คปภ.) สมาคมประกันวินาศภัยไทย และสมาคมประกันชีวิตไทย
              </p>
              <p style={{ margin: 0 }}>
                สมาคมฯ ได้มีโอกาสเข้าร่วมประชุมเชิงปฏิบัติการเรื่อง
                &ldquo;การกำหนดยุทธศาสตร์การประกันภัยแห่งชาติ&rdquo;
                ซึ่งเป็นก้าวสำคัญในการร่วมพัฒนาวงการธุรกิจประกันภัยของประเทศ
              </p>
              <p style={{ margin: 0 }}>
                ในระดับนานาชาติ เมื่อปี พ.ศ. 2545 สมาคมฯ ได้สมัครเข้าเป็นสมาชิกของ
                Council of International Insurance Brokers Associations (CIIBA)
                ซึ่งต่อมาได้แยกเป็น CAPIBA (COUNCIL OF ASIA PACIFIC INSURANCE BROKERS ASSOCIATIONS)
                และเป็นสมาชิกของ WFII (World Federation of Insurance Intermediaries) ในปัจจุบัน
              </p>
            </div>
          </section>

          {/* 5. Rule TIBA */}
          <section
            id="rule-tiba"
            style={{ boxShadow: '0px 0px 24px 0px rgba(0,0,0,0.1)', borderRadius: 16 }}
          >
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px 16px 0 0',
                padding: 40,
                borderBottom: '1px solid #dfdfdf',
              }}
            >
              <h2 style={{ fontWeight: 700, fontSize: 32, color: '#1f4488', margin: 0 }}>
                จรรยาบรรณสมาชิก
              </h2>
            </div>
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '0 0 16px 16px',
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              {ETHICS.map((text, i) => (
                <div key={i} style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-eng), sans-serif',
                      fontWeight: 700,
                      fontSize: 48,
                      color: '#126f38',
                      flexShrink: 0,
                      width: 32,
                      textAlign: 'center',
                      lineHeight: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      lineHeight: '20px',
                      color: '#0a0a0a',
                      margin: 0,
                      flex: 1,
                      paddingTop: 8,
                    }}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Organize TIBA */}
          <section id="organize-tiba" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: 32, color: '#1f4488', margin: 0 }}>
              ทำเนียบนายกสมาคม
            </h2>
            <p style={{ fontWeight: 400, fontSize: 16, lineHeight: '20px', color: 'rgba(0,0,0,0.7)', margin: 0 }}>
              นับตั้งแต่ก่อตั้งเมื่อปีพุทธศักราช 2512 จวบจนถึงปัจจุบัน สมาคมฯ ได้รับเกียรติจากผู้ทรงคุณวุฒิหลายท่านในการ
              ดำรงตำแหน่งนายกสมาคม ดังนี้
            </p>
            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: 32 }}>
              {/* Vertical line */}
              <div
                style={{
                  position: 'absolute',
                  left: 3,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  backgroundColor: '#1f4488',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PRESIDENTS.map(({ name, term }, i) => (
                  <div
                    key={i}
                    style={{ display: 'flex', gap: 8, alignItems: 'baseline', position: 'relative' }}
                  >
                    {/* Dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: -29,
                        top: 6,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#1f4488',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: 16,
                        lineHeight: '20px',
                        color: 'rgba(0,0,0,0.7)',
                      }}
                    >
                      {name}
                    </span>
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: 12,
                        lineHeight: 1,
                        color: 'rgba(0,0,0,0.7)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {term}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
