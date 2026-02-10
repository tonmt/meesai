# MeeSai (ມີໃສ່) — Fashion Bank of Laos

> ແພລດຟອມເຊົ່າຊຸດແຟຊັ່ນ O2O ແຫ່ງທຳອິດຂອງ ສປປ.ລາວ

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)

---

## Quick Start

```bash
# Install
cp .env.example .env
npm install

# Start services
docker compose up -d postgres minio redis

# Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# Run dev server
npm run dev
```

App: http://localhost:3000

## Test Credentials

| Role | Phone | Password |
|:-----|:------|:---------|
| Admin | 02099990001 | meesai123 |
| Staff | 02099990002 | meesai123 |
| Owner | 02055551001 | meesai123 |
| Renter | 02077772001 | meesai123 |

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (Strict) |
| Styling | Tailwind CSS v4 (Dark Mode) |
| Database | PostgreSQL 16 + Prisma 6 |
| Storage | MinIO (S3 Compatible) |
| Cache | Redis 7 |
| i18n | next-intl (LO/EN) |
| Auth | NextAuth.js v5 |
| Container | Docker Compose |

## License

Proprietary — DDC Groups / V-Group © 2026
