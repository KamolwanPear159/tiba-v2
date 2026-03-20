import React from 'react'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import type { Article } from '@/types'
import { formatDateShort, truncate, getImageUrl } from '@/lib/utils/format'

interface NewsCardProps {
  article: Article
}

export default function NewsCard({ article }: NewsCardProps) {
  const imgUrl = getImageUrl(article.thumbnail_url)

  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        {/* Image */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
          {imgUrl ? (
            <img src={imgUrl} alt={article.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-300 text-3xl font-bold">
                {article.article_type === 'news' ? 'N' : 'B'}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span
              className={`
                inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                ${article.article_type === 'news' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}
              `}
            >
              {article.article_type === 'news' ? 'ข่าวสาร' : 'บทความ'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-text-main text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {truncate(article.excerpt, 100)}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDateShort(article.published_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
