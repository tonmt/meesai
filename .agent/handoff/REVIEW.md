# 📋 REVIEW — Sprint 4.1 + 4.2: Owner/Admin Dashboard + Staff Panel

> MeeSai Director (Reviewer Agent) · 2026-02-09 21:45 · Cycle 1

## Verdict: 🟡 REVISE

**ภาพรวม:** Staff Panel ทำได้ยอดเยี่ยม! check-in/out flow ถูกต้อง 100% ตาม business logic, ทุก operation ใน `$transaction`, EvidenceLog + StatusTransition ครบทุก Pillar.

**แต่ MUST #1 จาก Cycle ก่อนยังไม่ถูกแก้** — ต้อง REVISE อีกครั้ง

---

## 🔴 MUST FIX (1 item — ค้างจาก Cycle 1)

### MUST #1: `getWalletBalance()` — userId vs walletId confusion

**ไฟล์:** `src/actions/owner.ts`

```typescript
// ❌ Line 45 — ยังส่ง userId (ไม่ใช่ walletId)
const balance = await getWalletBalance(session.user.id)

// ❌ Line 168 — เหมือนกัน
const balance = await getWalletBalance(session.user.id)
```

**ต้องแก้เป็น:**
```diff
// Line 40-50: getOwnerRevenueSummary()
- const balance = await getWalletBalance(session.user.id)
  const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
  })
+ const balance = wallet ? await getWalletBalance(wallet.id) : 0

// Line 154-178: requestPayoutAction()
  const wallet = await prisma.wallet.findUnique({...})
  if (!wallet) return { success: false, error: '...' }
- const balance = await getWalletBalance(session.user.id)
+ const balance = await getWalletBalance(wallet.id)
```

> ⚠️ Bug นี้ทำให้ Owner Wallet แสดง **balance = 0 ตลอด** + Payout request จะ **reject ทุกครั้ง**

---

## ✅ Staff Panel (Sprint 4.2) — ยอดเยี่ยม

### Check-out Flow ✅
```
CONFIRMED → PICKED_UP (booking) + Asset → PICKED_UP
  + StatusTransition (from: RESERVED → to: PICKED_UP)
  + EvidenceLog (type: CHECK_OUT)
```
- Auth guard: STAFF/ADMIN ✅
- Booking validation: status === CONFIRMED ✅
- Asset validation: booking.assetId match ✅
- `$transaction` atomic ✅

### Check-in Flow ✅
```
GOOD path:  PICKED_UP → RETURNED → COMPLETED + Asset → AVAILABLE + Deposit Refund + rentalCount++
DAMAGED path: PICKED_UP → RETURNED + Asset → MAINTENANCE + DamageReport EvidenceLog
```
- Two-path branching (GOOD/DAMAGED) ✅
- Deposit refund inline (ไม่ต้องเรียก ledger.refundDeposit — ยังถูก เพราะอยู่ใน tx เดียวกัน) ✅
- `totalRentals` increment ✅
- หลายครั้ง StatusTransition ใน 1 tx (PICKED_UP → RETURNED → AVAILABLE) ✅

### Today's Schedule ✅
- ดึง CONFIRMED (pickupDate = today) + PICKED_UP (returnDate = today หรือ active ทั้งหมด) ✅

### Security ✅
- ทุก action: `['STAFF', 'ADMIN'].includes(role)` ✅
- Staff page: role guard in page.tsx ✅

---

## Admin + Owner Dashboard — ✅ ผ่าน (ยกเว้น MUST #1)

ตรวจแล้วเหมือน Cycle 1 — โครงสร้างถูกต้อง

---

## สรุป

| # | Item | Severity | Status |
|:--|:-----|:---------|:-------|
| 1 | `getWalletBalance(userId)` → `getWalletBalance(walletId)` | 🔴 MUST | ❌ ยังไม่แก้ (Cycle 1+2) |

**กรุณาแก้ MUST #1 เท่านั้น — ไม่ต้องแก้อย่างอื่น. แก้ 2 บรรทัดใน `owner.ts` แค่นั้นพอ**
