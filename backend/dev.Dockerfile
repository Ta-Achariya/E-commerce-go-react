# Choose whatever you want, version >= 1.16
FROM golang:1.25-alpine

ENV PATH="/go/bin:${PATH}"
ENV GO111MODULE=on

WORKDIR /app

RUN go install github.com/air-verse/air@latest

COPY go.mod go.sum ./
RUN go mod download

COPY . .

CMD ["air", "-c", ".air.toml"]