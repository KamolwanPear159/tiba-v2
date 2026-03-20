import React from 'react'
import type { Partner } from '@/types'
import { getImageUrl } from '@/lib/utils/format'

interface PartnerLogoProps {
  partner: Partner
}

export default function PartnerLogo({ partner }: PartnerLogoProps) {
  const imgUrl = getImageUrl(partner.logo_url)

  const content = (
    <div className="flex items-center justify-center h-16 w-full px-4 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={partner.name}
          className="h-10 w-auto max-w-[120px] object-contain"
        />
      ) : (
        <span className="text-sm font-medium text-gray-500 text-center">{partner.name}</span>
      )}
    </div>
  )

  if (partner.website_url) {
    return (
      <a href={partner.website_url} target="_blank" rel="noopener noreferrer" title={partner.name}>
        {content}
      </a>
    )
  }

  return <div title={partner.name}>{content}</div>
}
