# 📋 REVIEW — Sprint 3.1 + 3.2: Database Seeding & Authentication

> Reviewer Agent · 2026-02-09 20:05

## Verdict: 🟡 REVISE

---

## 🎩 Executive Review

### ✅ ผ่าน
- **5 Pillars Architecture** — Schema 12 models + 8 enums ครอบคลุมทุก pillar (Booking, FSM, Inventory, Ledger, Audit) ตั้งแต่ Sprint แรก = สถาปัตยกรรมที่พร้อม scale
- **Wallet ไม่มี balance field** — ถูกต้องตาม Double-Entry Ledger (Pillar 4)
- **Booking composite index** — `@@index([assetId, pickupDate, bufferEnd])` พร้อมสำหรับ availability query
- **StatusTransition & EvidenceLog** — Audit trail พร้อมเก็บข้อมูลครบ
- **Auth MVP** — NextAuth v5 + bcrypt + JWT เพียงพอสำหรับ MVP
- **Business Model ถูกต้อง** — Owner 100% rental fee, Platform = service fee

### ⚠️ ต้องแก้ไข
1. **`NEXTAUTH_SECRET` hardcoded** ใน `docker-compose.yml` line 23 — แม้ `.env` จะ gitignored แล้ว แต่ docker-compose อาจ commit ได้ → ต้องเปลี่ยนเป็น `${NEXTAUTH_SECRET}` อ้าง env
2. **AUTH_SECRET vs NEXTAUTH_SECRET** — `.env` ใช้ `AUTH_SECRET` แต่ `docker-compose.yml` ใช้ `NEXTAUTH_SECRET` → อาจ conflict ต้อง standardize เป็นตัวเดียว (NextAuth v5 ใช้ `AUTH_SECRET`)
3. **ไม่มี Zod validation** — `registerUser()` + `loginUser()` ใช้ manual validation → ขัดกับ GEMINI_CONTEXT checklist "ใช้ Zod schema validate ทุก Server Action"

---

## 🧢 Renter Review

### ✅ ผ่าน
- **Login/Register UI** — glassmorphism card สวยงาม, toggle สลับ login/register ราบรื่น
- **Bilingual** — Lao primary + English fallback ถูกต้อง
- **Form UX ดี** — Password show/hide toggle, loading spinner, error/success messages เป็นภาษาลาว
- **Phone format validation** — ตรวจ `020XXXXXXX` แบบลาว ถูกต้อง
- **Registration flow** — สมัคร 4 ช่อง → กด 1 ปุ่ม → สลับไป login = ง่ายดี (3-4 คลิก)
- **Mobile responsive** — Mobile filter bottom sheet + hamburger menu ครบ

### ⚠️ ต้องแก้ไข
1. **หลัง register ไม่ auto-login** — ลูกค้าต้อง login ซ้ำอีกครั้ง → ควร auto-login หลังสมัครเสร็จ (ลดขั้นตอน)
2. **ไม่มี product images** — `images: []` ทุก product → feed ทั้งหมดแสดง Shirt icon placeholder → ลูกค้าไม่อยากเลือกเพราะไม่เห็นรูป
3. **Size/Price filter เป็น shell** — ปุ่ม filter Size + Price Range มี UI แต่ไม่ทำงานจริง → **ห้ามปล่อย non-functional buttons** (ตาม strict rule)
4. **"Quick Book" button ไม่มี action** — `<button>` ไม่มี onClick → ต้องมี destination หรือ disable พร้อม tooltip "Coming in Sprint 4"

---

## 👒 Owner Review

### ✅ ผ่าน
- **Owner role มีใน system** — 3 owners + wallets ถูก seed ครบ
- **Owner 100% rental fee** — schema เก็บ `OWNER_EARNING` transaction type ถูกต้อง
- **ItemAsset ผูก ownerId** — ชุดของเจ้าของแยกชัดเจน
- **Grade system** — A/B/C grading มี ช่วยเจ้าของเข้าใจสภาพชุด
- **Maintenance log** — พร้อมบันทึกประวัติซ่อมบำรุงรายชิ้น

### ⚠️ ต้องแก้ไข
1. **เจ้าของยังไม่มี dashboard** — login แล้วเห็นหน้า landing เหมือน renter → ยังไม่มี "My Assets" view → **ย้ายไป Sprint ถัดไป** แต่ต้อง plan ไว้
2. **FSM transition function ยังไม่มี** — GEMINI_CONTEXT ระบุ `transitionAssetStatus()` + "ห้าม manual update status field" แต่ยังไม่สร้าง `src/lib/fsm.ts` → **ต้องสร้างก่อน Booking Sprint**

---

## Priority Actions (Coder ต้องทำ)

1. 🔴 **MUST** — แก้ `docker-compose.yml` NEXTAUTH_SECRET ให้อ้าง env variable (`${AUTH_SECRET}`)
2. 🔴 **MUST** — เพิ่ม Zod schema validation ใน `src/actions/auth.ts` (registerUser + loginUser)
3. 🔴 **MUST** — ลบ/disable Size + Price filter ที่ไม่ทำงาน (ห้ามมี non-functional buttons)
4. 🟡 **SHOULD** — ใส่ product images (อย่างน้อย seed placeholder URLs สำหรับ demo)
5. 🟡 **SHOULD** — Auto-login หลัง register สำเร็จ
6. 🟡 **SHOULD** — "Quick Book" button ต้องมี action จริง หรือ disable + tooltip
7. 🟢 **NICE** — Owner dashboard → ย้ายไป Sprint 4+
8. 🟢 **NICE** — สร้าง `src/lib/fsm.ts` transition function → ย้ายไป Sprint 3.3 (Booking)

## Files to Review

- `docker-compose.yml` line 23: hardcoded secret — ต้องเปลี่ยนเป็น `${AUTH_SECRET}`
- `src/actions/auth.ts` line 12-67: ไม่มี Zod — ต้องเพิ่ม schema
- `src/components/landing/DynamicFeed.tsx` line 107-111, 119-129: filter UI ไม่ทำงาน
- `src/components/landing/DynamicFeed.tsx` line 201: Quick Book button ไม่มี action
- `prisma/seed.ts` line 153: `images: []` — ไม่มี product images
