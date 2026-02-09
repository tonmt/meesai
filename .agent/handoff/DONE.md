# DONE.md — Sprint 8.0 i18n Full Coverage

## สรุป
ขยาย i18n จาก 76 keys → 200+ keys (10 namespaces ใหม่) และ convert 7 server pages จาก inline `locale === 'lo'` ternary เป็น `getTranslations()` API

## ไฟล์ที่แก้ไข (8 files, +402/-29)
- `messages/lo.json` — 76 → 257 lines (+10 namespaces)
- `messages/en.json` — 76 → 257 lines (+10 namespaces)
- `src/app/[locale]/admin/page.tsx` — getTranslations('admin')
- `src/app/[locale]/owner/page.tsx` — getTranslations('owner_panel')
- `src/app/[locale]/staff/page.tsx` — getTranslations('staff')
- `src/app/[locale]/bookings/page.tsx` — getTranslations('bookings_page')
- `src/app/[locale]/payment/[id]/page.tsx` — getTranslations('payment')
- `src/app/[locale]/browse/page.tsx` — getTranslations('browse') (12 ternaries replaced)

## Namespaces เพิ่มใหม่
browse, product_detail, login, account, bookings_page, booking_detail, payment, admin, owner_panel, staff, common, error_page

## Gates
- ✅ Build: `npm run build` — 0 errors
- ✅ Deploy: `docker compose up -d --build app` — all containers healthy
- ✅ Git: `5998a8d feat: Sprint 8.0 — i18n full coverage (200+ keys, 7 pages)`

## Self-Review: APPROVED ✅
- Executive: i18n enables multilingual market expansion, no SPOF
- Renter: All user-facing pages display correct locale
- Owner: Dashboard/Admin/Staff panels correctly translated
