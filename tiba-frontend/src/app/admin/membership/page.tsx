'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, X, Check } from 'lucide-react';
import { adminService } from '@/lib/api/services/admin.service';

const F = 'var(--font-thai)';

interface Benefit {
  id?: number;
  text: string;
}

interface MembershipPlan {
  id: number;
  type: 'general' | 'association';
  title: string;
  subtitle?: string;
  price?: number;
  description?: string;
  benefits: Benefit[];
}

const FALLBACK_PLANS: MembershipPlan[] = [
  {
    id: 1,
    type: 'general',
    title: 'สมาชิกทั่วไป',
    subtitle: 'สมัครฟรี',
    description: 'เหมาะสำหรับบุคคลทั่วไปที่สนใจการอัพเดตข่าวสาร',
    benefits: [
      { id: 1, text: 'เข้าถึงข่าวสารและบทความทั่วไป' },
      { id: 2, text: 'รับอีเมลจดหมายข่าว' },
      { id: 3, text: 'เข้าร่วมกิจกรรมสาธารณะ' },
    ],
  },
  {
    id: 2,
    type: 'association',
    title: 'สมาชิกสมาคม',
    price: 20000,
    benefits: [
      { id: 1, text: 'สิทธิ์เข้าถึงเนื้อหาพิเศษทั้งหมด' },
      { id: 2, text: 'ส่วนลดค่าลงทะเบียนอบรม' },
      { id: 3, text: 'เข้าร่วมประชุมสมาชิก' },
      { id: 4, text: 'ใบรับรองสมาชิกสมาคม' },
    ],
  },
];

interface EditModalProps {
  plan: MembershipPlan;
  onClose: () => void;
  onSave: (updated: MembershipPlan) => void;
  isSaving: boolean;
}

function EditModal({ plan, onClose, onSave, isSaving }: EditModalProps) {
  const [form, setForm] = useState<MembershipPlan>({ ...plan, benefits: plan.benefits.map(b => ({ ...b })) });

  const addBenefit = () => {
    if (form.benefits.length >= 5) return;
    setForm(prev => ({ ...prev, benefits: [...prev.benefits, { text: '' }] }));
  };

  const removeBenefit = (idx: number) => {
    setForm(prev => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== idx) }));
  };

  const updateBenefit = (idx: number, text: string) => {
    setForm(prev => ({
      ...prev,
      benefits: prev.benefits.map((b, i) => (i === idx ? { ...b, text } : b)),
    }));
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, fontFamily: F,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: '#fff', borderRadius: 12, padding: 34,
        width: 520, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a1a', fontFamily: F }}>
            แก้ไข — {plan.title}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="#666" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#444', marginBottom: 6, fontFamily: F }}>ชื่อแผน</label>
            <input
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 17, fontFamily: F, boxSizing: 'border-box' }}
            />
          </div>

          {plan.type === 'general' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#444', marginBottom: 6, fontFamily: F }}>แท็กราคา</label>
                <input
                  value={form.subtitle || ''}
                  onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 17, fontFamily: F, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#444', marginBottom: 6, fontFamily: F }}>คำอธิบาย</label>
                <textarea
                  value={form.description || ''}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 17, fontFamily: F, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </>
          )}

          {plan.type === 'association' && (
            <div>
              <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#444', marginBottom: 6, fontFamily: F }}>ราคา (บาท/ปี)</label>
              <input
                type="number"
                value={form.price ?? ''}
                onChange={e => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 17, fontFamily: F, boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 16, fontWeight: 600, color: '#444', fontFamily: F }}>สิทธิประโยชน์ ({form.benefits.length}/5)</label>
              {form.benefits.length < 5 && (
                <button
                  onClick={addBenefit}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1.5px dashed #bbb', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 15, color: '#666', fontFamily: F }}
                >
                  <Plus size={14} /> เพิ่ม
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.benefits.map((b, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} color="#22c55e" style={{ flexShrink: 0 }} />
                  <input
                    value={b.text}
                    onChange={e => updateBenefit(idx, e.target.value)}
                    placeholder="ระบุสิทธิประโยชน์..."
                    style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 7, fontSize: 16, fontFamily: F }}
                  />
                  <button onClick={() => removeBenefit(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#f44336' }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28 }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 24px', border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 17, fontFamily: F, color: '#444' }}
          >
            ยกเลิก
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={isSaving}
            style={{ padding: '10px 24px', border: 'none', borderRadius: 8, background: '#1f4488', color: '#fff', cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: 17, fontFamily: F, opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', flex: 1 }}>
      <div style={{ height: 120, background: '#e0e0e0', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ padding: 26, background: '#fff' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 16, background: '#f0f0f0', borderRadius: 8, marginBottom: 12, width: i === 3 ? '60%' : '100%' }} />
        ))}
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: MembershipPlan;
  headerGradient: string;
  onEdit: () => void;
}

function PlanCard({ plan, headerGradient, onEdit }: PlanCardProps) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.10)', flex: 1 }}>
      <div style={{ background: headerGradient, padding: '28px 24px 24px', position: 'relative' }}>
        <button
          onClick={onEdit}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
            padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="แก้ไข"
        >
          <Pencil size={16} color="#fff" />
        </button>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: F }}>{plan.title}</h2>
        {plan.subtitle && (
          <span style={{
            display: 'inline-block', marginTop: 8, backgroundColor: 'rgba(255,255,255,0.25)',
            color: '#fff', fontSize: 15, fontWeight: 600, padding: '3px 12px', borderRadius: 20, fontFamily: F,
          }}>
            {plan.subtitle}
          </span>
        )}
        {plan.price !== undefined && (
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: F }}>
              ฿{plan.price.toLocaleString()}
            </span>
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginLeft: 6, fontFamily: F }}>/ปี</span>
          </div>
        )}
      </div>
      <div style={{ padding: '26px', backgroundColor: '#fff' }}>
        {plan.description && (
          <p style={{ margin: '0 0 20px', fontSize: 16, color: '#555', lineHeight: 1.7, fontFamily: F }}>{plan.description}</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plan.benefits.map((b, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#e8f5e9',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
              }}>
                <Check size={13} color="#22c55e" />
              </div>
              <span style={{ fontSize: 16, color: '#333', lineHeight: 1.6, fontFamily: F }}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MembershipSettingPage() {
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  const { data: plans, isLoading, isError } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: adminService.getMembershipPlans,
    retry: 1,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayPlans: MembershipPlan[] = isError || !plans ? FALLBACK_PLANS : (plans as any);

  const { mutate: updatePlan, isPending: isSaving } = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (updated: MembershipPlan) => adminService.updateMembershipPlan(String(updated.id), updated as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      setEditingPlan(null);
    },
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: F }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#1a1a1a', fontFamily: F }}>ตั้งค่าเนื้อหาสมาชิก</h1>
          <p style={{ margin: '6px 0 0', fontSize: 16, color: '#888', fontFamily: F }}>จัดการแผนสมาชิกและสิทธิประโยชน์</p>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              {displayPlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  headerGradient={
                    plan.type === 'general'
                      ? 'linear-gradient(200deg, #126f38 0%, #51ba7c 100%)'
                      : 'linear-gradient(200deg, #1f4488 0%, #6f8aba 100%)'
                  }
                  onEdit={() => setEditingPlan(plan)}
                />
              ))}
            </>
          )}
        </div>

        {isError && (
          <div style={{ marginTop: 16, padding: '10px 16px', background: '#fff3cd', borderRadius: 8, fontSize: 15, color: '#856404', fontFamily: F }}>
            ไม่สามารถโหลดข้อมูลจาก API ได้ — แสดงข้อมูลสำรอง
          </div>
        )}
      </div>

      {editingPlan && (
        <EditModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={updated => updatePlan(updated)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
