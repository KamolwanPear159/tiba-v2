/**
 * backoffice-theme.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Design tokens for the back-office (admin) panel.
 * These values are separate from the public Web Front tokens and can be tuned
 * independently.  Import from this file in admin components instead of
 * hardcoding values.
 *
 * Last global resize: +2px applied 2026-03-20
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── FONTS ───────────────────────────────────────────────────────────────────

export const F = 'var(--font-thai)'

// ─── COLORS ──────────────────────────────────────────────────────────────────

export const PRIMARY  = '#1f4488'
export const DANGER   = '#ef4444'
export const SUCCESS  = '#16a34a'
export const BORDER   = '#e5e7eb'
export const SURFACE  = '#f9fafb'
export const TEXT     = '#374151'
export const TEXT_DIM = '#9ca3af'

// ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────

/** Font sizes (px) — all base values +2px from original Figma spec */
export const fontSize = {
  /** Tiny labels, helper text */
  xs:   12,
  /** Field labels */
  sm:   15,
  /** Body / form input text */
  md:   16,
  /** Medium text, table cells */
  base: 17,
  /** Page section headings */
  lg:   22,
  /** Page title (h1) */
  xl:   22,
  /** Large page title */
  '2xl': 24,
} as const

// ─── FORM ELEMENTS ───────────────────────────────────────────────────────────

/** Standard text input */
export const inputStyle = {
  width: '100%',
  height: 42,
  padding: '0 14px',
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  fontSize: fontSize.md,
  color: TEXT,
  outline: 'none',
  fontFamily: F,
  boxSizing: 'border-box' as const,
  backgroundColor: '#fff',
}

/** Field label */
export const labelStyle = {
  fontSize: fontSize.sm,
  color: TEXT,
  fontFamily: F,
  display: 'block',
  marginBottom: 6,
  fontWeight: 500,
}

// ─── BUTTONS ─────────────────────────────────────────────────────────────────

/** Primary action button (Save / Submit) */
export const btnPrimaryStyle = {
  height: 40,
  padding: '0 22px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: PRIMARY,
  color: '#fff',
  fontSize: fontSize.md,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
}

/** Secondary / cancel button */
export const btnSecondaryStyle = {
  height: 40,
  padding: '0 22px',
  borderRadius: 8,
  border: `1px solid ${BORDER}`,
  backgroundColor: '#fff',
  color: TEXT,
  fontSize: fontSize.md,
  cursor: 'pointer',
  fontFamily: F,
}

// ─── CARD / CONTAINER ────────────────────────────────────────────────────────

/** Standard white card */
export const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: 12,
  border: `1px solid ${BORDER}`,
  padding: 30,
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

export const SIDEBAR_W      = 250
export const MENU_ITEM_H    = 56   // original 54 + 2
export const MENU_FONT_SIZE = 17   // original 15 + 2
