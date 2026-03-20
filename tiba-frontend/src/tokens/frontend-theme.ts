/**
 * frontend-theme.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Web Front semantic theme — maps raw design tokens to component roles.
 * Import this in components instead of hardcoding hex values.
 *
 * Source: Figma node 1:118399 (Desktop - 55, Web Front page)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  colors,
  gradients,
  textStyles,
  shadows,
  spacing,
  borderRadius,
  layout,
  images,
  icons,
} from './design-tokens'

// ─── COLOR ROLES ─────────────────────────────────────────────────────────────

export const theme = {
  color: {
    // ── Text ──
    textPrimary:    colors.black900,   // #0a0a0a — headings, body
    textSecondary:  colors.black100,   // #7b7b7b — muted / meta text
    textDisabled:   colors.black60,    // #b3b3b3 — placeholder
    textWhite:      colors.black0,     // #ffffff
    textWhiteMuted: 'rgba(255, 255, 255, 0.70)', // hero subtitle, card labels
    textBodyMuted:  'rgba(0, 0, 0, 0.70)',       // body copy on white bg
    textPriceMuted: 'rgba(0, 0, 0, 0.50)',       // checkmark labels in membership

    // ── Brand ──
    brandGreen:     colors.green300,   // #126f38
    brandBlue:      colors.blue300,    // #1f4488

    // ── Surface ──
    surfaceWhite:   colors.black0,     // #ffffff — card backgrounds
    surfaceLight:   colors.black20,    // #f5f5f5 — button bg, light sections
    surfaceBorder:  colors.black40,    // #dfdfdf — card borders, dividers

    // ── Course status banners ──
    statusClosingSoon: '#ee7429',      // orange — "ใกล้ปิดรับสมัคร"
    statusOpen:        colors.blue300, // #1f4488 — "เปิดรับสมัครแล้ว"
    statusComingSoon:  '#126f38',      // green — "เปิดรับเร็วๆ นี้"

    // ── Sponsor circle backgrounds ──
    sponsorPurple:   colors.sponsorPurple,   // #272662
    sponsorOrange:   colors.sponsorOrange,   // #f76f21
    sponsorNavy:     colors.sponsorNavy,     // #124e82
    sponsorDarkNavy: colors.sponsorDarkNavy, // #0a3d72
  },

  // ─── GRADIENTS ─────────────────────────────────────────────────────────────

  gradient: {
    /** Hero section bottom overlay — transparent → brand blue */
    heroOverlay:        gradients.heroOverlay,

    /** Membership section bg overlay — dark green tint */
    membershipOverlay:  gradients.membershipOverlay,

    /** Green membership card header */
    membershipGreenHeader: gradients.greenCard,

    /** Green membership register button */
    membershipGreenButton: gradients.greenButton,

    /** Blue membership card header + course price chip */
    membershipBlueHeader:  gradients.blueCard,

    /** Blue membership register button */
    membershipBlueButton:  gradients.blueButton,
  },

  // ─── TYPOGRAPHY ────────────────────────────────────────────────────────────

  text: {
    /** Hero "สมาคมนายหน้าประกันภัยไทย" — 64px SemiBold */
    heroTitle:       textStyles.display,

    /** Hero subtitle — 32px Medium */
    heroSubtitle:    textStyles.subDisplay,

    /** All section headings — 32px SemiBold */
    sectionHeading:  textStyles.heading,

    /** Card titles — 24px SemiBold / 30px */
    cardTitle:       textStyles.title,

    /** Standard body copy — 16px Regular / 20px */
    body:            textStyles.body,

    /** Bold body / checkmark labels — 16px SemiBold / 20px */
    bodyBold:        textStyles.bodyBold,

    /** Thai CTA buttons — 16px SemiBold */
    buttonTha:       textStyles.buttonTha,

    /** English CTA buttons — 16px SemiBold */
    buttonEng:       textStyles.buttonEng,

    /** Course card prices — 24px Bold / 32px */
    priceSmall:      textStyles.price,

    /** Membership plan prices — 48px Bold */
    priceLarge:      textStyles.bigPrice,
  },

  // ─── SHADOWS ───────────────────────────────────────────────────────────────

  shadow: {
    /** Applied to all cards: course, news, membership */
    card: shadows.card,
  },

  // ─── SPACING ───────────────────────────────────────────────────────────────

  spacing,

  // ─── BORDER RADIUS ─────────────────────────────────────────────────────────

  radius: {
    button:  borderRadius.sm,   // 8px  — buttons, price chips
    card:    borderRadius.md,   // 16px — all cards
    circle:  borderRadius.lg,   // 500px — sponsor logos
  },

  // ─── LAYOUT ────────────────────────────────────────────────────────────────

  layout: {
    frameWidth:   layout.frameWidth,    // 1440px
    contentWidth: layout.contentWidth,  // 1280px
    paddingX:     layout.pagePaddingX,  // 80px  — horizontal page padding
    heroHeight:   layout.heroHeight,    // 720px
  },

  // ─── ASSETS ────────────────────────────────────────────────────────────────

  images,
  icons,
} as const

// ─── SECTION-LEVEL CONFIGS ───────────────────────────────────────────────────
// Ready-to-use config objects for each landing page section.

/** Hero section (node 1:118401) */
export const heroConfig = {
  bg:             theme.color.brandGreen,        // #126f38
  height:         theme.layout.heroHeight,       // 720px
  image:          theme.images.heroBg,
  overlayGradient: theme.gradient.heroOverlay,
  titleColor:     colors.black20,                // #f5f5f5
  subtitleColor:  theme.color.textWhiteMuted,    // rgba(255,255,255,0.7)
  ctaLabel:       'สมัครสมาชิกสมาคม',
  ctaBg:          theme.color.surfaceLight,      // #f5f5f5
  ctaText:        theme.color.textPrimary,       // #0a0a0a
  ctaIcon:        theme.icons.arrowRight,
} as const

/** What-we-do section (node 1:118414) */
export const whatWeDoConfig = {
  paddingTop:    theme.spacing['5xl'],  // 80px
  paddingBottom: theme.spacing['7xl'],  // 120px
  items: [
    {
      icon:        theme.icons.education,
      title:       'พัฒนาความรู้\nและวิชาชีพ',
      description: 'สมาคมฯ จัดหลักสูตรและเวิร์กช็อป ด้านเทคนิคประกันภัยและทักษะธุรกิจ อย่างต่อเนื่อง เพื่อยกระดับมาตรฐาน การให้บริการ',
    },
    {
      icon:        theme.icons.protect,
      title:       'คุ้มครองและส่งเสริม\nนายหน้าประกันภัย',
      description: 'สมาคมฯ เป็นตัวแทนเจรจาเงื่อนไขที่ เป็นธรรม ช่วยแก้ไขอุปสรรคและรับ รองผลประโยชน์ให้กับนายหน้าประกันภัย',
    },
    {
      icon:        theme.icons.network,
      title:       'ร่วมมือภาครัฐและ\nขยายเครือข่ายสากล',
      description: 'สมาคมฯ ร่วมกำหนดนโยบายกับ คปภ. และเชื่อมโยงกับองค์กรโลก (CIIBA, CAPIBA, WFII) เพื่อแลกเปลี่ยนแนวปฏิบัติที่ดีและมาตรฐานสากล',
    },
    {
      icon:        theme.icons.ethics,
      title:       'ธำรงเกียรติ\nและจรรยาบรรณ',
      description: 'สมาคมฯ กำหนดแนวปฏิบัติซื่อสัตย์ โปร่งใส รักษาผลประโยชน์ผู้เอาประกัน เป็นหลัก เพื่อสร้างความเชื่อมั่นในวงการ',
    },
  ],
} as const

/** Partner offers section (node 1:118460) */
export const partnerOffersConfig = {
  sectionTitle: 'ข้อเสนอพิเศษจากพันธมิตร',
  images: {
    large: theme.images.partnerAdLarge,
    sm1:   theme.images.partnerAd1,
    sm2:   theme.images.partnerAd2,
    sm3:   theme.images.partnerAd3,
  },
} as const

/** Courses section (node 1:118495) */
export const coursesConfig = {
  sectionTitle: 'คอร์สอบรม',
  sectionIcon:  theme.icons.book,
  ctaLabel:     'ดูคอร์สทั้งหมด',
  ctaIcon:      theme.icons.arrowRight,
  // Fallback thumbnails when API data has no image
  fallbackThumbs: [
    theme.images.courseThumb1,
    theme.images.courseThumb2,
    theme.images.courseThumb3,
    theme.images.courseThumb4,
  ],
} as const

/** News section (node 1:118512) */
export const newsConfig = {
  sectionTitle: 'ข่าวสารและบทความล่าสุด',
  sectionIcon:  theme.icons.newspaper,
  ctaLabel:     'ดูบทความทั้งหมด',
  ctaIcon:      theme.icons.arrowRight,
  fallbackThumbs: [
    theme.images.newsFeatured,
    theme.images.newsThumb1,
    theme.images.newsThumb2,
    theme.images.newsThumb3,
    theme.images.newsThumb4,
  ],
} as const

/** Membership section (node 1:118566) */
export const membershipConfig = {
  sectionTitle:    'เลือกประเภทของสมาชิกที่ต้องการสมัคร',
  bgImage:         theme.images.membershipBg,
  bgOverlay:       theme.gradient.membershipOverlay,
  plans: [
    {
      id:           'general',
      title:        'สมาชิกทั่วไป',
      price:        'สมัครฟรี',
      description:  'เหมาะสำหรับ บุคคลทั่วไปที่ต้องการ อัพเดตข่าวสารของสมาคมก่อนใคร',
      headerGradient: theme.gradient.membershipGreenHeader,
      buttonGradient: theme.gradient.membershipGreenButton,
      benefits: [
        'เข้าถึงข้อมูลทั่วไปของเว็บไซต์',
        'อัพเดตข่าวสารต่างๆ ก่อนใคร',
        'รับสิทธิสมัครคอร์สอบรมของทางสมาคม',
      ],
    },
    {
      id:           'association',
      title:        'สมาชิกสมาคม',
      price:        '20,000.-',
      description:  'เหมาะสำหรับ การก้าวสู่การเป็นนายหน้า ประกันมืออาชีพ',
      headerGradient: theme.gradient.membershipBlueHeader,
      buttonGradient: theme.gradient.membershipBlueButton,
      benefits: [
        'เข้าถึงข้อมูลทั่วไปของเว็บไซต์',
        'อัพเดตข่าวสารต่างๆ ก่อนใคร',
        'รับสิทธิสมัครคอร์สอบรมของทางสมาคม',
        'ได้รับการขึ้นโลโก้ของสมาคมในหน้าสมาชิก',
        'สามารถดาวน์โหลดประกาศต่างๆ ของสมาคมได้',
      ],
    },
  ],
} as const

/** Sponsors section (node 1:118629) */
export const sponsorsConfig = {
  sectionTitle: 'ผู้สนับสนุนของสมาคม',
  sponsors: [
    { image: theme.images.sponsor1, bg: theme.color.sponsorPurple },
    { image: theme.images.sponsor2, bg: theme.color.sponsorOrange },
    { image: theme.images.sponsor3, bg: theme.color.sponsorNavy    },
    { image: theme.images.sponsor4, bg: theme.color.sponsorNavy    },
    { image: theme.images.sponsor5, bg: theme.color.sponsorDarkNavy },
  ],
} as const
