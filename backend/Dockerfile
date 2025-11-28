# ----------------------------------
# Stage 1: Build the Go binary
# ----------------------------------
FROM golang:1.24.5-alpine AS builder

# Set working directory
WORKDIR /app


# Copy go.mod and go.sum first (for caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the project
COPY . .

# Build the binary (disable CGO for static build)
RUN go build -o main .

# ----------------------------------
# Stage 2: Run the built binary (lightweight final image)
# ----------------------------------
FROM alpine:latest

# Set working directory
WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/main .

# Expose the application port
EXPOSE 8080

# Run the app
CMD ["./main"]
