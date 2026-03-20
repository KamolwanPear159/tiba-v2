/**
 * design-tokens.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for ALL raw design values.
 * Extracted exclusively from Figma node 1:118399 (Desktop - 55, Web Front).
 *
 * DO NOT edit manually — update by re-reading Figma and regenerating.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── COLORS ──────────────────────────────────────────────────────────────────

export const colors = {
  /** Black/B900 — primary text, headings */
  black900: '#0a0a0a',
  /** Black/B100 — secondary / muted text */
  black100: '#7b7b7b',
  /** Black/B60  — disabled / placeholder text */
  black60: '#b3b3b3',
  /** Black/B40  — borders, dividers */
  black40: '#dfdfdf',
  /** Black/B20  — light surface, button bg */
  black20: '#f5f5f5',
  /** Black/B0   — pure white */
  black0: '#ffffff',

  /** Green/G300 — primary brand green */
  green300: '#126f38',
  /** Green/G100 — light green (gradient end) */
  green100: '#51ba7c',

  /** Blue/B300  — primary brand blue */
  blue300: '#1f4488',
  /** Blue/B100  — light blue (gradient end) */
  blue100: '#6f8aba',

  /** Sponsor circle backgrounds */
  sponsorPurple: '#272662',
  sponsorOrange: '#f76f21',
  sponsorNavy:   '#124e82',
  sponsorDarkNavy: '#0a3d72',
} as const

// ─── GRADIENTS ───────────────────────────────────────────────────────────────

export const gradients = {
  /**
   * Gradient Green (card header)
   * Used on: สมาชิกทั่วไป card header, ลงทะเบียน button
   * Figma token: Gradient Green
   */
  greenCard: 'linear-gradient(200.339deg, #126f38 0%, #51ba7c 100%)',

  /**
   * Gradient Green (button / slight angle)
   * Used on: ลงทะเบียน button inside green membership card
   */
  greenButton: 'linear-gradient(186.582deg, #126f38 0%, #51ba7c 100%)',

  /**
   * Gradient Blue (card header)
   * Used on: สมาชิกสมาคม card header, course price chip
   * Figma token: Gradient Blue
   */
  blueCard: 'linear-gradient(200.339deg, #1f4488 0%, #6f8aba 100%)',

  /**
   * Gradient Blue (button / slight angle)
   * Used on: ลงทะเบียน button inside blue membership card
   */
  blueButton: 'linear-gradient(186.582deg, #1f4488 0%, #6f8aba 100%)',

  /**
   * Hero bottom overlay — fades hero image into blue
   * Used on: Hero section (node 1:118401) bottom half
   * Figma token: Gradient Main
   */
  heroOverlay: 'linear-gradient(to bottom, rgba(31,68,136,0) 0%, #1f4488 100%)',

  /**
   * Membership section full-bleed overlay
   * Used on: node 1:118566 background image overlay
   */
  membershipOverlay:
    'linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.4) 100%), ' +
    'linear-gradient(90deg, rgba(18,111,56,0.7) 0%, rgba(18,111,56,0.7) 100%)',
} as const

// ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────

/**
 * Font families — both must be loaded via next/font or Google Fonts.
 * Anuphan: Thai primary font.
 * Inter: English numbers, prices, buttons.
 */
export const fontFamily = {
  thai: "var(--font-thai), 'Anuphan', sans-serif",
  eng:  "var(--font-eng), 'Inter', sans-serif",
} as const

export const fontWeight = {
  regular:   400,
  medium:    500,
  semiBold:  600,
  bold:      700,
} as const

/**
 * All text styles exactly as defined in the Figma design system.
 * { family, weight, size (px), lineHeight }
 */
export const textStyles = {
  /** THA/Display — Hero title */
  display: {
    fontFamily: fontFamily.thai,
    fontWeight: fontWeight.semiBold,
    fontSize:   64,
    lineHeight: '100%',
  },
  /** THA/Sub Display — Hero subtitle */
  subDisplay: {
    fontFamily: fontFamily.thai,
    fontWeight: fontWeight.medium,
    fontSize:   32,
    lineHeight: '100%',
  },
  /** THA/Heading — Section headings (32px) */
  heading: {
    fontFamily: fontFamily.thai,
    fontWeight: fontWeight.semiBold,
    fontSize:   32,
    lineHeight: '100%',
  },
  /** THA/Title — Card titles (24px / 30px) */
  title: {
    fontFamily: fontFamily.thai,
    fontWeight: fontWeight.semiBold,
    fontSize:   24,
    lineHeight: '30px',
  },
  /** THA/Body — Standard body copy */
  body: {
    fontFamily: fontFamily.thai,
    fontWeight: fontWeight.regular,
    fontSize:   16,
    lineHeight: '20px',
  },
  /** THA/Body Bold — Emphasis body copy */
  bodyBold: {
    fontFamily: fontFamily.thai,
    fontWeight: fontWeight.semiBold,
    fontSize:   16,
    lineHeight: '20px',
  },
  /** THA/Button — Thai CTA labels */
  buttonTha: {
    fontFamily: fontFamily.thai,
    fontWeight: fontWeight.semiBold,
    fontSize:   16,
    lineHeight: '100%',
  },
  /** ENG/Button — English CTA labels */
  buttonEng: {
    fontFamily: fontFamily.eng,
    fontWeight: fontWeight.semiBold,
    fontSize:   16,
    lineHeight: '100%',
  },
  /** ENG/Price — Course prices (24px) */
  price: {
    fontFamily: fontFamily.eng,
    fontWeight: fontWeight.bold,
    fontSize:   24,
    lineHeight: '32px',
  },
  /** ENG/Big Price / THA/Price — Membership prices (48px) */
  bigPrice: {
    fontFamily: fontFamily.eng,
    fontWeight: fontWeight.bold,
    fontSize:   48,
    lineHeight: '100%',
  },
} as const

// ─── SPACING ─────────────────────────────────────────────────────────────────

/**
 * Spacing values observed in the layout (px).
 * Used as padding, gap, and margin values throughout the page.
 */
export const spacing = {
  xs:   8,
  sm:   16,
  md:   24,
  lg:   32,
  xl:   40,
  '2xl': 48,
  '3xl': 56,
  '4xl': 64,
  '5xl': 80,
  '6xl': 88,
  '7xl': 120,
} as const

// ─── BORDER RADIUS ───────────────────────────────────────────────────────────

export const borderRadius = {
  sm:   8,
  md:   16,
  lg:   500,  // fully circular (sponsor logos)
} as const

// ─── SHADOWS ─────────────────────────────────────────────────────────────────

/**
 * Card Shadow — applied to all card components.
 * Figma: DROP_SHADOW, color #0000001A, offset (0,0), radius 24, spread 0
 */
export const shadows = {
  card: '0px 0px 24px 0px rgba(0, 0, 0, 0.10)',
} as const

// ─── LAYOUT ──────────────────────────────────────────────────────────────────

export const layout = {
  /** Design frame width */
  frameWidth:    1440,
  /** Content area (frame minus side padding) */
  contentWidth:  1280,
  /** Horizontal page padding */
  pagePaddingX:  80,
  /** Hero section height */
  heroHeight:    720,
} as const

// ─── ASSET PATHS ─────────────────────────────────────────────────────────────

/**
 * All image assets downloaded from Figma localhost:3845
 * and stored locally. Use these constants in components instead
 * of hardcoding paths.
 */
export const images = {
  // Branding
  navLogo:        '/assets/footer-logo.png',
  footerLogo:     '/assets/footer-logo.png',

  // Hero
  heroBg:         '/assets/hero-bg.png',

  // Partner offers
  partnerAdLarge: '/assets/partner-ad-large.png',
  partnerAd1:     '/assets/partner-ad-1.png',
  partnerAd2:     '/assets/partner-ad-2.png',
  partnerAd3:     '/assets/partner-ad-3.png',

  // Course thumbnails
  courseThumb1:   '/assets/course-thumb-1.png',
  courseThumb2:   '/assets/course-thumb-2.png',
  courseThumb3:   '/assets/course-thumb-3.png',
  courseThumb4:   '/assets/course-thumb-4.png',

  // News
  newsFeatured:   '/assets/news-featured.png',
  newsThumb1:     '/assets/news-thumb-1.png',
  newsThumb2:     '/assets/news-thumb-2.png',
  newsThumb3:     '/assets/news-thumb-3.png',
  newsThumb4:     '/assets/news-thumb-4.png',

  // Membership
  membershipBg:   '/assets/membership-bg.png',

  // Sponsors
  sponsor1:       '/assets/sponsor-1.png',
  sponsor2:       '/assets/sponsor-2.png',
  sponsor3:       '/assets/sponsor-3.png',
  sponsor4:       '/assets/sponsor-4.png',
  sponsor5:       '/assets/sponsor-5.png',

  // Teachers (course card avatars)
  teacher1:       '/assets/teacher-1.png',
  teacher2:       '/assets/teacher-2.png',
  teacher3:       '/assets/teacher-3.png',
  teacher4:       '/assets/teacher-4.png',
  teacher5:       '/assets/teacher-5.png',
} as const

/**
 * All icon assets downloaded from Figma localhost:3845.
 */
export const icons = {
  // What-we-do section
  education:        '/icons/icon-education.svg',
  protect:          '/icons/icon-protect.svg',
  network:          '/icons/icon-network.svg',
  ethics:           '/icons/icon-ethics.svg',

  // Section headers
  book:             '/icons/icon-book.svg',
  newspaper:        '/icons/icon-newspaper.svg',

  // Inline / utility
  calendar:         '/icons/icon-calendar.svg',
  clock:            '/icons/icon-clock.svg',
  checkmark:        '/icons/icon-checkmark.svg',

  // Arrows
  arrowRight:       '/icons/icon-arrow-right.svg',
  arrowRightWhite:  '/icons/icon-arrow-right-white.svg',
  arrowDown:        '/icons/icon-arrow-down.svg',
  arrowDown2:       '/icons/icon-arrow-down-2.svg',

  // Navigation
  search:           '/icons/icon-search.svg',
  user:             '/icons/icon-user.svg',

  // Social (footer)
  facebook:         '/icons/icon-facebook.svg',
  line:             '/icons/icon-line.svg',

  // Gift icon (composite — rendered as individual parts)
  giftPart0:        '/icons/icon-gift-part0.svg',
  giftPart1:        '/icons/icon-gift-part1.svg',
  giftPart2:        '/icons/icon-gift-part2.svg',
  giftPart3:        '/icons/icon-gift-part3.svg',
  giftPart4:        '/icons/icon-gift-part4.svg',
  giftPart5:        '/icons/icon-gift-part5.svg',
  giftPart6:        '/icons/icon-gift-part6.svg',
} as const
