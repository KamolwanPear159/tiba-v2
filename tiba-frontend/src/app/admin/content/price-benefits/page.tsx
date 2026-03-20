'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { contentService } from '@/lib/api/services/content.service'
import { formatCurrency } from '@/lib/utils/format'
import type { PricePlan, PriceCondition } from '@/types'

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

const mockPlans: PricePlan[] = [
  {
    plan_id: 'plan-1', plan_type: 'general', label: 'สมาชิกทั่วไป', annual_fee: 2000,
    conditions: [
      { condition_id: 'c1', plan_id: 'plan-1', condition_text: 'เข้าร่วมหลักสูตรอบรมในราคาพิเศษ', display_order: 1 },
      { condition_id: 'c2', plan_id: 'plan-1', condition_text: 'รับข่าวสารและเอกสารวิชาการ', display_order: 2 },
    ],
  },
  {
    plan_id: 'plan-2', plan_type: 'association_corporate', label: 'สมาชิกสมาคม (นิติบุคคล)', annual_fee: 5000,
    conditions: [
      { condition_id: 'c4', plan_id: 'plan-2', condition_text: 'ส่งพนักงานเข้าอบรมได้ไม่จำกัด', display_order: 1 },
      { condition_id: 'c5', plan_id: 'plan-2', condition_text: 'ราคาอบรมพิเศษสำหรับสมาชิกสมาคม', display_order: 2 },
    ],
  },
  {
    plan_id: 'plan-3', plan_type: 'association_individual', label: 'สมาชิกสมาคม (บุคคล)', annual_fee: 3000,
    conditions: [
      { condition_id: 'c8', plan_id: 'plan-3', condition_text: 'ราคาอบรมพิเศษสำหรับสมาชิกสมาคม', display_order: 1 },
    ],
  },
]

interface PlanState {
  label: string
  annual_fee: number
  conditions: { id: string; text: string; isNew?: boolean }[]
}

function PlanCard({ plan }: { plan: PricePlan }) {
  const qc = useQueryClient()
  const [state, setState] = useState<PlanState>({
    label: plan.label,
    annual_fee: plan.annual_fee,
    conditions: plan.conditions.map(c => ({ id: c.condition_id, text: c.condition_text })),
  })

  const saveMutation = useMutation({
    mutationFn: () => contentService.updatePlan(plan.plan_id, { label: state.label, annual_fee: state.annual_fee }),
    onSuccess: () => { toast.success('บันทึกสำเร็จ'); qc.invalidateQueries({ queryKey: ['admin-price-plans'] }) },
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  })

  const addCondition = () => {
    if (state.conditions.length >= 5) { toast.error('เพิ่มได้สูงสุด 5 เงื่อนไข'); return }
    setState(prev => ({ ...prev, conditions: [...prev.conditions, { id: `new-${Date.now()}`, text: '', isNew: true }] }))
  }

  const removeCondition = (id: string) => {
    setState(prev => ({ ...prev, conditions: prev.conditions.filter(c => c.id !== id) }))
  }

  const updateCondition = (id: string, text: string) => {
    setState(prev => ({ ...prev, conditions: prev.conditions.map(c => c.id === id ? { ...c, text } : c) }))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-primary px-5 py-4">
        <input
          value={state.label}
          onChange={(e) => setState(prev => ({ ...prev, label: e.target.value }))}
          className="text-white font-semibold text-base bg-transparent border-b border-white/30 focus:border-white focus:outline-none w-full pb-0.5"
        />
      </div>

      <div className="p-5 space-y-4">
        {/* Fee */}
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">ค่าธรรมเนียมต่อปี</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              value={state.annual_fee}
              onChange={(e) => setState(prev => ({ ...prev, annual_fee: Number(e.target.value) }))}
              className="w-32 px-3 py-1.5 text-lg font-bold text-accent border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
            />
            <span className="text-sm text-gray-400">บาท/ปี</span>
          </div>
        </div>

        {/* Conditions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">เงื่อนไข</label>
            <button onClick={addCondition} disabled={state.conditions.length >= 5} className="flex items-center gap-1 text-xs text-primary hover:text-primary-light disabled:opacity-40">
              <Plus className="h-3.5 w-3.5" />เพิ่ม
            </button>
          </div>
          <div className="space-y-2">
            {state.conditions.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  value={c.text}
                  onChange={(e) => updateCondition(c.id, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="กรอกเงื่อนไข..."
                />
                <button onClick={() => removeCondition(c.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light disabled:opacity-60 transition-colors"
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          บันทึก
        </button>
      </div>
    </div>
  )
}

export default function AdminPriceBenefitsPage() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-price-plans'],
    queryFn: () => useMock ? mockPlans : contentService.getPriceBenefits(),
  })

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-base font-semibold text-text-main">ราคาและสิทธิประโยชน์</h2>
        <p className="text-sm text-gray-500 mt-1">จัดการแผนสมาชิกและเงื่อนไขสิทธิประโยชน์</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(plans || mockPlans).map((plan) => (
          <PlanCard key={plan.plan_id} plan={plan} />
        ))}
      </div>
    </div>
  )
}
