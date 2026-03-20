'use client'

import React from 'react'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface ContentTableProps<T> {
  title: string
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  searchValue?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  onAdd?: () => void
  addLabel?: string
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  rowKey: (row: T) => string
  page?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  showSearch?: boolean
  extraActions?: React.ReactNode
}

export default function ContentTable<T>({
  title,
  columns,
  data,
  isLoading = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'ค้นหา...',
  onAdd,
  addLabel = 'เพิ่มใหม่',
  onEdit,
  onDelete,
  rowKey,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  showSearch = true,
  extraActions,
}: ContentTableProps<T>) {
  const actionColumn: Column<T> = {
    key: '__actions',
    header: 'จัดการ',
    className: 'w-24',
    render: (row) => (
      <div className="flex items-center gap-1">
        {onEdit && (
          <button
            onClick={() => onEdit(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
            title="แก้ไข"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="ลบ"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    ),
  }

  const allColumns = (onEdit || onDelete) ? [...columns, actionColumn] : columns

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-text-main">{title}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {extraActions}
            {showSearch && onSearchChange && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-48"
                />
              </div>
            )}
            {onAdd && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={onAdd}
              >
                {addLabel}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-1">
        <Table
          columns={allColumns}
          data={data}
          isLoading={isLoading}
          rowKey={rowKey}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="px-4 py-3 border-t border-gray-100">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}
