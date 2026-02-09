---
description: Coder Agent workflow v3 - อ่าน review + implement + build + deploy + ส่งมอบ (Anti-Dropout)
---

# Coder Agent Workflow v3

// turbo-all

> ⚠️ **CRITICAL: DO NOT STOP until Phase 5 is complete.**
> คุณ **ห้ามหยุด** กลางทาง — ต้องทำจนจบ Phase 5 (Handoff) ทุกครั้ง
> ถ้าทำไม่จบ = ระบบจะค้าง = user ต้องมาแก้เอง = UNACCEPTABLE

---

## Phase 1 — Startup (ทุกครั้ง ข้ามไม่ได้)

1. Kill hung git processes + clean locks
```
cd /mnt/DiskHik/CODE/meesai && kill -9 $(ps aux | grep 'git' | grep -v grep | awk '{print $2}') 2>/dev/null; sleep 1; rm -f .git/index.lock .git/COMMIT_EDITMSG.lock 2>/dev/null; echo "GIT_CLEAN"
```

2. ตรวจสอบ status + handoff directory (ข้ามอ่าน protocol ได้ถ้าอ่านแล้ว)
```
cat /mnt/DiskHik/CODE/meesai/.agent/status.json && echo "---" && ls -la /mnt/DiskHik/CODE/meesai/.agent/handoff/
```

## Phase 2 — Decision (ตัดสินใจภายใน 1 tool call)

3. ถ้า `turn` = `"coder"`:
   - ตรวจว่ามี `REVIEW.md` ไหม:
     - **มี REVIEW.md** → อ่าน → แก้ตาม priority (🔴→🟡→🟢) → ไป Phase 3
     - **ไม่มี REVIEW.md** + `lastVerdict` = `"APPROVED"` → เริ่มงานใหม่ตาม `directorNote` → ไป Phase 3
     - **ไม่มี REVIEW.md** + `lastVerdict` ≠ `"APPROVED"` → อ่าน `directorNote` → ไป Phase 3

4. ถ้า `turn` ≠ `"coder"` → **หยุดเดี๋ยวนั้น** แจ้ง user แล้วจบ:
   > "⏳ `turn` ≠ coder — รอก่อน"

## Phase 3 — Implementation (ทำงานจริง)

5. อ่าน feedback จาก REVIEW.md (ถ้ามี) หรือ directorNote
6. Implement code changes — ทำจนครบ scope ของ sprint
7. ⚠️ **ห้ามแจ้ง user กลางทาง** ถ้ายังไม่ผ่าน Phase 4 — ทำต่อจนจบ

## Phase 4 — Verification Gates (ต้องผ่านทุกข้อ ก่อนไป Phase 5)

8. **Build Gate:**
```
cd /mnt/DiskHik/CODE/meesai && npm run build 2>&1 | tail -20
```
⛔ ถ้า build fail → แก้ error → build ใหม่ → ห้ามไป Phase 5

9. **Deploy Gate:**
```
cd /mnt/DiskHik/CODE/meesai && docker compose up -d --build app 2>&1 | tail -5
```

10. **Git Gate (kill zombie ก่อน):**
```
cd /mnt/DiskHik/CODE/meesai && kill -9 $(ps aux | grep 'git' | grep -v grep | awk '{print $2}') 2>/dev/null; sleep 1; rm -f .git/index.lock 2>/dev/null; git add -A && git commit -m "feat: Sprint X.Y - [summary]"
```

## Phase 5 — Handoff (3 steps ต่อเนื่อง → แล้วจึงแจ้ง user)

> ⚠️ 3 steps นี้ทำต่อเนื่องทันที ห้ามแจ้ง user ก่อนจบ step 13

11. **เขียน** `.agent/handoff/DONE.md` ตาม format ใน protocol
    - ต้องมี **Verification Checklist** ที่ checked ทุกข้อ:
      - [x] `npm run build` ผ่าน
      - [x] `docker compose up` สำเร็จ
      - [x] `git commit` สำเร็จ

12. **ลบ** `.agent/handoff/REVIEW.md` (ถ้ามี)

13. **อัพเดท** `.agent/status.json`:
    - `turn` → `"reviewer"`
    - `cycle` → +1
    - `lastUpdate` → เวลาปัจจุบัน (ISO format)
    - `lastVerdict` → `"PENDING"`

## Phase 6 — Notify User (จุดเดียวที่แจ้ง user)

14. แจ้ง user ว่าทำเสร็จ พร้อมสรุป:
    - ✅ Build / Deploy / Git status
    - สิ่งที่ทำ (สั้นๆ)
    - บอกให้ไป `/reviewer-loop` ใน Tab Reviewer

---

## 🚨 Anti-Dropout Rules (ห้ามฝ่าฝืน)

1. **ห้ามแจ้ง user ก่อน Phase 5 จบ** — ยกเว้น turn ≠ coder
2. **ห้ามหยุดระหว่าง Phase 3-5** — ถ้า build fail ก็แก้แล้ว build ใหม่
3. **ห้ามข้าม Gate** — Build fail = ห้ามไป Deploy, Deploy fail = ห้ามไป Git
4. **Phase 5 ต้องทำ 3 steps ต่อเนื่อง** — DONE.md → rm REVIEW.md → update status.json
5. **ถ้า cycle > 3** → แจ้ง user ว่า sprint ติด loop
6. **ห้ามถาม user ว่า "ทำต่อไหม"** — ทำจนจบ Phase 6 เสมอ

## DONE.md Checklist (ต้องมีครบ)
- สรุปสิ่งที่ทำ (แบ่ง section ชัดเจน)
- ไฟล์ที่เปลี่ยน (table + [NEW]/[MODIFY]/[DELETE])
- Verification Checklist (build/deploy/git — checked)
- ขอให้ Review (checklist 3 หมวก)
- Test Credentials (table)
- Live URL
