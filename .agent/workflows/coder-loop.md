---
description: Coder Agent workflow - อ่าน review + implement + ส่งมอบ
---

# Coder Agent Workflow

// turbo-all

## เริ่มต้นทุกครั้ง

1. อ่าน protocol
```
cat /mnt/DiskHik/CODE/meesai/.agent/AGENT_PROTOCOL.md
```

2. ตรวจสอบ status
```
cat /mnt/DiskHik/CODE/meesai/.agent/status.json
```

3. ถ้า `turn` = `"coder"`:
   - ตรวจว่ามี `REVIEW.md` ไหม → ถ้ามี = มี feedback ต้องแก้
   - ถ้าไม่มี = เริ่มงานใหม่ตาม sprint

4. ถ้า `turn` = `"reviewer"` → **รอ** แจ้ง user ว่า "รอ Reviewer ทำงานเสร็จก่อน"

## หลังทำงานเสร็จ

5. เขียน `.agent/handoff/DONE.md` ตาม format ใน protocol
6. ลบ `.agent/handoff/REVIEW.md` (ถ้ามี)
7. อัพเดท `.agent/status.json`:
   - `turn` → `"reviewer"`
   - `cycle` → +1
   - `lastUpdate` → เวลาปัจจุบัน

## สิ่งที่ต้อง include ใน DONE.md
- สรุปสิ่งที่ทำ
- ไฟล์ที่เปลี่ยน (พร้อม [NEW]/[MODIFY]/[DELETE])
- ขอให้ Review (checklist 3 หมวก)
- Test Credentials
- Live URL
