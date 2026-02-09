# MeeSai (ມີໃສ່) — Fashion Bank of Laos

> **ຢູ່ໃສບໍ່ມີ... ມາພີ້ 'ມີໃສ່'**
> O2O Fashion Rental Platform · Vientiane, Laos

[![Live](https://img.shields.io/badge/Live-meesai.vgroup.work-D4AF37?style=flat-square)](https://meesai.vgroup.work)
[![Version](https://img.shields.io/badge/Version-0.2.0-0F172A?style=flat-square)](#)
[![Phase](https://img.shields.io/badge/Phase-2%20Responsive-10B981?style=flat-square)](#)
[![Theme](https://img.shields.io/badge/Theme-Light-F9FAFB?style=flat-square&labelColor=D4AF37)](#)

---

## 🎯 Vision

MeeSai เป็นแพลตฟอร์ม **เช่าชุดแฟชั่น** แบบ Online-to-Offline สำหรับประเทศลาว ด้วยโมเดล **Zero GP (0% Commission)** — เรียกเก็บเฉพาะค่าบริการ ไม่หักค่าหัวคิวจากเจ้าของชุด

### Core Concept: Fashion Bank
- ชุดทุกตัวเป็น **ทรัพย์สิน (Asset)** ที่สร้างรายได้ passive income
- เจ้าของชุดฝากชุดเข้าระบบ → ระบบจัดการเช่า → เงินเข้า Wallet
- ผู้เช่าได้ชุดคุณภาพ ผ่านมาตรฐาน Hygiene + Buffer Time

---

## 🛠 Tech Stack

| Layer | Technology |
|:---|:---|
| **Framework** | Next.js 16.1.6 (App Router, Turbopack) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL 16 + Prisma 6 |
| **Storage** | MinIO (S3 Compatible) |
| **Cache** | Redis 7 |
| **i18n** | next-intl (ລາວ / English) |
| **Icons** | Lucide React |
| **Deploy** | Docker Compose (Isolated Stack) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker + Docker Compose

### Development
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
```

### Production (Docker)
```bash
# Build & deploy all containers
docker compose up -d --build

# Check health
docker ps --filter "name=meesai"
```

---

## 🐳 Infrastructure

| Container | Port | Service |
|:---|:---:|:---|
| `meesai-app` | 4200 | Next.js Application |
| `meesai-postgres` | 4203 | PostgreSQL 16 |
| `meesai-minio` | 4204 / 4205 | MinIO API / Console |
| `meesai-redis` | 4206 | Redis 7 |

**Subdomain:** [meesai.vgroup.work](https://meesai.vgroup.work)
**SSL:** Cloudflare (auto, proxied)

---

## 📁 Project Structure

```
meesai/
├── src/
│   ├── app/
│   │   ├── globals.css          # Design System (Light Theme)
│   │   ├── layout.tsx           # Root Layout
│   │   └── [locale]/
│   │       ├── layout.tsx       # Locale Layout (NextIntlClientProvider)
│   │       └── page.tsx         # Landing Page (imports 8 components)
│   ├── components/
│   │   └── landing/
│   │       ├── StickyHeader.tsx  # Desktop nav + mobile hamburger
│   │       ├── HeroSection.tsx   # Split layout PC / center mobile
│   │       ├── BookingEngine.tsx  # Responsive grid 1→4
│   │       ├── OccasionNav.tsx   # Scroll → grid 6
│   │       ├── DynamicFeed.tsx   # Sidebar filter + bottom sheet
│   │       ├── TrustSection.tsx  # Trust badges
│   │       ├── OwnerZone.tsx     # Partner zone + benefit cards
│   │       ├── Footer.tsx        # 4-column + social icons
│   │       └── BottomNav.tsx     # Mobile tab bar
│   ├── i18n/
│   │   ├── navigation.ts       # Link, redirect, usePathname, useRouter
│   │   ├── request.ts          # Locale detection + message loading
│   │   └── routing.ts          # Supported locales config
│   └── middleware.ts            # Locale routing middleware
├── messages/
│   ├── lo.json                  # ພາສາລາວ (Primary)
│   └── en.json                  # English (Secondary)
├── prisma/
│   └── schema.prisma            # Database schema (6 models)
├── docker-compose.yml           # Isolated 4-container stack
├── Dockerfile                   # Multi-stage production build
└── docs/
    ├── ARCHITECTURE.md          # System architecture
    └── PROGRESS.md              # Phase progress tracker
```

---

## 📚 Documentation

| Document | Description |
|:---|:---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, database schema, design system |
| [PROGRESS.md](docs/PROGRESS.md) | Phase tracker — what's done, what's next |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

---

## 📄 License

Private — DDC Groups / V-Group
