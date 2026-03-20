import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
}

const colorClasses = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-600' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', text: 'text-yellow-600' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-600' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-600' },
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  change,
  changeType = 'neutral',
}: StatsCardProps) {
  const colors = colorClasses[color]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-text-main mt-1">{value}</p>
          {change && (
            <p
              className={`text-xs mt-1 ${
                changeType === 'up'
                  ? 'text-green-600'
                  : changeType === 'down'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className={`${colors.bg} p-3 rounded-xl`}>
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
      </div>
    </div>
  )
}
