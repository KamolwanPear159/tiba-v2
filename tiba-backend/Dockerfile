# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM golang:1.21-alpine AS builder

RUN apk --no-cache add git

WORKDIR /app

# Cache module downloads separately from source changes
COPY go.mod go.sum ./
RUN GOPROXY=https://goproxy.io,https://proxy.golang.org,direct GONOSUMDB=* go mod download

COPY . .

# Build server and seed binaries (static, stripped for minimal size)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server  ./cmd/server/
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o seed    ./cmd/seed/

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM alpine:3.21

RUN apk --no-cache add ca-certificates tzdata && \
    adduser -D -u 1001 appuser

WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /app/seed   .

RUN mkdir -p uploads/images uploads/documents && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

# ── Default environment (override at runtime via -e or --env-file) ─────────────
ENV SERVER_PORT=8080 \
    ENV=production \
    DB_HOST=localhost \
    DB_PORT=5432 \
    DB_USER=postgres \
    DB_PASSWORD=postgres \
    DB_NAME=tiba_db \
    DB_SSLMODE=disable \
    JWT_SECRET=change-this-secret \
    JWT_ACCESS_EXPIRY=8h \
    JWT_REFRESH_EXPIRY=720h \
    UPLOAD_DIR=./uploads \
    MAX_FILE_SIZE=10485760 \
    ALLOWED_ORIGINS=http://localhost:3000 \
    SMTP_HOST=smtp.gmail.com \
    SMTP_PORT=587 \
    SMTP_EMAIL="" \
    SMTP_PASSWORD=""

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:${SERVER_PORT}/health || exit 1

# Migrations run automatically inside server on startup
CMD ["./server"]
