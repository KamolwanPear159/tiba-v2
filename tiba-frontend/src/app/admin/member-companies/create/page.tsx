'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { ChevronLeft, Plus, Trash2, Upload } from 'lucide-react'
import { adminService } from '@/lib/api/services/admin.service'

const F = 'var(--font-thai)'

const inputStyle: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 14px', borderRadius: 8,
  border: '1px solid #e5e7eb', fontSize: 16, color: '#374151',
  outline: 'none', fontFamily: F, boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = { fontSize: 15, fontWeight: 500, color: '#374151', marginBottom: 6, display: 'block', fontFamily: F }
const sectionTitle: React.CSSProperties = { fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 16, fontFamily: F }

interface Product { product_name: string; product_type: string; description: string }
interface Award { award_name: string; award_type: string; year: string; description: string }

export default function CreateMemberCompanyPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', company_type: '', phone: '', email: '', website_url: '', address: '', description: '',
  })
  const [products, setProducts] = useState<Product[]>([{ product_name: '', product_type: '', description: '' }])
  const [awards, setAwards] = useState<Award[]>([{ award_name: '', award_type: '', year: '', description: '' }])

  const mutation = useMutation({
    mutationFn: (fd: FormData) => adminService.createMemberCompany(fd),
    onSuccess: () => router.push('/admin/member-companies'),
    onError: () => setError('ไม่สามารถสร้างบริษัทสมาชิกได้ กรุณาลองใหม่'),
  })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('กรุณากรอกชื่อบริษัท'); return }
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (logoFile) fd.append('logo', logoFile)
    fd.append('products', JSON.stringify(products.filter(p => p.product_name)))
    fd.append('awards', JSON.stringify(awards.filter(a => a.award_name)))
    mutation.mutate(fd)
  }

  const addProduct = () => setProducts(p => [...p, { product_name: '', product_type: '', description: '' }])
  const removeProduct = (i: number) => setProducts(p => p.filter((_, idx) => idx !== i))
  const updateProduct = (i: number, key: keyof Product, val: string) =>
    setProducts(p => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const addAward = () => setAwards(a => [...a, { award_name: '', award_type: '', year: '', description: '' }])
  const removeAward = (i: number) => setAwards(a => a.filter((_, idx) => idx !== i))
  const updateAward = (i: number, key: keyof Award, val: string) =>
    setAwards(a => a.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  return (
    <div style={{ fontFamily: F, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280', fontFamily: F }}>
          <ChevronLeft size={18} /> ย้อนกลับ
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: F }}>ยกเลิก</button>
          <button onClick={handleSubmit} disabled={mutation.isPending}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', backgroundColor: '#1f4488', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
            {mutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>

      {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 15, color: '#ef4444', fontFamily: F }}>{error}</div>}

      {/* Section: ข้อมูลบริษัท */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 26, marginBottom: 16 }}>
        <p style={sectionTitle}>ข้อมูลบริษัท</p>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Logo upload */}
          <div>
            <label style={labelStyle}>รูปโลโก้</label>
            <div onClick={() => fileRef.current?.click()}
              style={{ width: 160, height: 130, borderRadius: 10, backgroundColor: '#f0f4ff', border: '2px dashed #c7d4f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
              {logoPreview
                ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <>
                    <Upload size={28} color="#1f4488" style={{ marginBottom: 8 }} />
                    <span style={{ fontSize: 14, color: '#6b7280', fontFamily: F, textAlign: 'center' }}>อัปโหลดรูปภาพ</span>
                  </>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          </div>

          {/* Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { key: 'name', label: 'ชื่อบริษัท *', placeholder: 'ระบุชื่อบริษัท' },
              { key: 'company_type', label: 'ประเภทบริษัท', placeholder: 'ระบุประเภท' },
              { key: 'phone', label: 'เบอร์โทรศัพท์', placeholder: 'ระบุเบอร์โทร' },
              { key: 'email', label: 'อีเมล', placeholder: 'ระบุอีเมล' },
              { key: 'website_url', label: 'เว็บไซต์', placeholder: 'https://...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder} style={inputStyle} />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>ที่อยู่</label>
              <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="ระบุที่อยู่" rows={3}
                style={{ ...inputStyle, height: 'auto', padding: '8px 12px', resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>รายละเอียด</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="รายละเอียดบริษัท" rows={3}
                style={{ ...inputStyle, height: 'auto', padding: '8px 12px', resize: 'vertical' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Section: ผลิตภัณฑ์ */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 26, marginBottom: 16 }}>
        <p style={sectionTitle}>ผลิตภัณฑ์</p>
        <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16, fontFamily: F }}>รายการผลิตภัณฑ์</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: '#6b7280', fontFamily: F }}>ชื่อผลิตภัณฑ์</span>
          <span style={{ fontSize: 14, color: '#6b7280', fontFamily: F }}>ประเภทผลิตภัณฑ์</span>
          <span style={{ fontSize: 14, color: '#6b7280', fontFamily: F }}>รายละเอียด</span>
          <span />
        </div>
        {products.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, marginBottom: 10 }}>
            <input value={p.product_name} onChange={e => updateProduct(i, 'product_name', e.target.value)} placeholder="ชื่อผลิตภัณฑ์" style={inputStyle} />
            <input value={p.product_type} onChange={e => updateProduct(i, 'product_type', e.target.value)} placeholder="ประเภท" style={inputStyle} />
            <input value={p.description} onChange={e => updateProduct(i, 'description', e.target.value)} placeholder="รายละเอียด" style={inputStyle} />
            <button onClick={() => removeProduct(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button onClick={addProduct} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '6px 16px', borderRadius: 8, border: '1px solid #1f4488', background: 'none', color: '#1f4488', fontSize: 15, cursor: 'pointer', fontFamily: F }}>
          <Plus size={14} /> เพิ่มผลิตภัณฑ์
        </button>
      </div>

      {/* Section: รางวัล */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 26 }}>
        <p style={sectionTitle}>รางวัล</p>
        <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16, fontFamily: F }}>รายการรางวัล</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 1fr auto', gap: 12, marginBottom: 8 }}>
          {['ชื่อรางวัล', 'ประเภทรางวัล', 'ปีที่ได้รับ', 'รายละเอียด', ''].map((h, i) => (
            <span key={i} style={{ fontSize: 14, color: '#6b7280', fontFamily: F }}>{h}</span>
          ))}
        </div>
        {awards.map((a, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 1fr auto', gap: 12, marginBottom: 10 }}>
            <input value={a.award_name} onChange={e => updateAward(i, 'award_name', e.target.value)} placeholder="ชื่อรางวัล" style={inputStyle} />
            <input value={a.award_type} onChange={e => updateAward(i, 'award_type', e.target.value)} placeholder="ประเภท" style={inputStyle} />
            <input value={a.year} onChange={e => updateAward(i, 'year', e.target.value)} placeholder="2567" style={inputStyle} />
            <input value={a.description} onChange={e => updateAward(i, 'description', e.target.value)} placeholder="รายละเอียด" style={inputStyle} />
            <button onClick={() => removeAward(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button onClick={addAward} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '6px 16px', borderRadius: 8, border: '1px solid #1f4488', background: 'none', color: '#1f4488', fontSize: 15, cursor: 'pointer', fontFamily: F }}>
          <Plus size={14} /> เพิ่มรางวัล
        </button>
      </div>
    </div>
  )
}
