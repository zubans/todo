FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Собираем приложение
RUN CGO_ENABLED=0 GOOS=linux go build -o todo-backend .

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/todo-backend .

CMD ["./todo-backend"]