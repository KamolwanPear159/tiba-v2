'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import { adminService } from '@/lib/api/services/admin.service';

const F = 'var(--font-thai)';

interface FormState {
  name: string;
  position: string;
}

const INITIAL_FORM: FormState = { name: '', position: '' };

export default function TutorCreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutate: createTutor, isPending } = useMutation({
    mutationFn: (formData: FormData) => adminService.createTutor(formData),
    onSuccess: () => router.push('/admin/tutors'),
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message ?? err?.response?.data?.message ?? err?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      setSubmitError(msg);
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.name.trim()) newErrors.name = 'กรุณาระบุชื่อผู้สอน';
    if (!form.position.trim()) newErrors.position = 'กรุณาระบุตำแหน่ง';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setSubmitError(null);
    if (!validate()) return;
    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('position', form.position.trim());
    fd.append('is_active', 'true');
    if (photoFile) fd.append('photo', photoFile);
    createTutor(fd);
  };

  const fieldStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '11px 14px',
    border: `1.5px solid ${hasError ? '#f44336' : '#ddd'}`,
    borderRadius: 8,
    fontSize: 17,
    fontFamily: F,
    color: '#333',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: F }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => router.back()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 40, border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer' }}
            >
              <ArrowLeft size={18} color="#444" />
            </button>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a1a', fontFamily: F }}>สร้างผู้สอน</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => router.push('/admin/tutors')}
              style={{ padding: '10px 22px', border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16, fontFamily: F, color: '#444' }}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              style={{ padding: '10px 26px', border: 'none', borderRadius: 8, background: '#1f4488', color: '#fff', cursor: isPending ? 'not-allowed' : 'pointer', fontSize: 16, fontFamily: F, fontWeight: 600, opacity: isPending ? 0.75 : 1 }}
            >
              {isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>

        {/* Submit error banner */}
        {submitError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fff5f5', border: '1.5px solid #fecaca', borderRadius: 8, marginBottom: 24, color: '#c0392b', fontSize: 16, fontFamily: F }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {submitError}
          </div>
        )}

        {/* Image upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', height: 220,
            background: photoPreview ? 'transparent' : '#ede9fe',
            borderRadius: 12,
            border: photoPreview ? 'none' : '2px dashed #c4b5fd',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginBottom: 28, overflow: 'hidden',
            position: 'relative',
          }}
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Upload size={32} color="#8b5cf6" style={{ display: 'block', margin: '0 auto 10px' }} />
              <p style={{ margin: 0, fontSize: 17, color: '#7c3aed', fontWeight: 600, fontFamily: F }}>อัปโหลดรูปภาพ</p>
              <p style={{ margin: '6px 0 0', fontSize: 15, color: '#a78bfa', fontFamily: F }}>คลิกเพื่อเลือกไฟล์ภาพ</p>
            </div>
          )}
          {photoPreview && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
            >
              <Upload size={28} color="#fff" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePhotoChange}
        />

        {/* Form grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
          {/* ชื่อ */}
          <div>
            <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#444', marginBottom: 7, fontFamily: F }}>
              ชื่อ <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              value={form.name}
              onChange={e => { setForm(prev => ({ ...prev, name: e.target.value })); setErrors(prev => ({ ...prev, name: undefined })); }}
              placeholder="ระบุชื่อผู้สอน"
              style={fieldStyle(!!errors.name)}
            />
            {errors.name && <p style={{ margin: '5px 0 0', fontSize: 14, color: '#f44336', fontFamily: F }}>{errors.name}</p>}
          </div>

          {/* ตำแหน่ง */}
          <div>
            <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#444', marginBottom: 7, fontFamily: F }}>
              ตำแหน่ง <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              value={form.position}
              onChange={e => { setForm(prev => ({ ...prev, position: e.target.value })); setErrors(prev => ({ ...prev, position: undefined })); }}
              placeholder="ระบุตำแหน่ง"
              style={fieldStyle(!!errors.position)}
            />
            {errors.position && <p style={{ margin: '5px 0 0', fontSize: 14, color: '#f44336', fontFamily: F }}>{errors.position}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
