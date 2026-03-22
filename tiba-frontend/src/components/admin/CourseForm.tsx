'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input, { Textarea, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/ui/FileUpload'
import { ModalBody, ModalFooter } from '@/components/ui/Modal'
import type { Course } from '@/types'

const schema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อหลักสูตร'),
  description: z.string().min(1, 'กรุณากรอกคำอธิบาย'),
  format: z.enum(['onsite', 'online']),
  online_link: z.string().optional(),
  price_type: z.enum(['single', 'dual']),
  price_general: z.coerce.number().min(0, 'ราคาต้องไม่ติดลบ'),
  price_association: z.coerce.number().optional(),
  total_hours: z.coerce.number().int().min(0).optional(),
  is_published: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface CourseFormProps {
  course?: Course | null
  onSubmit: (data: FormData, thumbnail: File | null) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function CourseForm({ course, onSubmit, onCancel, isLoading }: CourseFormProps) {
  const [thumbnail, setThumbnail] = React.useState<File | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      format: 'onsite',
      price_type: 'single',
      price_general: 0,
      is_published: false,
    },
  })

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description,
        format: course.format,
        online_link: course.online_link || '',
        price_type: course.price_type,
        price_general: course.price_general,
        price_association: course.price_association,
        total_hours: course.total_hours,
        is_published: course.is_published,
      })
    }
  }, [course, reset])

  const format = watch('format')
  const priceType = watch('price_type')

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data, thumbnail)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <ModalBody className="space-y-4">
        <Input
          label="ชื่อหลักสูตร"
          required
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="คำอธิบายหลักสูตร"
          rows={3}
          required
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="รูปแบบการอบรม"
            required
            options={[
              { value: 'onsite', label: 'ออนไซต์ (Onsite)' },
              { value: 'online', label: 'ออนไลน์ (Online)' },
            ]}
            error={errors.format?.message}
            {...register('format')}
          />

          <Select
            label="ประเภทราคา"
            required
            options={[
              { value: 'single', label: 'ราคาเดียว' },
              { value: 'dual', label: 'แยกราคา (ทั่วไป/สมาคม)' },
            ]}
            error={errors.price_type?.message}
            {...register('price_type')}
          />
        </div>

        {format === 'online' && (
          <Input
            label="ลิงก์การอบรมออนไลน์"
            placeholder="https://zoom.us/j/..."
            error={errors.online_link?.message}
            {...register('online_link')}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={priceType === 'dual' ? 'ราคาทั่วไป (บาท)' : 'ราคา (บาท)'}
            type="number"
            required
            error={errors.price_general?.message}
            {...register('price_general')}
          />
          {priceType === 'dual' && (
            <Input
              label="ราคาสมาชิกสมาคม (บาท)"
              type="number"
              error={errors.price_association?.message}
              {...register('price_association')}
            />
          )}
        </div>

        <Input
          label="จำนวนชั่วโมง"
          type="number"
          placeholder="เช่น 50"
          hint="จำนวนชั่วโมงอบรมทั้งหมด"
          error={errors.total_hours?.message}
          {...register('total_hours')}
        />

        <FileUpload
          label="รูปหน้าปก"
          accept="image/*"
          onChange={setThumbnail}
          currentUrl={course?.thumbnail_url}
          hint="PNG, JPG ขนาดไม่เกิน 5MB"
        />

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            id="is_published"
            className="w-4 h-4 accent-primary"
            {...register('is_published')}
          />
          <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
            เผยแพร่หลักสูตรนี้
          </label>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {course ? 'บันทึกการแก้ไข' : 'เพิ่มหลักสูตร'}
        </Button>
      </ModalFooter>
    </form>
  )
}
