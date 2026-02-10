// Hub QC Checklist items — shared between actions.ts and HubActionButtons.tsx
// Separated from "use server" file to comply with Next.js rule:
//   "A 'use server' file can only export async functions"
// ═══════════════════════════════════════════════════

export const HUB_QC_CHECKLIST = [
    "garment_condition",      // สภาพชุดปกติ
    "no_business_card",       // ไม่มีนามบัดร/Line ID แนบมา
    "hygiene_seal",           // ใส่ Hygiene Seal แล้ว
    "correct_size_label",     // ป้ายไซส์ตรงกับ Order
    "packaging_ready",        // แพ็คกล่อง + Return Kit พร้อม
] as const;

export type HubChecklistItem = (typeof HUB_QC_CHECKLIST)[number];
