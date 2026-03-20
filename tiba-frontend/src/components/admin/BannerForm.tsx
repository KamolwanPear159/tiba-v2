'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { UploadCloud, X, Eye } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ModalBody, ModalFooter } from '@/components/ui/Modal'
import { getImageUrl } from '@/lib/utils/format'
import type { Banner } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/pdf']

type FormData = {
  link_url: string
  display_order: number
  is_active: boolean
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BannerFormProps {
  banner?: Banner | null
  onSubmit: (data: FormData, image: File | null) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BannerForm({ banner, onSubmit, onCancel, isLoading }: BannerFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      link_url: '',
      display_order: 1,
      is_active: true,
    },
  })

  // Pre-fill when editing
  useEffect(() => {
    if (banner) {
      reset({
        link_url: banner.link_url || '',
        display_order: banner.display_order,
        is_active: banner.is_active,
      })
      if (banner.image_url) {
        setImagePreview(getImageUrl(banner.image_url) ?? null)
      }
    }
  }, [banner, reset])

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  // ─── Image picker ──────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageError('')

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('ไฟล์ต้องเป็น PDF, JPG หรือ PNG เท่านั้น')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setImageError('ขนาดไฟล์ต้องไม่เกิน 2 MB')
      return
    }

    setImageFile(file)
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleFormSubmit = async (data: FormData) => {
    if (!banner && !imageFile) {
      setImageError('กรุณาอัปโหลดรูปภาพ')
      return
    }
    await onSubmit({ ...data, display_order: Number(data.display_order) }, imageFile)
  }

  // ─── Preview content ───────────────────────────────────────────────────────

  const previewSrc = imagePreview || (banner?.image_url ? getImageUrl(banner.image_url) : null)

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <ModalBody className="space-y-5">

          {/* ── Image Upload ── */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              รูปภาพแบนเนอร์ {!banner && <span className="text-red-500">*</span>}
            </label>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-xl overflow-hidden cursor-pointer transition
                ${imageError ? 'border-2 border-dashed border-red-400 bg-red-50' : 'border-2 border-dashed border-gray-300 hover:border-[#1f4488] hover:bg-[#1f4488]/5'}`}
              style={{ minHeight: 160 }}
            >
              {previewSrc ? (
                <div className="relative w-full" style={{ height: 160 }}>
                  <Image
                    src={previewSrc}
                    alt="banner preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-sm font-medium">คลิกเพื่อเปลี่ยนรูป</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <UploadCloud className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#1f4488]">คลิกเพื่ออัปโหลดรูปภาพ</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG · ขนาดไม่เกิน 2 MB · แนะนำ 1280×640px</p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {imageError && <p className="text-xs text-red-500">{imageError}</p>}

            {/* Image action buttons */}
            {previewSrc && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Eye className="h-3.5 w-3.5" />}
                  onClick={() => setShowPreview(true)}
                >
                  ดูตัวอย่าง
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<X className="h-3.5 w-3.5" />}
                  onClick={clearImage}
                >
                  ลบรูป
                </Button>
              </div>
            )}
          </div>

          {/* ── Link URL ── */}
          <Input
            label="URL ปลายทาง (ไม่บังคับ)"
            placeholder="https://..."
            error={errors.link_url?.message}
            {...register('link_url', {
              validate: (v) =>
                !v || v.startsWith('http://') || v.startsWith('https://')
                  ? true
                  : 'รูปแบบ URL ต้องขึ้นต้นด้วย http:// หรือ https://',
            })}
          />

          {/* ── Display Order ── */}
          <Input
            label="ลำดับการแสดงผล"
            type="number"
            required
            error={errors.display_order?.message}
            {...register('display_order', {
              required: 'กรุณาระบุลำดับ',
              min: { value: 1, message: 'ลำดับต้องมากกว่า 0' },
            })}
          />

          {/* ── Active toggle ── */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">สถานะการแสดงผล</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register('is_active')} />
              <div className="w-[44px] h-[24px] bg-gray-300 rounded-full peer peer-checked:bg-[#22c55e] transition-colors duration-200 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-transform after:duration-200 peer-checked:after:translate-x-[20px]" />
            </label>
          </div>

        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {banner ? 'บันทึกการแก้ไข' : 'สร้างแบนเนอร์'}
          </Button>
        </ModalFooter>
      </form>

      {/* ── Preview Modal ── */}
      {showPreview && previewSrc && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-[90vw] max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-4 -right-4 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={previewSrc}
              alt="Banner preview"
              className="rounded-xl object-contain max-h-[75vh]"
              style={{ maxWidth: '90vw' }}
            />
          </div>
        </div>
      )}
    </>
  )
}
