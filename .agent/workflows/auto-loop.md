---
description: Autonomous Coder+Reviewer loop — สั่งครั้งเดียว ทำจนเสร็จ (Anti-Dropout)
---

# 🤖 MeeSai Auto-Loop Workflow v1

// turbo-all

> ⚠️ **CRITICAL: สั่งครั้งเดียว ทำจนหยุดเอง**
> คุณทำหน้าที่ทั้ง **Coder** และ **Reviewer** ใน Tab เดียว
> ห้ามหยุดถาม user ระหว่างทาง — ทำจนครบ loop แล้วค่อยสรุปทีเดียว
> หยุดได้เมื่อ: ทำครบ Sprint Limit, ติด REJECT, หรือ cycle > 3

---

## ⚙️ Loop Config

| Setting | Default | คำอธิบาย |
|:---|:---|:---|
| MAX_SPRINTS | 3 | จำนวน sprint สูงสุดต่อ 1 auto-loop |
| MAX_CYCLES | 3 | รอบ revise สูงสุดต่อ sprint (ถ้าเกิน → หยุดถาม user) |
| STOP_ON_REJECT | true | ถ้า self-review ให้ REJECT → หยุดทันที |

---

## Phase 1 — Startup (ทำครั้งเดียวตอนเริ่ม)

1. Kill hung git processes + clean locks
```
cd /mnt/DiskHik/CODE/meesai && kill -9 $(ps aux | grep 'git' | grep -v grep | awk '{print $2}') 2>/dev/null; sleep 1; rm -f .git/index.lock .git/COMMIT_EDITMSG.lock 2>/dev/null; echo "GIT_CLEAN"
```

2. อ่าน status + handoff
```
cat /mnt/DiskHik/CODE/meesai/.agent/status.json && echo "---" && ls -la /mnt/DiskHik/CODE/meesai/.agent/handoff/
```

3. อ่าน Director Input (ถ้ามี → ลบ → รวมเข้า scope)
```
cat /mnt/DiskHik/CODE/meesai/.agent/handoff/DIRECTOR_INPUT.md 2>/dev/null && rm /mnt/DiskHik/CODE/meesai/.agent/handoff/DIRECTOR_INPUT.md 2>/dev/null || echo "NO_DIRECTOR_INPUT"
```

4. อ่าน Business Context
```
cat /mnt/DiskHik/CODE/meesai/docs/GEMINI_CONTEXT.md
```

5. กำหนด Sprint Plan — อ่าน `directorNote` แล้ววางแผน:
   - Sprint ถัดไปทำอะไร?
   - กี่ sprint ควรทำใน loop นี้? (ไม่เกิน MAX_SPRINTS)
   - ถ้า `turn: "complete"` → bump sprint no. อัตโนมัติ (7.1 → 8.0)

---

## 🔄 LOOP START (วนซ้ำจนกว่าจะหยุด)

> ตัวแปร: `sprint_count = 0`, `cycle = 0`

---

### Phase 2 — 🔧 Coder Mode (Implement)

6. อ่าน scope:
   - ถ้ามี REVIEW.md (self-generated) → แก้ตาม Priority Actions (🔴→🟡→🟢)
   - ถ้าไม่มี → ทำตาม directorNote / sprint plan
   - ถ้ามี Director Input → รวมเข้า scope ด้วย

7. Implement code changes — **ทำครบ scope ทั้งหมด ห้ามทำแค่บางส่วน**

8. ⚠️ ห้ามหยุดถาม user — ทำต่อจนจบ Phase 3

### Phase 3 — ✅ Verification Gates

> ⛔ ทุก Gate ต้องผ่าน ถ้า fail → แก้ → ลองใหม่ ห้ามข้าม

9. **Build Gate:**
```
cd /mnt/DiskHik/CODE/meesai && npm run build 2>&1 | tail -20
```
⛔ fail → แก้ → build ใหม่ → วนจนผ่าน

10. **Deploy Gate:**
```
cd /mnt/DiskHik/CODE/meesai && docker compose up -d --build app 2>&1 | tail -5
```

11. **Git Gate:**
```
cd /mnt/DiskHik/CODE/meesai && kill -9 $(ps aux | grep 'git' | grep -v grep | awk '{print $2}') 2>/dev/null; sleep 1; rm -f .git/index.lock 2>/dev/null; git add -A && git commit -m "feat: Sprint X.Y - [summary]"
```

### Phase 4 — 📝 Write DONE.md (บันทึกสิ่งที่ทำ)

12. เขียน `.agent/handoff/DONE.md` ตาม template:
```markdown
# ✅ DONE — Sprint X.Y: [Feature Name]
> Auto-Loop Agent · [datetime] · Sprint [N]/MAX · Cycle [N]

## สรุปสิ่งที่ทำ
[sections]

## ไฟล์ที่เปลี่ยน
| File | Change |
|:---|:---|
| `path` | [NEW]/[MODIFY]/[DELETE] |

## Verification Checklist
- [x] `npm run build` ผ่าน
- [x] `docker compose up` สำเร็จ
- [x] `git commit` สำเร็จ
```

---

### Phase 5 — 🔍 Reviewer Mode (Self-Review)

> ⚠️ **เปลี่ยนหมวก** — ตอนนี้คุณคือ MeeSai Director ไม่ใช่ Coder
> ต้องวิเคราะห์ลึก ห้ามเขียนแค่ "✅ ผ่าน"

13. **อ่านโค้ดจริง** — เปิดอย่างน้อย 3 ไฟล์สำคัญที่เพิ่งแก้
    - ดู logic, error handling, edge cases
    - ตรวจ compliance กับ 5 Technical Pillars

14. **Deep 3-Hat Review:**

#### 🎩 Executive (Revenue, Scalability, Risk)
- ฟีเจอร์นี้ช่วยสร้างรายได้ / ลดต้นทุนอย่างไร?
- สอดคล้องกับ 5 Revenue Channels ไหม?
- ถ้ามี 1,000 คน/วัน จะรองรับได้ไหม?
- มี N+1 query, SPOF, business logic holes ไหม?
- มี TODO/placeholder ที่ต้องทำก่อน launch?

#### 🧢 Renter (UX, Mobile, Trust)
- กี่คลิกจาก browse → booking?
- มี dead-end / loading states / error messages ที่ดีไหม?
- Premium look (ทอง-กรมท่า-ขาว)? Typography?
- Mobile: ปุ่มใหญ่พอ? ข้อความล้นไหม? Bottom nav ปกติไหม?
- ลูกค้ามั่นใจจ่ายเงินไหม? เห็นราคาชัดไหม?

#### 👒 Owner (Dashboard, Inventory, Financial)
- เห็นรายได้ชัดไหม? มี chart ไหม?
- สถานะชุด real-time ไหม? Track ได้ไหม?
- เห็น transaction history? 0% GP ชัดไหม?
- ฝากชุดง่ายไหม? กี่ขั้นตอน?

15. **ตัดสิน Verdict:**
    - 🟢 **APPROVED** — ทุกหมวกผ่าน, ไม่มี critical issues
    - 🟡 **REVISE** — มี issues ต้องแก้ → สร้าง Priority Actions
    - 🔴 **REJECT** — fundamental problem → **หยุด loop ทันที**

### Phase 6 — 🔀 Branch Decision

#### ถ้า 🟢 APPROVED:
16. เขียน `.agent/handoff/REVIEW.md` (audit trail)
17. ลบ `.agent/handoff/DONE.md`
18. อัพเดท `status.json`:
    - Append to `history[]`
    - Bump sprint number
    - Reset cycle = 0
    - เขียน directorNote สำหรับ sprint ถัดไป
19. `sprint_count += 1`
20. **ถ้า `sprint_count < MAX_SPRINTS`** → ลบ REVIEW.md → **วน LOOP กลับ Phase 2**
21. **ถ้า `sprint_count >= MAX_SPRINTS`** → ไป Phase 7 (สรุปจบ)

#### ถ้า 🟡 REVISE:
16. `cycle += 1`
17. **ถ้า `cycle <= MAX_CYCLES`** → สร้าง Priority Actions → **วน LOOP กลับ Phase 2** (แก้ issues)
18. **ถ้า `cycle > MAX_CYCLES`** → ไป Phase 7 (ติด loop, หยุดถาม user)

#### ถ้า 🔴 REJECT:
16. → ไป Phase 7 ทันที (หยุด, ต้อง redesign)

---

## 🔄 LOOP END

---

### Phase 7 — 📊 Summary & Notify (จุดเดียวที่คุยกับ user)

> ⚠️ นี่คือจุดเดียวที่แจ้ง user — สรุปทุกอย่างที่ทำมาทั้ง loop

22. อัพเดท `status.json` ให้ถูกต้อง (turn, sprint, cycle, history)

23. แจ้ง user ด้วยสรุปครบถ้วน:

```markdown
## 🤖 Auto-Loop Summary

### Sprints Completed: X/MAX
| Sprint | Feature | Verdict | Files Changed |
|:---|:---|:---|:---|
| 8.0 | [feature] | 🟢 APPROVED | X files |
| 8.1 | [feature] | 🟢 APPROVED | X files |

### Stop Reason: [ทำครบ MAX_SPRINTS / ติด REJECT / ติด loop cycle > 3]

### Current Status:
- Build: ✅/❌
- Deploy: ✅/❌
- Git: ✅/❌ (X commits ahead)

### Next Sprint (ถ้ามี):
Sprint X.Y: [directorNote ที่วางไว้]

### ถ้าต้องการทำต่อ → สั่ง `/auto-loop` อีกครั้ง
```

---

## 🚨 Anti-Dropout Rules

1. **ห้ามแจ้ง user ก่อน Phase 7** — ยกเว้น fundamental error (เช่น DB down)
2. **ห้ามถาม "ทำต่อไหม"** — loop ตัดสินเอง
3. **ห้ามข้าม Gate** — Build fail = ต้องแก้ก่อน
4. **Self-Review ต้องจริงจัง** — เปลี่ยนหมวกจริงๆ อ่านโค้ดจริงๆ
5. **ห้ามเขียนแค่ "✅ ผ่าน"** — ต้องมี analysis ทุกหมวก
6. **DONE.md + REVIEW.md เขียนทุกรอบ** — เป็น audit trail
7. **sprint_count + cycle ตรวจทุกรอบ** — ป้องกัน infinite loop
8. **Director Input มีความสำคัญสูงสุด** — ถ้าเจอ DIRECTOR_INPUT.md → ปรับ scope ทันที

## ⚡ Quick Reference

```
/auto-loop
  └─ Phase 1: Startup (1x)
       └─ 🔄 LOOP:
            ├─ Phase 2: 🔧 Coder (implement)
            ├─ Phase 3: ✅ Gates (build/deploy/git)
            ├─ Phase 4: 📝 DONE.md
            ├─ Phase 5: 🔍 Self-Review (3-hat deep)
            └─ Phase 6: 🔀 Branch
                 ├─ APPROVED → next sprint → 🔄 LOOP
                 ├─ REVISE → fix → 🔄 LOOP
                 └─ REJECT → STOP
       └─ Phase 7: 📊 Summary (notify user)
```
