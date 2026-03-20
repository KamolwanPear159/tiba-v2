FROM golang:1.23-alpine AS builder
RUN apk --no-cache add git
WORKDIR /app
COPY . .
RUN rm -f go.sum && GOPROXY=https://goproxy.io,https://proxy.golang.org,direct GONOSUMDB=* GOFLAGS=-mod=mod go build -o server ./cmd/server/

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /app/server .
RUN mkdir -p uploads/images uploads/documents
EXPOSE 8080
CMD ["./server"]
