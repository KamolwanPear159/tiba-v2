'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input, { Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ModalBody, ModalFooter } from '@/components/ui/Modal'
import type { CourseSession } from '@/types'

const schema = z.object({
  session_label: z.string().min(1, 'กรุณากรอกชื่อรุ่น'),
  location: z.string().min(1, 'กรุณากรอกสถานที่'),
  seat_capacity: z.coerce.number().min(1, 'จำนวนที่นั่งต้องมากกว่า 0'),
  enrollment_start: z.string().min(1, 'กรุณาเลือกวันเริ่มรับสมัคร'),
  enrollment_end: z.string().min(1, 'กรุณาเลือกวันสิ้นสุดรับสมัคร'),
  training_start: z.string().min(1, 'กรุณาเลือกวันเริ่มอบรม'),
  training_end: z.string().min(1, 'กรุณาเลือกวันสิ้นสุดอบรม'),
})

type FormData = z.infer<typeof schema>

interface SessionFormProps {
  session?: CourseSession | null
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

function toDatetimeLocal(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toDateInput(iso: string) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

export default function SessionForm({ session, onSubmit, onCancel, isLoading }: SessionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      session_label: '',
      location: '',
      seat_capacity: 30,
      enrollment_start: '',
      enrollment_end: '',
      training_start: '',
      training_end: '',
    },
  })

  useEffect(() => {
    if (session) {
      reset({
        session_label: session.session_label,
        location: session.location,
        seat_capacity: session.seat_capacity,
        enrollment_start: toDatetimeLocal(session.enrollment_start),
        enrollment_end: toDatetimeLocal(session.enrollment_end),
        training_start: toDateInput(session.training_start),
        training_end: toDateInput(session.training_end),
      })
    }
  }, [session, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ModalBody className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="ชื่อรุ่น/รอบการอบรม"
              placeholder="เช่น รุ่นที่ 1/2567"
              required
              error={errors.session_label?.message}
              {...register('session_label')}
            />
          </div>

          <div className="col-span-2">
            <Input
              label="สถานที่อบรม"
              placeholder="เช่น โรงแรม หรือ Online (Zoom)"
              required
              error={errors.location?.message}
              {...register('location')}
            />
          </div>

          <Input
            label="จำนวนที่นั่ง"
            type="number"
            required
            error={errors.seat_capacity?.message}
            {...register('seat_capacity')}
          />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            ช่วงเวลารับสมัคร
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="วันเริ่มรับสมัคร"
              type="datetime-local"
              required
              error={errors.enrollment_start?.message}
              {...register('enrollment_start')}
            />
            <Input
              label="วันสิ้นสุดรับสมัคร"
              type="datetime-local"
              required
              error={errors.enrollment_end?.message}
              {...register('enrollment_end')}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            วันอบรม
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="วันเริ่มอบรม"
              type="date"
              required
              error={errors.training_start?.message}
              {...register('training_start')}
            />
            <Input
              label="วันสิ้นสุดอบรม"
              type="date"
              required
              error={errors.training_end?.message}
              {...register('training_end')}
            />
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {session ? 'บันทึกการแก้ไข' : 'เพิ่มรุ่น'}
        </Button>
      </ModalFooter>
    </form>
  )
}
