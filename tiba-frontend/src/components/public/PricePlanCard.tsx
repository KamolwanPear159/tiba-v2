import React from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import type { PricePlan } from '@/types'
import { formatCurrency } from '@/lib/utils/format'

interface PricePlanCardProps {
  plan: PricePlan
  isHighlighted?: boolean
}

export default function PricePlanCard({ plan, isHighlighted = false }: PricePlanCardProps) {
  // Card 1 (default) = green gradient, Card 2 (highlighted) = blue gradient
  const topGradient = isHighlighted
    ? 'linear-gradient(135deg, #1f4488 0%, #2d5fa6 100%)'
    : 'linear-gradient(135deg, #126f38 0%, #1a9b4e 100%)'

  const buttonBg = isHighlighted ? '#1f4488' : '#126f38'
  const buttonHoverBg = isHighlighted ? '#17376e' : '#0e5228'

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
    >
      {/* ── TOP — colored gradient section ── */}
      <div
        style={{
          background: topGradient,
          padding: '28px 28px 24px',
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.80)',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {plan.label}
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          <span
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1,
            }}
          >
            {formatCurrency(plan.annual_fee)}
          </span>
          <span
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.70)',
              paddingBottom: 6,
            }}
          >
            /ปี
          </span>
        </div>
      </div>

      {/* ── BOTTOM — white benefits section ── */}
      <div
        className="flex flex-col flex-1 bg-white"
        style={{ padding: '24px 28px 28px' }}
      >
        <ul style={{ flex: 1, marginBottom: 24 }}>
          {plan.conditions.map((condition) => (
            <li
              key={condition.condition_id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: isHighlighted ? 'rgba(31,68,136,0.12)' : 'rgba(18,111,56,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                <Check
                  style={{
                    width: 12,
                    height: 12,
                    color: isHighlighted ? '#1f4488' : '#126f38',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.70)',
                  lineHeight: 1.5,
                }}
              >
                {condition.condition_text}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href="/register"
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            padding: '13px 16px',
            borderRadius: 12,
            background: buttonBg,
            color: '#ffffff',
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = buttonHoverBg }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = buttonBg }}
        >
          สมัครสมาชิก
        </Link>
      </div>
    </div>
  )
}
