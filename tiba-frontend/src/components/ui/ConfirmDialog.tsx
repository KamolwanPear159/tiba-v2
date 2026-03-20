'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal, { ModalBody, ModalFooter } from './Modal'
import Button from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'primary'
  isLoading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'ยืนยันการดำเนินการ',
  message = 'คุณแน่ใจหรือไม่ที่จะดำเนินการนี้?',
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalBody>
        <div className="flex flex-col items-center text-center gap-3">
          <div
            className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${variant === 'danger' ? 'bg-red-100' : variant === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}
            `}
          >
            <AlertTriangle
              className={`h-6 w-6 ${
                variant === 'danger'
                  ? 'text-red-600'
                  : variant === 'warning'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              }`}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-main">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
