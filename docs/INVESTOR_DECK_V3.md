# MeeSai (ມີໃສ່) Investor Deck V3 — 2026

> Theme: Modern Luxury Bright (ขาว-ทอง-กรมท่า)
> Status: Strictly Confidential
> Presented By: DDC Groups / V-Group

---

## Slide 1: Title

**MeeSai (ມີໃສ່) — Fashion Bank of Laos**

> "ຢູ່ໃສບໍ່ມີ... ມາພີ້ 'ມີໃສ່'"

แพลตฟอร์มโครงสร้างพื้นฐานแฟชั่นแห่งแรกของ สปป.ลาว ที่เปลี่ยนตู้เสื้อผ้าให้เป็นทรัพย์สินด้วยเทคโนโลยี O2O

---

## Slide 2: Executive Summary

> "เราไม่ได้สร้างร้านเช่าชุด แต่เรากำลังสร้าง 'ธนาคาร' ที่รับฝากชุด และจ่ายดอกเบี้ยเป็นค่าเช่า"

1. **The Problem:** ชุดหรูราคาแพง (Dead Asset) ล้นตู้แต่ไม่ได้ใส่
2. **The Solution:** แพลตฟอร์มกลาง (Infrastructure) ที่รวบรวม Supply ทั่วประเทศ 0% Commission
3. **Business Model:** รายได้จาก Service Fee, Logistics, Insurance, Add-on Services
4. **Current Status:** Phase 2 Complete (Platform Ready) → Phase 3 (Commercial Launch)

---

## Slide 3: Market Pain Points — The "Dead Asset" Crisis

1. **Owner Pain:** เศรษฐีลาวซื้อชุด 10-50 ล้านกีบ ใส่ครั้งเดียวแล้วเก็บจนเก่า มูลค่าเหลือศูนย์
2. **Renter Pain:** ร้านเช่าไม่มีระบบจอง ของน้อย สกปรก ต้อง Walk-in (High Friction)
3. **Trust Issue:** ไม่มีมาตรฐานราคากลาง ไม่มีประกันความเสียหาย → ไม่ไว้วางใจทั้งสองฝ่าย

---

## Slide 4: Platform Solution — O2O Fashion Infrastructure

1. **Smart Catalog:** ค้นหาชุดตาม "ธีมงาน" (งานดอง, งานบุญ) เช็คคิวว่าง Real-time ราคาโปร่งใส
2. **Hospitality Standard:** มาตรฐานระดับโรงแรม 5 ดาว ซัก-อบ-ฆ่าเชื้อ ซีลถุงสุญญากาศ
3. **Vientiane Express:** โลจิสติกส์ รับ-ส่ง ถึงหน้าบ้าน (Door-to-Door) ทั่วนครหลวงเวียงจันทน์

---

## Slide 5: The "Zero GP" Disruptor

**Why 0% Commission?**

1. เพื่อ **Monopolize Supply** ดึงของจากคู่แข่ง
2. เจ้าของชุดไม่มีความเสี่ยง (Zero Cost) = ยิ่งฝากยิ่งได้
3. เปลี่ยนคู่แข่งให้เป็นคู่ค้า (Partners)

| | Others | MeeSai |
|:--|:--|:--|
| **GP** | หัก 30-50% | **หัก 0%** |
| **Owner รับ** | 50-70% | **100%** |

---

## Slide 6: Revenue Streams — 5 Revenue Channels

1. **Service Fee (หลัก):** 15-20% ของยอดเช่า (เก็บจากผู้เช่า On-top)
2. **Delivery Fee:** กำไรจากบริหาร Logistics (Partner กับ Rider)
3. **Insurance:** เบี้ยประกันความเสียหาย (Micro-insurance)
4. **Add-ons:** ห้องลอง VIP, ขายบราปีกนก, สเตย์, ถุงน่อง
5. **Float:** รายได้จากบริหาร Deposit Float

---

## Slide 7: Business Architecture — The 5 Pillars of Trust

1. **Concurrency Booking Logic:** Time-based Locking + Buffer Time อัตโนมัติ
2. **Finite State Machine (FSM):** 9 states ควบคุมสถานะชุด ห้ามลัดขั้นตอน
3. **Unique Inventory ID:** ชุดแบบเดียวกัน 10 ตัว มี 10 Barcode แยกเจ้าของชัดเจน
4. **Double-Entry Ledger:** ระบบบัญชีคู่ ตรวจสอบเส้นทางการเงินทุกกีบ
5. **Immutable Audit Trail:** รูปหลักฐาน (QC) เก็บแบบแก้ไขไม่ได้

---

## Slide 8: Technology Stack

| Component | Technology |
|:--|:--|
| Frontend | Next.js 16 (App Router) + Tailwind CSS v4 |
| Backend | Server Actions + Prisma 6 (Type-safe) |
| Database | PostgreSQL 16 |
| Storage | MinIO (S3 Compatible) |
| Infrastructure | Docker Containerization |

---

## Slide 9: Operational Workflow

### Inbound (รับฝาก)
Concierge รับชุดถึงบ้าน → Screening & QC → ติด RFID/Barcode → ถ่ายรูป Studio + ขึ้นระบบ

### Rental Loop (หมุนเวียน)
ลูกค้าจองผ่าน App → ล็อคคิว + Buffer → Delivery → รับคืน + QC → ส่งซักมาตรฐานโรงแรม

### Financial (การเงิน)
ตัดเงินลูกค้า → แยกกองบัญชีทันที → คำนวณรายได้ Owner Real-time → Auto Payout → คืนมัดจำ 24 ชม.

---

## Slide 10: Strategic Roadmap

| Phase | Timeline | Goals |
|:--|:--|:--|
| **Phase 1: Foundation** | NOW | Web App 2 ภาษา, ระดมชุดเข้าคลัง, ตั้งระบบซัก QC → ระบบเสถียร 100% |
| **Phase 2: Experience** | Q3 2026 | ห้องลอง VIP, Upsell (บรา/เครื่องประดับ), การตลาดงานแต่ง → +30% Ticket Size |
| **Phase 3: Ecosystem** | 2027+ | Owner Portal, Resell Market, ขยายสาขา (ปากเซ/หลวงพระบาง) → ครบวงจร |

---

## Slide 11: Financial Projection — Year 1 Targets

| Metric | Target |
|:--|:--|
| **Break-even Point** | 9 ธุรกรรม/วัน |
| **Monthly Revenue** | 180,000,000 ₭ (50 ตัว/วัน) |
| **Net Profit** | 150,000,000 ₭/เดือน (Margin 80%+) |
| **Annual Profit** | 1.8 Billion LAK |

---

## Slide 12: Why Invest Now?

1. **1st Mover Advantage:** รายแรกในลาวที่มี Tech-driven เต็มรูปแบบ
2. **0% Inventory Risk:** Asset Light — ไม่มีสต็อกจม ไม่มีแฟชั่นตกรุ่น
3. **High Scalability:** ระบบรองรับขยายสาขา + หมวดหมู่ (กระเป๋า, นาฬิกา, รองเท้า) ทันที

---

## Slide 13: Closing

**Join the Revolution**

MeeSai is ready to redefine fashion infrastructure in Vientiane.
เปลี่ยนแฟชั่นให้เป็นเรื่องง่าย และเปลี่ยนตู้เสื้อผ้าให้เป็นเงิน

**DDC Groups / V-Group**
Website: www.meesai.la
