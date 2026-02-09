# Changelog — MeeSai Platform

All notable changes to this project will be documented in this file.

---

## [0.2.0] — 2026-02-09

### 🎨 Phase 2: Light Theme + Responsive Perfection

#### Changed
- **Theme:** Dark → Light across entire system
  - Body background: Navy `#0F172A` → White `#FFFFFF`
  - Header: Dark glass → White glass with subtle shadow
  - Hero: Navy gradient → Cream gradient + gold dots pattern
  - Footer/BottomNav: Navy → White
  - All text: White → Royal Navy / Navy-600
  - Accent colors preserved (Champagne Gold, Emerald, Danger)

- **Component Structure:** Monolithic → Modular
  - `page.tsx` refactored from 506 lines to 26 lines
  - 8 standalone components in `src/components/landing/`

#### Added
- **Desktop Navigation:** Top nav links (ໜ້າຫຼັກ, ເຊົ່າຊຸດ, ວິທີການ, ຕິດຕໍ່)
- **Mobile Hamburger:** Slide-in drawer with nav + login + locale
- **Hero Split Layout:** Desktop = text left + card showcase right
- **Sidebar Filter (Desktop):** Category, Size, Price range for product feed
- **Bottom Sheet Filter (Mobile):** Swipe-up filter with apply button
- **Owner Benefit Cards:** 3 cards (Passive Income, Insurance, Dashboard)
- **Footer 4-Column Layout:** Brand + Quick Links + Legal + Payment
- **Social Icons:** Facebook, Instagram, TikTok
- **New CSS:** `hero-bg-light`, `gold-dots-pattern`, slide-in animations
- **Translations:** Nav links + footer quick links (LO/EN)

---

## [0.1.0] — 2026-02-09

### 🎉 Initial Release — Phase 1: Foundation

#### Added
- **Project Setup**
  - Next.js 16.1.6 (Turbopack) + TypeScript Strict Mode
  - Tailwind CSS v4 with custom design system
  - Prisma 6.19.2 + PostgreSQL schema
  - next-intl 4.8.2 bilingual support (LO / EN)

- **Design System**
  - Royal Navy (`#0F172A`) + Champagne Gold (`#D4AF37`) palette
  - Noto Serif Lao / Noto Sans Lao / Playfair Display typography
  - Glass effects, gold shimmer, fadeInUp animations

- **Landing Page — 8 Sections**
  - Smart Sticky Header (glass navbar, contextual search, locale toggle)
  - Hero Section (Lao slogan, dual CTA, stats counter)
  - Booking Engine (event date, occasion, size selector)
  - Occasion Navigation (6 circular icons)
  - Dynamic Feed (product cards with rental pricing)
  - Service Guarantee (3 trust badges)
  - Owner Partner Zone (0% GP highlight)
  - Footer (payment logos, legal links)
  - Mobile Bottom Navigation Bar (5 tabs)

- **Database Schema**
  - 6 models: User, Category, Item, Booking, Wallet, Payout
  - 4 enums: UserRole, ItemStatus, BookingStatus, PayoutStatus
  - Buffer Time fields (pickupDate, returnDate, bufferEnd)
  - Unique Asset Identity (Item.barcode)

- **Infrastructure**
  - Docker Compose — 4-container isolated stack
  - Port block 4200-4209
  - NPM Proxy Host (ID: 16)
  - Cloudflare DNS + SSL (auto, proxied)

- **Deployment**
  - Live at `https://meesai.vgroup.work`
  - GitHub repository `tonmt/meesai` (private)
  - SERVER_AGREEMENT v1.2.0 registered

#### Technical Notes
- Prisma downgraded from 7.3.0 to 6.19.2 (v7 removed `url=env()` from schema)
- CSS `@import url()` must precede `@import "tailwindcss"` in Tailwind v4
- Created `navigation.ts` module to export `Link` from next-intl
