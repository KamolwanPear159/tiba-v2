'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'
import BannerForm from '@/components/admin/BannerForm'
import { contentService } from '@/lib/api/services/content.service'
import { getImageUrl, formatDate } from '@/lib/utils/format'
import type { Banner } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormPayload = {
  link_url?: string
  display_order: number
  is_active: boolean
}

// ─── Row Dropdown ─────────────────────────────────────────────────────────────

function ActionDropdown({
  banner,
  onPreview,
  onEdit,
  onToggle,
  onDelete,
}: {
  banner: Banner
  onPreview: () => void
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const item = (icon: React.ReactNode, label: string, action: () => void, danger = false) => (
    <button
      onClick={() => { action(); setOpen(false) }}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition
        ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div ref={ref} className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        aria-label="การจัดการ"
      >
        <MoreVertical className="h-4 w-4" />
        <span className="ml-1 text-xs">การจัดการ</span>
      </Button>

      {open && (
        <div className="absolute right-0 z-[999] mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {item(<Eye className="h-4 w-4" />, 'ดูรายการ', onPreview)}
          {item(<Eye className="h-4 w-4 text-blue-500" />, 'ดูตัวอย่าง', onPreview)}
          {item(<Pencil className="h-4 w-4" />, 'แก้ไข', onEdit)}
          {item(<Trash2 className="h-4 w-4" />, 'ลบ', onDelete, true)}
        </div>
      )}
    </div>
  )
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ active, onChange, disabled }: { active: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-[24px] w-[44px] flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50
        ${active ? 'bg-[#22c55e]' : 'bg-gray-300'}`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] rounded-full bg-white shadow transform transition-transform duration-200
          ${active ? 'translate-x-[22px]' : 'translate-x-[3px]'}`}
      />
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminBannersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Banner | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null)
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null)

  // ─── Queries ──────────────────────────────────────────────────────────────

  const { data: bannersRaw, isLoading, isError } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => contentService.getBanners(),
  })
  const banners: Banner[] = bannersRaw ?? []

  // ─── Mutations ────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async ({ data, image, id }: { data: FormPayload; image: File | null; id?: string }) => {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)))
      if (image) fd.append('image', image)
      return id
        ? contentService.updateBanner(id, fd)
        : contentService.createBanner(fd)
    },
    onSuccess: () => {
      toast.success(editItem ? 'แก้ไขแบนเนอร์สำเร็จ' : 'สร้างแบนเนอร์สำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-banners'] })
      setIsFormOpen(false)
      setEditItem(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      contentService.toggleBannerStatus(id, active),
    onSuccess: (updated) => {
      toast.success(`${updated.is_active ? 'เปิด' : 'ปิด'}การแสดงผลแล้ว`)
      qc.invalidateQueries({ queryKey: ['admin-banners'] })
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteBanner(id),
    onSuccess: () => {
      toast.success('ลบแบนเนอร์สำเร็จ')
      qc.invalidateQueries({ queryKey: ['admin-banners'] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const openAdd = () => { setEditItem(null); setIsFormOpen(true) }
  const openEdit = (b: Banner) => { setEditItem(b); setIsFormOpen(true) }
  const closeForm = () => { setIsFormOpen(false); setEditItem(null) }

  const filtered = search
    ? banners.filter(
        (b) =>
          b.link_url?.toLowerCase().includes(search.toLowerCase()) ||
          String(b.display_order).includes(search)
      )
    : banners

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">จัดการแบนเนอร์</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {banners.length} รายการทั้งหมด
          </p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          + สร้างแบนเนอร์
        </Button>
      </div>

      {/* ── Search ── */}
      <div className="relative w-72">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหา URL หรือลำดับ..."
          className="w-full h-9 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/25"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        {isLoading ? (
          /* Loading skeleton */
          <div className="divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-28 h-14 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-gray-500">
            <p className="text-sm">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
            <button
              onClick={() => qc.invalidateQueries({ queryKey: ['admin-banners'] })}
              className="mt-3 text-sm text-primary hover:underline"
            >
              ลองใหม่
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-sm">{search ? 'ไม่พบแบนเนอร์ที่ค้นหา' : 'ยังไม่มีแบนเนอร์ คลิก "สร้างแบนเนอร์" เพื่อเพิ่ม'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-[13px] font-medium text-gray-500">รูป</th>
                <th className="text-left px-6 py-3 text-[13px] font-medium text-gray-500">หัวข้อหลัก</th>
                <th className="text-left px-6 py-3 text-[13px] font-medium text-gray-500">หัวข้อรอง</th>
                <th className="text-left px-6 py-3 text-[13px] font-medium text-gray-500">วันที่สร้าง</th>
                <th className="text-left px-6 py-3 text-[13px] font-medium text-gray-500">ผู้สร้าง</th>
                <th className="text-left px-6 py-3 text-[13px] font-medium text-gray-500">สถานะ</th>
                <th className="text-left px-6 py-3 text-[13px] font-medium text-gray-500">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((banner) => (
                <tr key={banner.banner_id} className="hover:bg-gray-50/40 transition">

                  {/* รูป */}
                  <td className="px-6 py-4">
                    <div className="relative w-[112px] h-[64px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {banner.image_url ? (
                        <Image
                          src={getImageUrl(banner.image_url) ?? banner.image_url}
                          alt="banner"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">ไม่มีรูป</div>
                      )}
                    </div>
                  </td>

                  {/* หัวข้อหลัก */}
                  <td className="px-6 py-4">
                    <span className="text-[14px] text-gray-700 truncate max-w-[180px] block">
                      {banner.link_url || <span className="text-gray-300">—</span>}
                    </span>
                  </td>

                  {/* หัวข้อรอง */}
                  <td className="px-6 py-4">
                    <span className="text-[14px] text-gray-400">
                      ลำดับ {banner.display_order}
                    </span>
                  </td>

                  {/* วันที่สร้าง */}
                  <td className="px-6 py-4">
                    <span className="text-[14px] text-gray-500">{formatDate(banner.created_at)}</span>
                  </td>

                  {/* ผู้สร้าง */}
                  <td className="px-6 py-4">
                    <span className="text-[14px] text-gray-500">Admin</span>
                  </td>

                  {/* สถานะ — toggle switch */}
                  <td className="px-6 py-4">
                    <ToggleSwitch
                      active={banner.is_active}
                      onChange={() => toggleMutation.mutate({ id: banner.banner_id, active: !banner.is_active })}
                      disabled={toggleMutation.isPending}
                    />
                  </td>

                  {/* การจัดการ */}
                  <td className="px-6 py-4">
                    <ActionDropdown
                      banner={banner}
                      onPreview={() => setPreviewBanner(banner)}
                      onEdit={() => openEdit(banner)}
                      onToggle={() => toggleMutation.mutate({ id: banner.banner_id, active: !banner.is_active })}
                      onDelete={() => setDeleteTarget(banner)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editItem ? 'แก้ไขแบนเนอร์' : 'สร้างแบนเนอร์'}
      >
        <BannerForm
          banner={editItem}
          onSubmit={async (data, image) => {
            await saveMutation.mutateAsync({
              data,
              image,
              id: editItem?.banner_id,
            })
          }}
          onCancel={closeForm}
          isLoading={saveMutation.isPending}
        />
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.banner_id)}
        title="ลบแบนเนอร์"
        message={`คุณต้องการลบแบนเนอร์นี้หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้`}
        isLoading={deleteMutation.isPending}
      />

      {/* ── Preview Lightbox ── */}
      {previewBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewBanner(null)}
        >
          <div className="relative max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewBanner(null)}
              className="absolute -top-4 -right-4 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-700 hover:text-gray-900"
            >
              ✕
            </button>
            {previewBanner.image_url ? (
              <img
                src={getImageUrl(previewBanner.image_url)}
                alt="Banner preview"
                className="rounded-2xl object-contain"
                style={{ maxWidth: '90vw', maxHeight: '80vh' }}
              />
            ) : (
              <div className="w-[800px] h-[400px] bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                ไม่มีรูปภาพ
              </div>
            )}
            {previewBanner.link_url && (
              <p className="text-center text-white/70 text-sm mt-3">{previewBanner.link_url}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
