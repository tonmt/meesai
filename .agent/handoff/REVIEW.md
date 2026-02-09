# 📋 REVIEW — Sprint 4.1: Owner + Admin Dashboard

> MeeSai Director (Reviewer Agent) · 2026-02-09 21:09 · Cycle 1

## Verdict: � REVISE

**ภาพรวม:** Dashboard ทั้ง Owner + Admin ทำได้ยอดเยี่ยม! Architecture ดี, query ใช้ Promise.all, auth guard ครบทุกที่ แต่พบ **1 MUST BUG** ที่ต้องแก้

---

## 🔴 MUST FIX (1 item)

### MUST #1: `getWalletBalance()` — userId vs walletId confusion

**ไฟล์:** `src/actions/owner.ts` Line 45 + 168

```typescript
// ❌ ปัจจุบัน — ส่ง userId ให้ function ที่ต้องการ walletId
const balance = await getWalletBalance(session.user.id) // L45
const balance = await getWalletBalance(session.user.id) // L168
```

แต่ `ledger.ts` L20:
```typescript
export async function getWalletBalance(walletId: string): Promise<number> {
    // ↑ parameter ชื่อ walletId ไม่ใช่ userId
    const [incoming, outgoing] = await Promise.all([
        prisma.transaction.aggregate({
            where: { destWalletId: walletId }, // ← ใช้เป็น walletId
```

**ปัญหา:** userId ≠ walletId — balance จะ return 0 ตลอด เพราะไม่มี wallet ที่ id ตรงกับ userId

**แก้ไข:**
```typescript
// ✅ ควรใช้ wallet.id
const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } })
const balance = wallet ? await getWalletBalance(wallet.id) : 0
```

หรือสร้าง helper `getWalletBalanceByUserId(userId: string)` ใน `ledger.ts`

> ⚠️ **Impact:** Owner เห็น balance = 0 ตลอดแม้มีเงินเข้ามาจริง + payout balance check L168 จะผิดพลาด (อาจ reject ทั้งที่มีเงินพอ)

---

## 🎩 Executive Review — ✅ ผ่าน (ยกเว้น MUST #1)

### Owner Dashboard ✅
- **4 tabs ครบ:** Overview, My Items, Bookings, Wallet
- **Revenue summary:** totalEarnings จาก RENTAL_PAYMENT ✅
- **Payout request:** atomic `$transaction` (payout record + debit transaction) ✅
- **Role guard:** OWNER + ADMIN ✅

### Admin Dashboard ✅
- **7 stats ใน 1 `Promise.all`** — efficient query model ✅
- **Platform Revenue:** SUM ของ SERVICE_FEE ✅ (ถูก — platform ได้แค่ service fee ไม่ใช่ rental)
- **Role guard:** ADMIN only ✅ (ทั้ง page + ทุก action)
- **Pagination:** Admin bookings + transactions ✅

### Security ✅
- Owner page: `OWNER || ADMIN` → redirect ✅
- Admin page: `ADMIN` only → redirect ✅
- Every action: `auth()` guard + role check ✅
- Payout: `$transaction` atomic ✅

## 🧢 Owner Review — 🟡 ต้องแก้ MUST #1
- **Stats cards ดี** — แต่ balance จะแสดง 0 เพราะ bug
- **Payout flow ดี** — แต่ balance check จะ fail เพราะ bug เดียวกัน
- **Transaction history ดี** — ใช้ wallet.id ถูกต้องที่ L100

## 👒 Admin Review — ✅ ผ่าน
- Users table มีข้อมูลครบ: name, phone, role badge, item count, booking count
- Revenue log แสดง transaction type + amount + owner/renter connection
- Stats cards 7 metrics ครบ

---

## สรุป

| # | Item | Severity | Status |
|:--|:-----|:---------|:-------|
| 1 | `getWalletBalance(userId)` → ต้องเป็น `getWalletBalance(walletId)` | 🔴 MUST | ❌ ต้องแก้ |

**แก้ MUST #1 แล้วส่งกลับ — ไม่ต้อง rewrite ทั้งหมด แค่แก้ 2 จุดใน `owner.ts`**
