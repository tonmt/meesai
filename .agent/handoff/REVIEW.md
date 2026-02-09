# 📋 REVIEW — Sprint 3.3: Booking Logic + FSM Engine

> MeeSai Director (Reviewer Agent) · 2026-02-09 20:25 · Cycle 1

## Verdict: 🟡 REVISE

**ภาพรวม:** FSM Engine + Booking Logic โครงสร้างดีมาก แต่มี **2 MUST bugs** ที่ต้องแก้ก่อน — race condition ใน booking flow + ไม่มี authorization check ในการ cancel

---

## 🎩 Executive Review

### ✅ ผ่าน
- **Pillar 1 (Concurrency):** `$transaction` + overlap check + bufferEnd ถูกต้อง
- **Pillar 2 (FSM):** 9 states + valid transition map ครอบคลุมทุก lifecycle
- **Pillar 3 (Inventory):** Booking ผูก `ItemAsset` (assetId) ไม่ใช่ Product — ถูกต้องตามหลัก unique identification
- **Pillar 5 (Audit):** `StatusTransition` log ทุก FSM transition
- **Zod Validation:** `BookingSchema` ใน actions + Lao error messages
- **Auth Guard:** Booking page redirect ไป login ถ้าไม่ได้เข้าสู่ระบบ

### 🔴 Bugs ที่ต้องแก้

**Bug 1: Race Condition — FSM transition อยู่นอก `$transaction`**

`booking.ts` line 131: `transitionAssetStatus()` อยู่ **นอก** `$transaction` ของ booking creation
```
// Line 80-128: prisma.$transaction(async (tx) => { ... })  ← booking สร้างที่นี่
// Line 131: await transitionAssetStatus(...)  ← FSM transition อยู่นอก!
```
**ปัญหา:** ถ้า 2 คนจองพร้อมกัน → ทั้ง 2 ผ่าน overlap check ใน transaction → แต่ asset RESERVE ได้แค่คนเดียว → จอง 2 booking แต่ asset เป็น RESERVED แค่ที booking เดียว

**วิธีแก้:** ย้าย `transitionAssetStatus` logic เข้าไปใน `$transaction` เดียวกัน (ใช้ `tx` แทน `prisma` ใน FSM function) — หรือเพิ่ม `SELECT ... FOR UPDATE` lock บน asset row

**Bug 2: Cancel ไม่มี Authorization Check**

`cancelBookingAction()` (actions/booking.ts line 77-84) — ไม่ตรวจว่า `session.user.id === booking.renterId` → **ใครก็ cancel booking ของคนอื่นได้** ถ้ารู้ bookingId

---

## 🧢 Renter Review

### ✅ ผ่าน
- **2-Step Flow ดีมาก:** ① Check Availability → ② Confirm Booking — ลูกค้าเห็นว่าชุดว่างก่อนจอง ลดความผิดหวัง
- **Price Breakdown ชัดเจน:** ค่าเช่า + Service Fee 10% + Deposit 30% = Total — ไม่มีค่าบริการซ่อน
- **QR Code บน success:** มี QR Code + คำแนะนำ "ໃຊ້ QR ນີ້ ຕອນຮັບຊຸດ" — professional
- **Bilingual ครบ:** ทุก label/error/tooltip มีทั้ง lo/en
- **Deposit refund notice:** "ມັດຈຳຈະຄືນເມື່ອ QC ຜ່ານ" — สร้างความมั่นใจ
- **Auth redirect:** ถ้าไม่ login จะ redirect ไป login page — ดี
- **Quick Book → link to booking page:** ✅ แก้ไขจาก cycle 2

### ⚠️ ควรแก้ไข
1. **QR Code เป็นแค่ text** — `MSB-${nanoid(10)}` แสดงเป็น text ใน gradient box → ควรเป็นรูป QR Code จริง (ใช้ `qrcode` library) — **ย้ายไป Sprint 3.4 ได้** แต่ต้อง plan
2. **ไม่มีหน้า "My Bookings"** — ลูกค้าจองแล้วไม่มีที่ดูรายการจอง → ต้องมี `/bookings` page

---

## 👒 Owner Review

### ✅ ผ่าน
- **Asset protection:** FSM กันไม่ให้ชุด MAINTENANCE/RETIRED ถูกจอง (check `status !== 'AVAILABLE'`)
- **Buffer Days:** 2 วันเผื่อซักอบรีด — ป้องกันชุดถูกจองซ้อน
- **Cancel → AVAILABLE:** ยกเลิกแล้วชุดกลับมาพร้อมเช่าทันที

### ⚠️ ควรแก้ไข
1. **SERVICE_FEE_PERCENT hardcoded = 10** — แต่ SystemConfig มี `SERVICE_FEE_PERCENT: 15` → **ไม่ตรงกัน!** ต้องดึงจาก SystemConfig แทน
2. **BUFFER_DAYS hardcoded = 2** — SystemConfig มี `BUFFER_DAYS: 3` → **ต้องดึงจาก SystemConfig** เหมือนกัน

---

## Priority Actions

1. 🔴 **MUST** — ย้าย FSM transition เข้าไปใน `$transaction` ของ booking creation (ป้องกัน race condition)
2. 🔴 **MUST** — เพิ่ม authorization check ใน `cancelBookingAction`: `booking.renterId === session.user.id` (หรือ ADMIN)
3. 🟡 **SHOULD** — ดึง `SERVICE_FEE_PERCENT` + `BUFFER_DAYS` จาก SystemConfig แทน hardcode (ใช้ `getSystemConfig()` ที่สร้างไว้แล้วแต่ไม่ได้ใช้)
4. 🟡 **SHOULD** — สร้างหน้า "My Bookings" (`/[locale]/bookings`) เพื่อให้ลูกค้าดูรายการจอง
5. 🟢 **NICE** — QR Code เป็นรูปจริง → Sprint 3.4

## Files ที่ต้องแก้

| File | Issue |
|:-----|:------|
| `src/lib/booking.ts` line 131 | FSM transition ต้องอยู่ใน `$transaction` |
| `src/lib/booking.ts` line 14-15 | SERVICE_FEE + BUFFER_DAYS → ดึงจาก SystemConfig |
| `src/actions/booking.ts` line 77-84 | เพิ่ม ownership check ก่อน cancel |
