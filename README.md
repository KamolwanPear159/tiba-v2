# TIBA v2 — VPS Deployment Guide

> Ubuntu VPS · plain Docker (no docker-compose)
> Stack: **Next.js 18** (Frontend) + **Go 1.21** (Backend) + **PostgreSQL 15** (Database)

---

## Prerequisites

- Ubuntu 22.04 (or 20.04) VPS
- At least 2 GB RAM, 20 GB disk
- Ports **5432**, **8080**, **3000** open in the firewall

---

## Step 1 — Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
```

---

## Step 2 — Run PostgreSQL

```bash
docker run -d \
  --name tiba-db \
  --restart unless-stopped \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=<password> \
  -e POSTGRES_DB=tiba_db \
  -v /data/postgres:/var/lib/postgresql/data \
  postgres:15
```

Verify healthy:

```bash
docker exec tiba-db pg_isready -U postgres
```

---

## Step 3 — Clone repositories

```bash
git clone https://github.com/KamolwanPear159/tiba-backend
git clone https://github.com/KamolwanPear159/tiba-frontend
```

---

## Step 4 — Build Docker images

Replace `<VPS_IP>` with your actual public VPS IP throughout this guide.

```bash
docker build -t tiba-api:latest ./tiba-backend

docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://<VPS_IP>:8080/api/v1 \
  -t tiba-frontend:latest \
  ./tiba-frontend
```

---

## Step 5 — Run the Backend

Migrations apply **automatically** on first startup — no manual SQL needed.

```bash
docker run -d \
  --name tiba-api \
  --restart unless-stopped \
  -p 8080:8080 \
  -e DB_HOST=<VPS_IP> \
  -e DB_PORT=5432 \
  -e DB_USER=postgres \
  -e DB_PASSWORD=<password> \
  -e DB_NAME=tiba_db \
  -e DB_SSLMODE=disable \
  -e JWT_SECRET=<long_random_secret> \
  -e JWT_ACCESS_EXPIRY=8h \
  -e JWT_REFRESH_EXPIRY=720h \
  -e ALLOWED_ORIGINS=http://<VPS_IP>:3000 \
  -e SMTP_EMAIL=myverse2023@gmail.com \
  -e SMTP_PASSWORD=<gmail_app_password> \
  -e API_URL=http://<VPS_IP>:8080 \
  -e UPLOAD_DIR=./uploads \
  -v /data/uploads:/app/uploads \
  tiba-api:latest
```

Verify:

```bash
docker logs tiba-api --tail 20
# Expected: "migrate: schema is up to date"
#           "TIBA Backend v2.0.0 starting on :8080"

curl http://localhost:8080/health
# {"status":"ok","version":"2.0.0"}
```

---

## Step 6 — Run Seed data (first deploy only)

```bash
docker exec \
  -e DB_HOST=<VPS_IP> \
  -e DB_PASSWORD=<password> \
  tiba-api ./seed
```

Creates:
- Admin: `admin@tiba.co.th` / `password` — **change after first login**
- Sample tutors, courses, news, contact info, and price plans

---

## Step 7 — Run the Frontend

```bash
docker run -d \
  --name tiba-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://<VPS_IP>:8080/api/v1 \
  tiba-frontend:latest
```

Open: `http://<VPS_IP>:3000`

---

## Container management

```bash
docker ps
docker logs tiba-api      -f --tail 50
docker logs tiba-frontend -f --tail 50
docker restart tiba-api
docker stop tiba-api tiba-frontend tiba-db
```

---

## Update deployment

```bash
cd tiba-backend  && git pull
cd ../tiba-frontend && git pull

docker build -t tiba-api:latest ./tiba-backend
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://<VPS_IP>:8080/api/v1 \
  -t tiba-frontend:latest ./tiba-frontend

docker stop tiba-api     && docker rm tiba-api
docker stop tiba-frontend && docker rm tiba-frontend
# Re-run Steps 5 and 7 — migrations re-apply only pending ones
```

---

## Environment variable reference

See `.env.example` for a complete annotated list.

| Variable | Where | Description |
|---|---|---|
| `DB_HOST` | backend | PostgreSQL host (VPS IP) |
| `DB_PASSWORD` | backend | PostgreSQL password |
| `JWT_SECRET` | backend | `openssl rand -hex 32` |
| `SMTP_EMAIL` | backend | Gmail address |
| `SMTP_PASSWORD` | backend | Gmail App Password |
| `API_URL` | backend | Public backend URL for email links |
| `ALLOWED_ORIGINS` | backend | CORS whitelist — frontend origin |
| `NEXT_PUBLIC_API_URL` | frontend | Backend URL visible to the browser |
