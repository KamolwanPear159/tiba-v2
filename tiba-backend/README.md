# TIBA Backend — Go REST API

สมาคมนายหน้าประกันภัยไทย (Thai Insurance Brokers Association) — Backend API

## Stack

| Layer | Technology |
|-------|-----------|
| Language | Go 1.23 |
| Framework | Gin v1.9 |
| Database | PostgreSQL 15 |
| ORM | sqlx |
| Auth | JWT (RS256) + Refresh Token |
| Email | Gmail SMTP (OTP) |
| Container | Docker / Docker Compose |

## Quick Start

```bash
# 1. Copy env
cp .env.example .env
# Edit .env with your values

# 2. Start with Docker Compose (includes DB)
docker-compose up -d

# 3. Run seed data (first time only)
docker run --rm --network tiba-v2_default \
  -v "$(pwd):/goapp" \
  -e DB_HOST=tiba_db -e DB_PORT=5432 \
  -e DB_USER=postgres -e DB_PASSWORD=postgres \
  -e DB_NAME=tiba_db -e DB_SSLMODE=disable \
  golang:1.23-alpine \
  sh -c "cd /goapp && GOPROXY=https://goproxy.io,direct GOFLAGS=-mod=mod go run ./cmd/seed/"
```

## Environment Variables

See `.env.example` for full list.

```env
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tiba_db
JWT_SECRET=your-secret-here
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=your-app-password
```

## Default Admin Account (Seed)

| Field | Value |
|-------|-------|
| Email | admin@tiba.co.th |
| Password | password |
| Role | admin |

## API Overview

Base URL: `http://localhost:8080/api/v1`

### Auth (no token required)
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/send-otp | ส่ง OTP ทาง email |
| POST | /auth/verify-otp | ตรวจสอบ OTP |
| POST | /auth/register/normal | สมัครสมาชิกทั่วไป |
| POST | /auth/register/association | สมัครสมาชิกสมาคม |
| POST | /auth/login | เข้าสู่ระบบ |
| POST | /auth/refresh | รีเฟรช token |
| POST | /auth/logout | ออกจากระบบ |
| POST | /auth/forgot-password | ขอ OTP รีเซ็ตรหัสผ่าน |
| POST | /auth/reset-password | รีเซ็ตรหัสผ่าน |

### Public (no token required)
| Method | Path | Description |
|--------|------|-------------|
| GET | /public/courses | รายการคอร์ส (published) |
| GET | /public/courses/:id | รายละเอียดคอร์ส |
| GET | /public/news | รายการข่าวสาร |
| GET | /public/price-benefits | แผนราคาสมาชิก |
| GET | /public/contact | ข้อมูลติดต่อ |
| GET | /public/partners | รายการพาร์ทเนอร์ |

### Member (Bearer JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | /member/profile | โปรไฟล์สมาชิก |
| POST | /member/enrollments | ลงทะเบียนคอร์ส |
| POST | /member/enrollments/:id/slip | อัพโหลดสลิป |
| GET | /member/certificates | รายการใบรับรอง |
| GET | /member/notifications | การแจ้งเตือน |

### Admin (Bearer JWT + admin role)
| Method | Path | Description |
|--------|------|-------------|
| GET | /admin/dashboard/stats | สถิติแดชบอร์ด |
| POST | /admin/courses | สร้างคอร์ส |
| POST | /admin/courses/:id/sessions | สร้าง session |
| PUT | /admin/orders/:id/confirm | ยืนยันชำระเงิน |
| PUT | /admin/orders/:id/reject | ปฏิเสธชำระเงิน |

## Project Structure

```
tiba-backend/
├── cmd/
│   ├── server/main.go       # Entry point
│   └── seed/main.go         # Seed data runner
├── internal/
│   ├── config/              # Config + DB connection
│   ├── controllers/         # HTTP handlers
│   ├── middleware/           # Auth, CORS, Logger, Role
│   ├── models/              # Structs + DTOs
│   ├── repositories/        # DB queries (sqlx)
│   ├── routes/              # Route registration
│   └── services/            # Business logic
├── migrations/              # SQL migration files
├── pkg/
│   ├── email/               # Gmail SMTP
│   ├── hash/                # bcrypt
│   ├── jwt/                 # JWT helpers
│   ├── paginate/            # Pagination
│   ├── response/            # Standard response
│   └── upload/              # File upload helpers
├── uploads/                 # User-uploaded files (gitignored)
├── test-reports/            # E2E test reports (gitignored)
├── .env.example
├── Dockerfile
└── go.mod
```

## File Upload Structure

```
uploads/
├── slips/YYYY-MM/           # Payment slips
├── certificates/            # Course certificates
├── tutors/                  # Tutor photos
├── thumbnails/              # Course thumbnails
└── brochures/               # Course brochures
```

## Running Migrations

Migrations are applied automatically on first DB setup. To apply manually:

```bash
docker exec tiba_db psql -U postgres -d tiba_db -f /path/to/migration.sql
```

## E2E Test Report

See `test-reports/E2E_Test_Report_2026-03-22.xlsx`

- 77 test cases total
- 100% pass rate
- Covers: Auth, Public, Member, Admin flows
