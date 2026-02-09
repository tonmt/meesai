# MeeSai (ມີໃສ່) — Business Context for Code Review

> เอกสารนี้สำหรับ AI Code Reviewer เพื่อเข้าใจบริบทธุรกิจก่อนรีวิวโค้ด

---

## Business Model: Fashion Bank

**MeeSai** = ธนาคารแฟชั่นแห่งแรกของลาว — แพลตฟอร์มเช่าชุดแฟชั่น O2O

### Core Value Proposition
- **ผู้เช่า (Renter):** เช่าชุดแบรนด์เนมคุณภาพ สะอาดมาตรฐานโรงแรม จองง่ายผ่านมือถือ
- **เจ้าของชุด (Owner):** ฝากชุด → รับ Passive Income **0% GP** (ไม่หักค่าหัวคิว)
- **แพลตฟอร์ม (MeeSai):** รายได้จาก Service Fee, Delivery Fee, Insurance

### Revenue Split per Booking
```
Customer จ่าย → rentalFee (100% → Owner) + serviceFee (→ Platform) + deposit (refundable)
```

---

## 5 Technical Pillars (ต้อง enforce ในทุก PR)

### 1. Concurrency Control
- การจองต้องใช้ `prisma.$transaction()` + availability check
- `bufferEnd = returnDate + BUFFER_DAYS` ป้องกัน double booking
- Index: `@@index([assetId, pickupDate, bufferEnd])`

### 2. FSM (Finite State Machine)
- AssetStatus มี **9 states** — ข้ามขั้นไม่ได้
- ทุก transition ต้องผ่าน `transitionAssetStatus()` function
- ห้าม manual update status field โดยตรง
- ทุก transition บันทึกใน `StatusTransition` table

### 3. Product vs ItemAsset
- `Product` = SKU (แสดงหน้าเว็บ, รูป, ราคาแนะนำ)
- `ItemAsset` = ตัวชุดจริง (barcode, เจ้าของ, สถานะ FSM, ประวัติซ่อม)
- Booking ผูกกับ `ItemAsset` ไม่ใช่ `Product`

### 4. Double-Entry Ledger
- `Wallet` ไม่มี `balance` field
- ยอดเงิน = computed จาก `Transaction` table (SUM incoming - SUM outgoing)
- Transaction เป็น append-only (ห้ามลบ/แก้)

### 5. Evidence & Audit
- `EvidenceLog` เก็บรูปหลักฐาน Check-out/Check-in (MinIO, Immutable)
- `StatusTransition` เก็บ log ทุกการเปลี่ยนสถานะ
- `MaintenanceLog` เก็บประวัติซ่อมบำรุงรายชิ้น

---

## Code Review Checklist

เมื่อรีวิว PR ให้ตรวจสอบ:

- [ ] **ไม่มี balance field** — ถ้ามีการคำนวณยอดเงิน ต้อง query จาก Transaction
- [ ] **FSM enforced** — ไม่มี `update({ status: ... })` ตรงๆ ต้องผ่าน transition function
- [ ] **Booking ใช้ transaction** — `prisma.$transaction()` สำหรับ availability check + insert
- [ ] **Buffer Time** — ทุก booking ต้องคำนวณ `bufferEnd` ก่อน save
- [ ] **Evidence immutable** — รูปใน EvidenceLog ห้ามลบ/แก้ไข
- [ ] **Asset ID ถูกต้อง** — Booking ผูกกับ `ItemAsset` (assetId) ไม่ใช่ Product
- [ ] **Input validation** — ใช้ Zod schema validate ทุก Server Action
- [ ] **i18n** — UI text ต้องผ่าน `useTranslations()` ไม่ hardcode
- [ ] **Type-safe** — TypeScript strict mode, no `any`

---

## Architecture Quick Reference

| Layer | Technology | Note |
|:---|:---|:---|
| Framework | Next.js 16.1.6 (App Router) | Server Actions for mutations |
| Language | TypeScript (Strict) | No `any` allowed |
| Database | PostgreSQL 16 + Prisma 6 | 12 models, 8 enums |
| Storage | MinIO (S3) | Evidence photos (Object Lock) |
| Cache | Redis 7 | Session, availability cache |
| i18n | next-intl | LO (primary), EN |
| Styling | Tailwind CSS v4 | Light Theme, Dark Mode ready |
| Container | Docker Compose | 4-service isolated stack |

## File Structure

```
src/
├── app/[locale]/          # Pages (App Router)
├── components/landing/    # Landing page components (8)
├── lib/                   # Business logic (FSM, ledger, booking)
│   ├── fsm.ts            # State machine transitions
│   ├── booking.ts        # Availability check + create
│   └── ledger.ts         # Transaction helpers
├── actions/              # Server Actions
└── i18n/                 # Internationalization config
```
