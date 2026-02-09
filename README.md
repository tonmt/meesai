# MeeSai (ມີໃສ່) — Fashion Bank of Laos

> แพลตฟอร์มเช่าชุดแฟชั่น O2O แห่งแรกของ สปป.ลาว

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)

---

## Overview

MeeSai เป็นแพลตฟอร์มกลางสำหรับเช่าชุดแฟชั่นในลาว โดยใช้โมเดล **0% GP** — เจ้าของชุดฝากชุดและรับรายได้ 100% จากค่าเช่า แพลตฟอร์มสร้างรายได้จาก Service Fee, Delivery, Insurance

### Key Features
- 🔍 **Smart Catalog** — ค้นหาชุดตามหมวดหมู่ ไซส์ สี พร้อมเช็คคิวว่าง Real-time
- 📅 **Concurrency Booking** — ระบบจอง Time-based Locking ป้องกัน Double Booking
- 🔄 **FSM (9 States)** — Finite State Machine ควบคุมสถานะชุดทุกขั้นตอน
- 💰 **Double-Entry Ledger** — ระบบบัญชีคู่ ตรวจสอบเส้นทางการเงินทุกกีบ
- 📸 **Immutable Audit Trail** — หลักฐาน QC เก็บแบบแก้ไขไม่ได้
- 🌐 **Bilingual** — ภาษาลาว (primary) + ภาษาอังกฤษ
- 📱 **Responsive** — Mobile-first design + Desktop table views
- 🔔 **Real-time Notifications** — In-app notification bell

### User Roles
| Role | Description |
|:-----|:------------|
| **Renter** | ผู้เช่าชุด — browse, book, pay |
| **Owner** | เจ้าของชุด — ฝากชุด, ดูรายได้, จัดการ inventory |
| **Staff** | พนักงาน — จัดการ booking status, QC, ส่งมอบ |
| **Admin** | ผู้ดูแลระบบ — ดูภาพรวม, จัดการทุกอย่าง |

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (Strict Mode) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL 16 + Prisma 6 |
| Storage | MinIO (S3 Compatible) |
| Cache | Redis 7 |
| i18n | next-intl (LO/EN) |
| Auth | NextAuth.js v5 |
| Container | Docker Compose |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm 10+

### 1. Clone & Install
```bash
git clone <repo-url> meesai
cd meesai
cp .env.example .env
npm install
```

### 2. Start Services (Database + MinIO + Redis)
```bash
docker compose up -d postgres minio redis
```

### 3. Setup Database
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```

App available at: http://localhost:3000

---

## Production Deployment

### One-Command Deploy
```bash
docker compose up -d --build
```

This starts the full stack:
- **App** → port `4200`
- **PostgreSQL** → port `4203`
- **MinIO** → port `4204` (API), `4205` (Console)
- **Redis** → port `4206`

### Environment Variables
See `.env.example` for all required variables.

### Reverse Proxy
Configure Nginx Proxy Manager or Cloudflare to point to `http://server:4200`

---

## Test Credentials

| Role | Phone | Password |
|:-----|:------|:---------|
| Admin | 02099990001 | meesai123 |
| Staff | 02099990002 | meesai123 |
| Owner | 02055551001 | meesai123 |
| Renter | 02077772001 | meesai123 |

---

## Project Structure

```
meesai/
├── prisma/
│   ├── schema.prisma          # Database schema (12 models, 8 enums)
│   └── seed.ts                # Seed data (users, products, categories)
├── src/
│   ├── app/
│   │   ├── [locale]/          # i18n routes (lo/en)
│   │   │   ├── browse/        # Product browsing
│   │   │   ├── product/[id]/  # Product detail
│   │   │   ├── booking/[id]/  # Booking flow
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── owner/         # Owner dashboard
│   │   │   └── staff/         # Staff operations
│   │   └── api/auth/          # NextAuth.js endpoints
│   ├── actions/               # Server Actions (mutations)
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utilities (prisma, auth, fsm)
│   └── i18n/                  # Internationalization config
├── docs/
│   ├── GEMINI_CONTEXT.md      # Business context for AI review
│   └── INVESTOR_DECK_V3.md   # Investor presentation
├── docker-compose.yml         # Production stack
├── Dockerfile                 # Multi-stage build
└── .agent/                    # Dual-agent protocol (Coder ↔ Reviewer)
```

---

## 5 Technical Pillars

1. **Concurrency Booking** — `prisma.$transaction()` + buffer time
2. **FSM (9 States)** — `transitionAssetStatus()` enforced transitions
3. **Product vs ItemAsset** — SKU ≠ Physical item (unique barcode per unit)
4. **Double-Entry Ledger** — No balance field, computed from transactions
5. **Immutable Evidence** — MinIO Object Lock for QC photos

---

## Sprint History (v1.0.0)

| Sprint | Feature |
|:-------|:--------|
| 3.1 | Database + Seed Data |
| 3.2 | Authentication System |
| 3.3 | Booking Logic FSM |
| 3.4 | Payment + Wallet |
| 3.5 | Browse + Product Detail |
| 4.1 | Owner + Admin Dashboards |
| 4.2 | Staff Panel |
| 5.0 | Navigation + Profile + Account |
| 5.2 | Booking Flow Fixes |
| 6.0 | Notification Bell |
| 6.1 | Responsive: Admin/Owner/Staff |
| 6.2 | Responsive: Browse/Product + Landing CTA |
| 7.0 | Error Boundaries + Loading + SEO |
| 7.1 | MVP Complete (README + Production Config) |

---

## License

Proprietary — DDC Groups / V-Group © 2026
