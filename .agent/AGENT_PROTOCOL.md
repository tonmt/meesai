# 🔄 MeeSai Dual-Agent Protocol v3

> Coder Agent ↔ Reviewer Agent Communication Standard
> Updated: 2026-02-09 · Based on 14+ sprint production experience

## Architecture

```
┌─────────────┐    .agent/handoff/     ┌──────────────┐
│ CODER AGENT │ ──── DONE.md ────────▸ │REVIEWER AGENT│
│  (Tab 1)    │ ◂── REVIEW.md ─────── │   (Tab 2)    │
│             │                        │  🎩 Executive│
│ Implements  │    .agent/status.json  │  🧢 Renter   │
│ code        │ ◂──────────────────▸   │  👒 Owner    │
└─────────────┘                        └──────────────┘
```

## File Structure

```
meesai/.agent/
├── AGENT_PROTOCOL.md        # ← เอกสารนี้ (v3)
├── status.json              # สถานะปัจจุบัน + sprint history
└── handoff/
    ├── DONE.md              # Coder → Reviewer (ส่งมอบงาน)
    └── REVIEW.md            # Reviewer → Coder (ส่ง feedback)
```

---

## 1. `status.json` — Agent State

```json
{
  "turn": "coder",
  "sprint": "7.0",
  "feature": "Final Polish + Error Handling",
  "lastUpdate": "2026-02-09T23:12:00+07:00",
  "cycle": 0,
  "lastVerdict": "APPROVED",
  "directorNote": "Sprint 6.2 APPROVED! ต่อ 7.0...",
  "history": [
    { "sprint": "6.2", "verdict": "APPROVED", "date": "2026-02-09" },
    { "sprint": "6.1", "verdict": "APPROVED", "date": "2026-02-09" }
  ]
}
```

| Field | Type | Description |
|:---|:---|:---|
| `turn` | `"coder"` \| `"reviewer"` \| `"complete"` | ใครควรทำงานตอนนี้ |
| `sprint` | string | Sprint ปัจจุบัน |
| `feature` | string | ชื่อ feature ที่ทำ |
| `lastUpdate` | ISO datetime | เวลาอัพเดทล่าสุด |
| `cycle` | number | รอบ review (0 = ยังไม่ส่ง, 1+ = ส่งแล้ว) |
| `lastVerdict` | `"APPROVED"` \| `"REVISE"` \| `"REJECT"` \| `"PENDING"` | ผลตัดสินล่าสุด |
| `directorNote` | string | คำสั่งจาก Director (user) สำหรับ sprint ถัดไป |
| `history` | array | ประวัติ sprint ที่ผ่านมา (append-only) |

### Turn States

| State | Meaning | Who acts? |
|:---|:---|:---|
| `"coder"` | Coder ต้องทำงาน (implement / fix feedback) | Coder Agent |
| `"reviewer"` | Reviewer ต้อง review | Reviewer Agent |
| `"complete"` | Sprint/Phase จบแล้ว รอ Director สั่งต่อ | **Coder Agent** — ถ้ามี `directorNote` → เริ่ม sprint ใหม่อัตโนมัติ |

> ⚠️ **`turn: "complete"` ไม่ใช่ dead-end** — Coder จะรับคำสั่งจาก `directorNote` แล้วเริ่ม sprint ใหม่เอง
> Reviewer เจอ `turn: "complete"` → ไม่มีอะไรให้ review → แจ้ง user ให้ไป `/coder-loop`

---

## 2. `DONE.md` — Coder → Reviewer

**Template:**

```markdown
# ✅ DONE — Sprint X.Y: [Feature Name]

> Coder Agent · [datetime] · Cycle [N]

---

## สรุปสิ่งที่ทำ
[สรุปชัดเจน แบ่งเป็น section ถ้ามีหลาย feature]

## ไฟล์ที่เปลี่ยน

| File | Change |
|:---|:---|
| `path/to/file` | [NEW] / [MODIFY] / [DELETE] description |

## Verification Checklist (Coder ทำแล้ว)
- [x] `npm run build` — ผ่าน (X routes, 0 errors)
- [x] `docker compose up -d --build app` — deployed
- [x] `git add -A && git commit` — committed
- [x] ทดสอบ basic flow ผ่าน

## ขอให้ Review
- [ ] 🎩 Business: [คำถาม]
- [ ] 🧢 UX: [คำถาม]
- [ ] 👒 Owner: [คำถาม]

## Test Credentials

| Role | Phone | Password |
|:---|:---|:---|
| Admin | 02099990001 | meesai123 |
| Owner | 02088881001 | meesai123 |
| Renter | 02077772001 | meesai123 |
| Staff | 02066660001 | meesai123 |

## Live URL
https://meesai.vgroup.work
```

---

## 3. `REVIEW.md` — Reviewer → Coder

**Template:**

```markdown
# 📋 REVIEW — Sprint X.Y: [Feature Name]

> MeeSai Director (Reviewer Agent) · [datetime] · Cycle [N]

## Verdict: 🟢 APPROVED / 🟡 REVISE / 🔴 REJECT

---

## 🎩 Executive Review — ✅/⚠️/❌
[ประเมิน business value, revenue impact, scalability]

## 🧢 Renter/UX Review — ✅/⚠️/❌
[ประเมิน UX, คลิกง่าย, สวยงาม, responsive]

## 👒 Owner Review — ✅/⚠️/❌
[ประเมิน จัดการง่าย, รายได้ชัด, ระบบถูกต้อง]

## Priority Actions
1. 🔴 **MUST** — [ต้องแก้ก่อน deploy]
2. 🟡 **SHOULD** — [ควรแก้ใน sprint นี้]
3. 🟢 **NICE** — [ย้ายไป backlog ได้]

## Files to Review (ถ้ามี)
- `path/to/file` line X: [ปัญหา]
```

---

## 4. Workflow Loop

```
  ┌──────────────────────────────────────────────────────┐
  │                   CODER TURN                          │
  │  1. Kill hung git processes                          │
  │  2. Read status.json → check turn                    │
  │  3. If REVIEW.md exists → fix feedback               │
  │     If no REVIEW.md → start new sprint               │
  │  4. Implement code                                   │
  │  5. npm run build (MUST pass)                        │
  │  6. docker compose up -d --build app                 │
  │  7. git add -A && git commit                         │
  │  8. Write DONE.md                                    │
  │  9. Delete REVIEW.md (if exists)                     │
  │ 10. Update status.json (turn→reviewer, cycle+1)      │
  └─────────────────────┬────────────────────────────────┘
                        ▼
  ┌──────────────────────────────────────────────────────┐
  │                  REVIEWER TURN                        │
  │  1. Read status.json → check turn                    │
  │  2. Read DONE.md                                     │
  │  3. Review code files listed                         │
  │  4. Test on live URL (if applicable)                 │
  │  5. Write REVIEW.md with verdict                     │
  │  6. Delete DONE.md                                   │
  │  7. Update status.json (turn→coder, lastVerdict)     │
  │  8. Append to history[]                              │
  └─────────────────────┬────────────────────────────────┘
                        ▼
              ┌─────────────────┐
              │    Verdict?      │
              └────┬────┬───┬───┘
         APPROVED  │    │   │ REJECT
                   │ REVISE │
                   ▼    ▼   ▼
              Next   Fix   Redesign
              Sprint  ↑     ↑
                      └─────┘
                   Back to CODER
```

## 5. Fast-Track Mode (Director Override)

เมื่อ User (Director) ต้องการข้าม Reviewer:

1. User **ลบ DONE.md** ด้วยตนเอง
2. User **แก้ status.json** ตั้ง `turn: "coder"` + `lastVerdict: "APPROVED"` + sprint ใหม่ + `directorNote`
3. Coder เห็น `turn: "coder"` + ไม่มี `REVIEW.md` → **เริ่ม sprint ใหม่ตาม directorNote**

> ⚠️ Fast-track ใช้เมื่อ Director มั่นใจ — ไม่ต้องรอ Reviewer

---

## 6. Rules

### 🔧 Coder Agent Rules
1. **Git Hygiene First** — ก่อนเริ่มงาน ต้อง kill hung git processes + rm index.lock
2. **Check turn** — อ่าน `status.json` ก่อนทุกครั้ง ถ้า turn ≠ coder → รอ
3. **REVIEW.md First** — ถ้ามี REVIEW.md → อ่าน + แก้ feedback ก่อนเริ่มงานใหม่
4. **Priority Order** — 🔴 MUST → 🟡 SHOULD → 🟢 NICE (ย้าย backlog)
5. **Build Gate** — `npm run build` ต้อง **ผ่านก่อนส่ง** DONE.md (0 errors)
6. **Deploy Gate** — `docker compose up -d --build app` ต้องสำเร็จ
7. **Git Gate** — `git add -A && git commit` ต้องสำเร็จ (kill zombie first)
8. **DONE.md Quality** — ต้องมี Verification Checklist ที่ checked ทุกข้อ
9. **Atomic Handoff** — เขียน DONE.md → ลบ REVIEW.md → อัพเดท status.json (3 steps ต่อเนื่อง)
10. **No Stale State** — ถ้า cycle > 3 → แจ้ง user ว่า sprint นี้ติด loop

### 🔍 Reviewer Agent Rules
1. **Check turn** — อ่าน `status.json` ก่อนทุกครั้ง ถ้า turn ≠ reviewer → รอ
2. **Read DONE.md** — อ่าน → ดูโค้ด → ทดสอบ live URL (ถ้ามี)
3. **3-Hat Review** — ต้อง review จาก 🎩 Executive, 🧢 Renter, 👒 Owner ทุกครั้ง
4. **Verdict Required** — ต้องให้ 🟢 / 🟡 / 🔴 ทุก review
5. **Priority Actions** — ถ้า 🟡 REVISE → ต้องมี Priority Actions ที่ชัดเจน
6. **Atomic Handoff** — เขียน REVIEW.md → ลบ DONE.md → อัพเดท status.json + history
7. **Code Reading** — ต้องอ่านไฟล์สำคัญจริง (ไม่ใช่แค่ trust DONE.md)
8. **Fast fail** — ถ้า build ไม่ผ่านหรือ deploy ไม่ได้ → 🔴 REJECT ทันที

### 🤝 Shared Rules
- อ่าน `status.json` **ก่อนเริ่มทำงานทุกครั้ง** — ไม่มีข้อยกเว้น
- ถ้า `turn` ไม่ใช่ของตัวเอง → **รอ + แจ้ง user**
- ถ้า DONE.md + REVIEW.md **มีพร้อมกัน** → conflict → ให้ user ตัดสิน
- ถ้า turn ค้างเกิน 5 นาทีแบบไม่มีงาน → แจ้ง user ให้ตรวจสอบ

---

## 7. Sprint History Format

เมื่อ Reviewer ให้ verdict จะ append เข้า `history[]` ใน status.json:

```json
{
  "sprint": "7.0",
  "verdict": "APPROVED",
  "date": "2026-02-09",
  "summary": "Error boundaries + Loading skeletons + SEO"
}
```

ช่วยให้เห็นภาพรวมว่า project ผ่านมาแล้วกี่ sprint อะไรบ้าง
