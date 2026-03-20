# TIBA Insurance System v2.0.0

Stack: **Next.js 14** (Frontend) + **Golang** (Backend) + **PostgreSQL** (Database)

---

## โครงสร้างโปรเจกต์

```
tiba-v2/
├── tiba-backend/     Golang MVC API
├── tiba-frontend/    Next.js 14 (TypeScript + Tailwind)
├── docker-compose.yml
└── README.md
```

---

## วิธีรัน (2 แบบ)

### แบบที่ 1 — Docker (แนะนำ)

ต้องการ: Docker Desktop

```bash
cd C:\Users\Lenovo\Documents\tiba-v2
docker compose up --build
```

รอจนเห็น `Server running on :8080` และ `Ready on http://localhost:3000`

| Service | URL |
|---------|-----|
| Frontend (หน้าบ้าน) | http://localhost:3000 |
| Frontend (หลังบ้าน) | http://localhost:3000/admin |
| Backend API | http://localhost:8080/api/v1 |
| Database | localhost:5432 |

---

### แบบที่ 2 — รันแยก (ถ้าไม่มี Docker)

#### ขั้นตอนที่ 1: PostgreSQL
สร้าง database ชื่อ `tiba_db` แล้วรัน migration:
```bash
psql -U postgres -d tiba_db -f tiba-backend/migrations/001_init_schema.sql
```

#### ขั้นตอนที่ 2: Backend
```bash
cd tiba-backend
copy .env.example .env
# แก้ .env ให้ตรงกับ DB ของคุณ
go mod tidy
go run ./cmd/server/
# Backend รันที่ http://localhost:8080
```

#### ขั้นตอนที่ 3: Frontend
```bash
cd tiba-frontend
copy .env.local.example .env.local
npm install
npm run dev
# Frontend รันที่ http://localhost:3000
```

---

## Default Credentials

### Admin (หลังบ้าน)
- URL: http://localhost:3000/admin/login
- Email: `admin@tiba.co.th`
- Password: `Admin@1234`

### Member (หน้าบ้าน)
- URL: http://localhost:3000/login
- สมัครใหม่ได้ที่: http://localhost:3000/register

---

## การใช้งาน Mock Data (ถ้ายัง set up BE ไม่เสร็จ)

แก้ไฟล์ `tiba-frontend/.env.local`:
```
NEXT_PUBLIC_USE_MOCK=true
```
จากนั้น `npm run dev` — Frontend จะใช้ mock data ทั้งหมด ไม่ต้องรัน Backend

---

## สิ่งที่ใช้งานได้จริง (Real API)

| Feature | สถานะ |
|---------|-------|
| Admin Login / Logout | ✅ Real |
| จัดการ News & Blog | ✅ Real |
| จัดการ Banner | ✅ Real |
| จัดการ Ads | ✅ Real |
| จัดการ Partners | ✅ Real |
| จัดการ Executive Board | ✅ Real |
| Upload สถิติ PDF | ✅ Real |
| แก้ข้อมูล Contact | ✅ Real |
| จัดการ Companies | ✅ Real |
| จัดการ Price & Benefits | ✅ Real |
| สร้าง/แก้ Courses | ✅ Real |
| จัดการ Sessions + Calendar | ✅ Real |
| Register / Login (member) | ✅ Real |
| Public pages แสดงข้อมูลจริง | ✅ Real |

## สิ่งที่เป็น Mock (เปิดใช้ phase ถัดไป)

| Feature | สถานะ |
|---------|-------|
| Registration approval flow | 🟡 Mock |
| Course enrollment + payment | 🟡 Mock |
| Certificate management | 🟡 Mock |
| Dashboard charts (ข้อมูลจริง) | 🟡 Mock |

---

## โครงสร้าง Backend (Golang MVC)

```
tiba-backend/
├── cmd/server/main.go        Entry point
├── internal/
│   ├── config/               Config + DB connection
│   ├── models/               DB structs + DTOs
│   ├── repositories/         SQL queries
│   ├── services/             Business logic
│   ├── controllers/          HTTP handlers
│   ├── middleware/           Auth, Role, CORS, Logger
│   └── routes/               Route registration
├── migrations/               SQL migration files
└── pkg/                      Utilities (jwt, hash, upload, paginate, response)
```

## โครงสร้าง Frontend (Next.js 14)

```
tiba-frontend/src/
├── app/
│   ├── (public)/             หน้าบ้าน (landing, news, courses, ฯลฯ)
│   ├── (auth)/               Login + Register
│   ├── member/               Member zone
│   └── admin/                Back office
├── components/
│   ├── ui/                   Reusable UI components
│   ├── layout/               Header, Footer, Sidebar
│   ├── public/               Public page components
│   └── admin/                Admin page components
├── lib/
│   ├── api/                  API services + mock data
│   ├── hooks/                Custom hooks
│   └── utils/                Utilities
└── types/                    TypeScript interfaces
```

---

## API Documentation

- Swagger UI: ดูไฟล์ `C:\Users\Lenovo\Documents\TIBA_v.0.0.0\swagger.yaml`
  เปิดที่ https://editor.swagger.io แล้ว import ไฟล์
- Postman: import `C:\Users\Lenovo\Documents\TIBA_v.0.0.0\TIBA_API.postman_collection.json`

---

## Environment Variables

### Backend (.env)
```
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tiba_db
DB_SSLMODE=disable
JWT_SECRET=change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=720h
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_USE_MOCK=false
```

---

## หมายเหตุสำหรับ Dev Team

1. **ไฟล์ที่ upload** จะเก็บที่ `tiba-backend/uploads/` แบ่งเป็น `images/` และ `documents/`
2. **Admin seed password** `Admin@1234` — เปลี่ยนทันทีหลัง deploy production
3. **JWT Secret** ต้องเปลี่ยนใน production — ห้ามใช้ค่า default
4. **Mock mode** ใช้ระหว่าง dev frontend ก่อน backend พร้อม — สลับด้วย `NEXT_PUBLIC_USE_MOCK`
5. **Database** ต้องรัน `migrations/001_init_schema.sql` ก่อนเริ่มเสมอ
