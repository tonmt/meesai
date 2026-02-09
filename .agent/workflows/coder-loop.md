---
description: Coder Agent workflow v2 - อ่าน review + implement + build + deploy + ส่งมอบ
---

# Coder Agent Workflow v2

// turbo-all

## Phase 1 — Startup (ทุกครั้ง)

1. Kill hung git processes + clean locks
```
cd /mnt/DiskHik/CODE/meesai && kill -9 $(ps aux | grep 'git' | grep -v grep | awk '{print $2}') 2>/dev/null; sleep 1; rm -f .git/index.lock .git/COMMIT_EDITMSG.lock 2>/dev/null; echo "GIT_CLEAN"
```

2. อ่าน protocol
```
cat /mnt/DiskHik/CODE/meesai/.agent/AGENT_PROTOCOL.md
```

3. ตรวจสอบ status + handoff directory
```
cat /mnt/DiskHik/CODE/meesai/.agent/status.json && echo "---" && ls -la /mnt/DiskHik/CODE/meesai/.agent/handoff/
```

## Phase 2 — Decision

4. ถ้า `turn` = `"coder"`:
   - ตรวจว่ามี `REVIEW.md` ไหม:
     - **มี REVIEW.md** = มี feedback → อ่าน → แก้ตาม priority (🔴→🟡→🟢)
     - **ไม่มี REVIEW.md** + `lastVerdict` = `"APPROVED"` = เริ่มงานใหม่ตาม `directorNote`
     - **ไม่มี REVIEW.md** + `lastVerdict` ≠ `"APPROVED"` = อ่าน `directorNote` แล้วตัดสินใจ

5. ถ้า `turn` = `"reviewer"` → **หยุด** แจ้ง user:
   > "⏳ `turn: reviewer` — รอ Reviewer ทำงานเสร็จก่อน สั่ง `/reviewer-loop` ใน Tab Reviewer"

## Phase 3 — Implementation

6. อ่าน feedback จาก REVIEW.md (ถ้ามี) หรือ directorNote
7. Implement code changes
8. ❌ ห้ามส่งมอบก่อนผ่าน Phase 4

## Phase 4 — Verification Gates (ต้องผ่านทุกข้อ)

9. Build Gate:
```
cd /mnt/DiskHik/CODE/meesai && npm run build 2>&1 | tail -20
```
⛔ ถ้า build fail → แก้ error ก่อน ห้ามข้ามไป step ถัดไป

10. Deploy Gate:
```
cd /mnt/DiskHik/CODE/meesai && docker compose up -d --build app 2>&1 | tail -5
```

11. Git Gate (kill zombie ก่อน):
```
cd /mnt/DiskHik/CODE/meesai && kill -9 $(ps aux | grep 'git' | grep -v grep | awk '{print $2}') 2>/dev/null; sleep 1; rm -f .git/index.lock 2>/dev/null; git add -A && git commit -m "feat: Sprint X.Y - [summary]"
```

## Phase 5 — Handoff (3 steps ต่อเนื่อง)

12. เขียน `.agent/handoff/DONE.md` ตาม format ใน protocol
    - ต้องมี **Verification Checklist** ที่ checked ทุกข้อ:
      - [x] `npm run build` ผ่าน
      - [x] `docker compose up` สำเร็จ
      - [x] `git commit` สำเร็จ

13. ลบ `.agent/handoff/REVIEW.md` (ถ้ามี)

14. อัพเดท `.agent/status.json`:
    - `turn` → `"reviewer"`
    - `cycle` → +1
    - `lastUpdate` → เวลาปัจจุบัน (ISO format)
    - `lastVerdict` → `"PENDING"`

## Loop Guard

15. ถ้า `cycle` > 3 → แจ้ง user:
    > "⚠️ Sprint นี้วน loop เกิน 3 รอบ — ต้องการให้ Director ตัดสิน"

## DONE.md Checklist (ต้องมีครบ)
- สรุปสิ่งที่ทำ (แบ่ง section ชัดเจน)
- ไฟล์ที่เปลี่ยน (table + [NEW]/[MODIFY]/[DELETE])
- Verification Checklist (build/deploy/git — checked)
- ขอให้ Review (checklist 3 หมวก)
- Test Credentials (table)
- Live URL
