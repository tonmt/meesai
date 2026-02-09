---
description: Coder Agent workflow v3 - อ่าน review + implement + build + deploy + ส่งมอบ (Anti-Dropout)
---

# Coder Agent Workflow v3

// turbo-all

> ⚠️ **CRITICAL: DO NOT STOP until Phase 6 notification is sent.**
> คุณ **ห้ามหยุด** กลางทาง — ต้องทำจนจบ Phase 6 ทุกครั้ง
> ถ้าทำไม่จบ = ระบบจะค้าง = user ต้องมาแก้เอง = UNACCEPTABLE
> **ห้ามถาม user ว่า "ทำต่อไหม" หรือ "ข้ามได้ไหม"** — ทำจนจบเสมอ

---

## Phase 1 — Startup (ทุกครั้ง ข้ามไม่ได้)

1. Kill hung git processes + clean locks
```
cd /mnt/DiskHik/CODE/meesai && kill -9 $(ps aux | grep 'git' | grep -v grep | awk '{print $2}') 2>/dev/null; sleep 1; rm -f .git/index.lock .git/COMMIT_EDITMSG.lock 2>/dev/null; echo "GIT_CLEAN"
```

2. ตรวจสอบ status + handoff directory
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

## Phase 3 — Implementation (ทำงานจริง — ห้ามหยุดกลางทาง)

5. อ่าน feedback จาก REVIEW.md (ถ้ามี) หรือ directorNote
6. วางแผนสิ่งที่ต้องทำทั้งหมด — ถ้ามีหลาย tasks ให้ทำ **ครบทุกข้อ**
7. Implement code changes — ทำจนครบ scope ของ sprint

> ⚠️ **ห้ามแจ้ง user กลางทาง — ทำต่อจนผ่าน Phase 4**
> ⚠️ **ห้ามทำแค่บางส่วน** — ถ้า sprint มี 3 tasks ก็ต้องทำ 3 tasks

## Phase 4 — Verification Gates (ต้องผ่านทุกข้อ ก่อนไป Phase 5)

> ⛔ ทุก Gate ต้องผ่าน — ถ้า fail ห้ามไป Gate ถัดไป ต้องแก้ก่อน

8. **Build Gate:**
```
cd /mnt/DiskHik/CODE/meesai && npm run build 2>&1 | tail -20
```
⛔ ถ้า build fail → แก้ error → build ใหม่ → วน loop จนผ่าน

9. **Deploy Gate:**
```
cd /mnt/DiskHik/CODE/meesai && docker compose up -d --build app 2>&1 | tail -5
```

10. **Git Gate (kill zombie ก่อน):**
```
cd /mnt/DiskHik/CODE/meesai && kill -9 $(ps aux | grep 'git' | grep -v grep | awk '{print $2}') 2>/dev/null; sleep 1; rm -f .git/index.lock 2>/dev/null; git add -A && git commit -m "feat: Sprint X.Y - [summary]"
```

## Phase 5 — Handoff (3 steps ต่อเนื่อง → ห้ามหยุด)

> ⚠️ ทำ 3 steps ต่อเนื่องทันที ห้ามแจ้ง user ก่อนจบ step 5c

5a. **เขียน** `.agent/handoff/DONE.md` ตาม format ด้านล่าง
    - ต้องมี **Verification Checklist** ที่ checked ทุกข้อ

5b. **ลบ** `.agent/handoff/REVIEW.md` (ถ้ามี)

5c. **อัพเดท** `.agent/status.json`:
    - `turn` → `"reviewer"`
    - `cycle` → +1
    - `lastUpdate` → เวลาปัจจุบัน (ISO format)
    - `lastVerdict` → `"PENDING"`

## Phase 6 — Notify User (จุดเดียวที่แจ้ง user ได้)

11. แจ้ง user ว่าทำเสร็จ พร้อมสรุป:
    - ✅ Build / Deploy / Git status
    - สิ่งที่ทำ (สั้นๆ — table format)
    - บอกให้ไป `/reviewer-loop` ใน Tab Reviewer

---

## 🚨 Anti-Dropout Rules (ห้ามฝ่าฝืน)

1. **ห้ามแจ้ง user ก่อน Phase 5 จบ** — ยกเว้น turn ≠ coder
2. **ห้ามหยุดระหว่าง Phase 3-5** — ถ้า build fail ก็แก้แล้ว build ใหม่
3. **ห้ามข้าม Gate** — Build fail = ห้ามไป Deploy, Deploy fail = ห้ามไป Git
4. **Phase 5 ต้องทำ 3 steps ต่อเนื่อง** — DONE.md → rm REVIEW.md → update status.json
5. **ห้ามทำแค่บาง task** — sprint มีกี่ task ก็ต้องทำครบ
6. **ห้ามถาม user ว่า "ทำต่อไหม"** — ทำจนจบ Phase 6 เสมอ
7. **ถ้า cycle > 3** → แจ้ง user ว่า sprint ติด loop

## DONE.md Template (ต้องมีครบทุกข้อ)

```markdown
# ✅ DONE — Sprint X.Y: [Feature Name]

> Coder Agent · [datetime] · Cycle [N]

## สรุปสิ่งที่ทำ
[แบ่ง section ชัดเจน ถ้ามีหลาย feature]

## ไฟล์ที่เปลี่ยน
| File | Change |
|:---|:---|
| `path` | [NEW] / [MODIFY] / [DELETE] description |

## Verification Checklist
- [x] `npm run build` ผ่าน (X routes, 0 errors)
- [x] `docker compose up` สำเร็จ
- [x] `git commit` สำเร็จ

## ขอให้ Review
- [ ] 🎩 Business: [คำถาม]
- [ ] 🧢 UX: [คำถาม]
- [ ] 👒 Owner: [คำถาม]

## Test Credentials
| Role | Phone | Password |
|:---|:---|:---|
| Admin | 02099990001 | meesai123 |

## Live URL
https://meesai.vgroup.work
```
