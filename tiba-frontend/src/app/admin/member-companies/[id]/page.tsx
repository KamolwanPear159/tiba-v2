'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Building2, Phone, Mail, Globe, MapPin } from 'lucide-react'
import { adminService } from '@/lib/api/services/admin.service'

const F = 'var(--font-thai)'

export default function ViewMemberCompanyPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: company, isLoading } = useQuery({
    queryKey: ['member-company', id],
    queryFn: () => adminService.getMemberCompany(id),
  })

  if (isLoading) return <div style={{ fontFamily: F, padding: 42, color: '#9ca3af' }}>กำลังโหลด...</div>
  if (!company) return <div style={{ fontFamily: F, padding: 42, color: '#9ca3af' }}>ไม่พบข้อมูล</div>

  const thStyle: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#6b7280', backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6', fontFamily: F }
  const tdStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 15, color: '#374151', borderBottom: '1px solid #f3f4f6', fontFamily: F }

  return (
    <div style={{ fontFamily: F, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280', fontFamily: F }}>
          <ChevronLeft size={18} /> ย้อนกลับ
        </button>
        <button onClick={() => router.push(`/admin/member-companies/${id}/edit`)}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', backgroundColor: '#1f4488', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
          แก้ไข
        </button>
      </div>

      {/* Company card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 26, marginBottom: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20, fontFamily: F }}>ข้อมูลบริษัทสมาชิก</p>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Logo */}
          <div style={{ width: 100, height: 100, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
            {company.logo_url
              ? <img src={company.logo_url} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <Building2 size={40} color="#9ca3af" />}
          </div>
          {/* Info */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 4, fontFamily: F }}>ชื่อบริษัท</p>
              <p style={{ fontSize: 17, fontWeight: 600, color: '#111827', fontFamily: F }}>{company.name}</p>
            </div>
            <div>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 4, fontFamily: F }}>ประเภทบริษัท</p>
              <p style={{ fontSize: 16, color: '#374151', fontFamily: F }}>{company.company_type || '-'}</p>
            </div>
            {company.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={14} color="#9ca3af" />
                <p style={{ fontSize: 16, color: '#374151', fontFamily: F }}>{company.phone}</p>
              </div>
            )}
            {company.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} color="#9ca3af" />
                <p style={{ fontSize: 16, color: '#374151', fontFamily: F }}>{company.email}</p>
              </div>
            )}
            {company.website_url && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, gridColumn: '1 / -1' }}>
                <Globe size={14} color="#9ca3af" />
                <a href={company.website_url} target="_blank" rel="noreferrer" style={{ fontSize: 16, color: '#1f4488', fontFamily: F }}>{company.website_url}</a>
              </div>
            )}
            {company.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, gridColumn: '1 / -1' }}>
                <MapPin size={14} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 16, color: '#374151', fontFamily: F, lineHeight: '1.6' }}>{company.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 26, marginBottom: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 4, fontFamily: F }}>ผลิตภัณฑ์</p>
        <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16, fontFamily: F }}>รายการผลิตภัณฑ์</p>
        {company.products && company.products.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>ชื่อผลิตภัณฑ์</th>
                <th style={thStyle}>ประเภทผลิตภัณฑ์</th>
                <th style={thStyle}>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {company.products.map((p) => (
                <tr key={p.product_id}>
                  <td style={tdStyle}>{p.product_name}</td>
                  <td style={tdStyle}>{p.product_type}</td>
                  <td style={{ ...tdStyle, color: '#6b7280' }}>{p.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ fontSize: 15, color: '#9ca3af', fontFamily: F }}>ไม่พบข้อมูล</p>}
      </div>

      {/* Awards */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 26 }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 4, fontFamily: F }}>รางวัล</p>
        <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16, fontFamily: F }}>รายการรางวัล</p>
        {company.awards && company.awards.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>ชื่อรางวัล</th>
                <th style={thStyle}>ประเภทรางวัล</th>
                <th style={thStyle}>ปีที่ได้รับ</th>
                <th style={thStyle}>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {company.awards.map((a) => (
                <tr key={a.award_id}>
                  <td style={tdStyle}>{a.award_name}</td>
                  <td style={tdStyle}>{a.award_type}</td>
                  <td style={tdStyle}>{a.year}</td>
                  <td style={{ ...tdStyle, color: '#6b7280' }}>{a.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ fontSize: 15, color: '#9ca3af', fontFamily: F }}>ไม่พบข้อมูล</p>}
      </div>
    </div>
  )
}
