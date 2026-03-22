# TIBA Frontend — Next.js 14

สมาคมนายหน้าประกันภัยไทย (Thai Insurance Brokers Association) — Frontend

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Inline styles + CSS variables |
| Font | Anuphan (TH) + Inter (EN) |
| Container | Docker (standalone output) |

## Quick Start

```bash
# Development
npm install
npm run dev

# Production (Docker)
docker-compose up -d frontend
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Pages

### Public
| Path | Description |
|------|-------------|
| / | หน้าแรก (Hero + Courses + News + Partners) |
| /courses | รายการคอร์สอบรม |
| /courses/[id] | รายละเอียดคอร์ส + enrollment modal |
| /about | เกี่ยวกับสมาคม |
| /news | ข่าวสาร/บทความ |
| /news/[slug] | รายละเอียดข่าว |
| /contact | ติดต่อเรา |
| /statistics | สถิติประกันภัย |
| /price-benefits | ราคา/สิทธิประโยชน์สมาชิก |
| /member-companies | บริษัทสมาชิก |

### Auth
| Path | Description |
|------|-------------|
| /login | เข้าสู่ระบบสมาชิก |
| /register | เลือกประเภทสมาชิก |
| /register/normal | สมัครสมาชิกทั่วไป (OTP 3 steps) |
| /register/association | สมัครสมาชิกสมาคม (OTP 3 steps) |
| /forgot-password | ลืมรหัสผ่าน (OTP reset) |

### Member Portal (/member/*)
| Path | Description |
|------|-------------|
| /member/profile | โปรไฟล์ + แก้ไข |
| /member/courses | คอร์สที่ลงทะเบียน |
| /member/payments | ประวัติการชำระเงิน + upload slip |
| /member/certificates | ใบรับรอง |
| /member/settings | เปลี่ยนรหัสผ่าน + การแจ้งเตือน |

### Admin Back-office (/admin/*)
| Path | Description |
|------|-------------|
| /admin/login | เข้าสู่ระบบแอดมิน |
| /admin/dashboard | แดชบอร์ด + สถิติ |
| /admin/members | จัดการสมาชิก |
| /admin/registrations | คำขอลงทะเบียน |
| /admin/courses | จัดการคอร์ส |
| /admin/tutors | จัดการผู้สอน |
| /admin/orders | จัดการคำสั่งซื้อ/ชำระเงิน |
| /admin/sub-user-requests | คำขอสมาชิกย่อย |
| /admin/content/* | จัดการเนื้อหา (news, banners, partners...) |
| /admin/calendar | ปฏิทิน |
| /admin/profile | โปรไฟล์แอดมิน |

## Auth Flow

- **Member**: token stored as `member_token` in localStorage
- **Admin**: token stored as `access_token` in localStorage
- OTP verification required for register + forgot-password

## Design Tokens

```css
--color-primary: #1f4488;   /* Dark blue */
--color-secondary: #126f38; /* Green */
--color-dark: #132953;      /* Dark navy */
--color-accent: #ee7429;    /* Orange */
--font-thai: Anuphan;
--font-eng: Inter;
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/             # login, register, forgot-password
│   ├── (public)/           # courses, news, about, contact...
│   ├── admin/              # back-office pages
│   ├── member/             # member portal pages
│   └── layout.tsx
├── components/
│   └── layout/             # PublicHeader, PublicFooter, AdminSidebar
└── lib/
    └── api/
        └── services/       # member.service.ts, admin.service.ts
```
