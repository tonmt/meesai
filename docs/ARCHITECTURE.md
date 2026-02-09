# Architecture — MeeSai Platform

> System design document · Last updated: 2026-02-09

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Cloudflare                        │
│            (DNS + SSL + CDN Proxy)                   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│              Nginx Proxy Manager                     │
│        meesai.vgroup.work → meesai-app:3000          │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (internal)
┌──────────────────────▼──────────────────────────────┐
│                meesai-app (Next.js 16)                │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ App      │  │ Server   │  │ Prisma ORM       │    │
│  │ Router   │  │ Actions  │  │ (Query Builder)  │    │
│  └──────────┘  └──────────┘  └────────┬─────────┘    │
└───────────────────────────────────────┬──────────────┘
        ┌───────────────┬───────────────┼───────────┐
        ▼               ▼               ▼           ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐  ┌────────┐
  │ Postgres │   │  MinIO   │   │  Redis   │  │ (BCEL  │
  │  (Data)  │   │ (Images) │   │ (Cache)  │  │  Pay)  │
  └──────────┘   └──────────┘   └──────────┘  └────────┘
      :4203        :4204/:4205     :4206        Future
```

---

## 2. Database Schema

### Models (6 total)

| Model | Table | Purpose |
|:---|:---|:---|
| **User** | `users` | ผู้ใช้ทั้ง Renter, Owner, Admin |
| **Category** | `categories` | ประเภทชุด (Wedding, Traditional, Gala...) |
| **Item** | `items` | ชุดเช่า — Unique Asset Identity (barcode) |
| **Booking** | `bookings` | การจอง — Buffer Time algorithm |
| **Wallet** | `wallets` | กระเป๋าเงินเจ้าของชุด |
| **Payout** | `payouts` | การถอนเงินจาก Wallet |

### Relationships

```
User (OWNER) ──1:N──► Item ───N:1──► Category
User (RENTER) ──1:N──► Booking ──N:1──► Item
User ──1:1──► Wallet ──1:N──► Payout
```

### Key Enums

| Enum | Values |
|:---|:---|
| `UserRole` | RENTER, OWNER, ADMIN |
| `ItemStatus` | AVAILABLE, RENTED, MAINTENANCE, RETIRED |
| `BookingStatus` | PENDING, CONFIRMED, PICKED_UP, RETURNED, COMPLETED, CANCELLED |
| `PayoutStatus` | PENDING, PROCESSING, COMPLETED |

### Buffer Time Algorithm

```
eventDate     → วันงาน
pickupDate    → วันรับชุด (eventDate - 1~2 days)
returnDate    → วันคืนชุด (eventDate + 1 day)
bufferEnd     → วันที่ชุดพร้อมให้เช่าใหม่ (returnDate + 3 days สำหรับซักรีด/ตรวจสภาพ)
```

ชุดจะถูก block ตั้งแต่ `pickupDate` ถึง `bufferEnd` — ป้องกันการจองซ้อน

---

## 3. Design System

### Color Palette

| Token | Hex | Usage |
|:---|:---|:---|
| `--color-royal-navy` | `#0F172A` | Primary BG, trust, authority |
| `--color-champagne-gold` | `#D4AF37` | CTA, luxury accent |
| `--color-off-white` | `#F9FAFB` | Light background |
| `--color-emerald` | `#10B981` | Available, confirm, success |
| `--color-danger` | `#EF4444` | Rental price highlight, errors |

### Typography

| Font | Weight | Usage |
|:---|:---|:---|
| Noto Serif Lao | 400-700 | Headings (ลาว) |
| Noto Sans Lao | 300-700 | Body text (ลาว) |
| Playfair Display | 400-800 | English headings |

### Animations

| Class | Effect |
|:---|:---|
| `.animate-fade-in-up` | Fade + slide up (0.8s) |
| `.animate-float` | Gentle floating (3s loop) |
| `.animate-pulse-gold` | Gold glow pulse (2s loop) |
| `.gold-shimmer` | Gold shimmer sweep (3s loop) |

### Component Styles

| Class | Effect |
|:---|:---|
| `.glass` | Navy glassmorphism (blur 20px) |
| `.glass-light` | White glassmorphism (blur 12px) |
| `.text-gold-gradient` | Gold gradient text |
| `.no-scrollbar` | Hide scrollbar (cross-browser) |

---

## 4. Internationalization (i18n)

| Config | Value |
|:---|:---|
| **Library** | next-intl 4.8.2 |
| **Default Locale** | `lo` (ลາว) |
| **Supported** | `lo`, `en` |
| **Strategy** | URL prefix (`/lo/...`, `/en/...`) |

### Translation Files
- `messages/lo.json` — 100+ keys ภาษาลาว
- `messages/en.json` — English mirror

### Architecture
```
middleware.ts         → Locale detection + redirect
i18n/routing.ts       → Locale config
i18n/request.ts       → Message loading
i18n/navigation.ts    → Link, redirect, usePathname, useRouter
```

---

## 5. Landing Page Sections

| # | Section | Component | Description |
|:---:|:---|:---|:---|
| 1 | Sticky Header | `StickyHeader()` | Glass navbar, search, locale, cart |
| 2 | Hero | `HeroSection()` | Slogan, dual CTA, stats counter |
| 3 | Booking Engine | `BookingEngine()` | Date, occasion, size, check availability |
| 4 | Occasion Nav | `OccasionNav()` | 6 icon circles (IG style) |
| 5 | Dynamic Feed | `DynamicFeed()` | Product cards grid, quick book |
| 6 | Trust | `TrustSection()` | 3 service guarantee badges |
| 7 | Owner Zone | `OwnerZone()` | 0% GP partner recruitment |
| 8 | Footer | `Footer()` | Payment logos, legal, contact |
| — | Bottom Nav | `BottomNav()` | Mobile-only tab bar (5 tabs) |

---

## 6. Revenue Model

```
Zero GP (0% Commission จากเจ้าของชุด)

Revenue Streams:
├── Service Fee (ค่าบริการจากผู้เช่า → serviceFee ใน Booking)
├── Delivery Fee (ค่าจัดส่ง)
├── Insurance Premium (ค่าประกัน)
├── Premium Listing (ค่าโปรโมทชุด)
└── Subscription (สมาชิก VIP)
```
