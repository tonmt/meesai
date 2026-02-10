import { PrismaClient, UserRole, GarmentStatus, ConditionGrade, EventTheme, BodyType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { OWNERS, SHOPS, GARMENTS } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding MeeSai V2 database...");

    // ── Categories ──
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: "dress" },
            update: {},
            create: { nameLo: "ຊຸດເດສ", nameEn: "Dress", icon: "shirt", slug: "dress", sortOrder: 1 },
        }),
        prisma.category.upsert({
            where: { slug: "sinh" },
            update: {},
            create: { nameLo: "ສິ້ນ", nameEn: "Sinh (Lao Skirt)", icon: "palette", slug: "sinh", sortOrder: 2 },
        }),
        prisma.category.upsert({
            where: { slug: "suit" },
            update: {},
            create: { nameLo: "ຊຸດສູດ", nameEn: "Suit", icon: "briefcase", slug: "suit", sortOrder: 3 },
        }),
        prisma.category.upsert({
            where: { slug: "traditional" },
            update: {},
            create: { nameLo: "ຊຸດປະເພນີ", nameEn: "Traditional", icon: "crown", slug: "traditional", sortOrder: 4 },
        }),
        prisma.category.upsert({
            where: { slug: "accessories" },
            update: {},
            create: { nameLo: "ເຄື່ອງປະດັບ", nameEn: "Accessories", icon: "gem", slug: "accessories", sortOrder: 5 },
        }),
    ]);
    console.log(`  ✅ ${categories.length} categories`);

    // ── System Config ──
    const configs = await Promise.all([
        prisma.systemConfig.upsert({
            where: { key: "BUFFER_DAYS" },
            update: {},
            create: { key: "BUFFER_DAYS", value: "2", note: "Buffer days after return for cleaning" },
        }),
        prisma.systemConfig.upsert({
            where: { key: "SERVICE_FEE_PERCENT" },
            update: {},
            create: { key: "SERVICE_FEE_PERCENT", value: "15", note: "Platform service fee percentage" },
        }),
        prisma.systemConfig.upsert({
            where: { key: "DEFAULT_DEPOSIT_PERCENT" },
            update: {},
            create: { key: "DEFAULT_DEPOSIT_PERCENT", value: "30", note: "Default deposit as % of rental price" },
        }),
    ]);
    console.log(`  ✅ ${configs.length} system configs`);

    // ── Core Users (Admin, Staff, Renter) ──
    const passwordHash = await bcrypt.hash("meesai123", 12);

    const admin = await prisma.user.upsert({
        where: { phone: "02099990001" },
        update: {},
        create: { name: "Admin MeeSai", phone: "02099990001", password: passwordHash, role: UserRole.ADMIN },
    });

    const staff = await prisma.user.upsert({
        where: { phone: "02099990002" },
        update: {},
        create: { name: "Staff Somchai", phone: "02099990002", password: passwordHash, role: UserRole.STAFF },
    });

    // Keep legacy owner for backward compatibility
    const legacyOwner = await prisma.user.upsert({
        where: { phone: "02055551001" },
        update: {},
        create: { name: "Owner Khamla", phone: "02055551001", password: passwordHash, role: UserRole.OWNER },
    });

    const renter = await prisma.user.upsert({
        where: { phone: "02077772001" },
        update: {},
        create: { name: "Renter Noy", phone: "02077772001", password: passwordHash, role: UserRole.RENTER },
    });

    console.log("  ✅ 4 core users (admin, staff, legacy owner, renter)");

    // ── Legacy Shop (Khamla Fashion) ──
    const legacyShop = await prisma.shop.upsert({
        where: { ownerId: legacyOwner.id },
        update: {},
        create: {
            nameLo: "ຮ້ານຄຳລາ ແຟຊັ່ນ", nameEn: "Khamla Fashion",
            description: "ຊຸດແຟຊັ່ນລະດັບພຣີມຽມ", phone: "02055551001",
            ownerId: legacyOwner.id, isVerified: true,
        },
    });

    // ── Legacy Garments (5 originals) ──
    interface LegacyGarment {
        code: string; titleLo: string; titleEn: string; description: string;
        size: string; color: string; colorHex: string; brand: string;
        rentalPrice: number; deposit: number; isFeatured: boolean;
        conditionGrade: ConditionGrade; defectNotes?: string;
        bustMin: number; bustMax: number; waistMin: number; waistMax: number;
        hipMin: number; hipMax: number; heightMin?: number; heightMax?: number;
        eventThemes: EventTheme[]; bodyTypes: BodyType[];
        backupSizeFee?: number; bufferDays: number;
        catIdx: number; image: string;
    }

    const legacyGarments: LegacyGarment[] = [
        { code: "DRS-001", titleLo: "ຊຸດເດສ ສີຄຳ ປະດັບເພັດ", titleEn: "Gold Sequin Evening Dress", description: "ຊຸດລາຕຣີ ສີຄຳ ປະດັບເພັດ ເໝາະສຳລັບງານລ້ຽງ", size: "M", color: "Gold", colorHex: "#FFD700", brand: "MeeSai Premium", rentalPrice: 500000, deposit: 1500000, isFeatured: true, conditionGrade: ConditionGrade.A_PLUS, bustMin: 86, bustMax: 90, waistMin: 66, waistMax: 70, hipMin: 92, hipMax: 96, heightMin: 155, heightMax: 170, eventThemes: ["GALA", "WEDDING", "BRIDAL_PARTY"], bodyTypes: ["STANDARD", "PETITE"], backupSizeFee: 50000, bufferDays: 2, catIdx: 0, image: "/images/garments/gold-sequin-dress.png" },
        { code: "SNH-001", titleLo: "ສິ້ນໄໝ ລາຍດອກຄຳ", titleEn: "Silk Sinh with Gold Pattern", description: "ສິ້ນໄໝແທ້ ທໍດ້ວຍມື ລາຍດອກຄຳ", size: "FREE", color: "Red & Gold", colorHex: "#C41E3A", brand: "Handmade Lao", rentalPrice: 300000, deposit: 1000000, isFeatured: true, conditionGrade: ConditionGrade.A, bustMin: 80, bustMax: 100, waistMin: 60, waistMax: 85, hipMin: 88, hipMax: 108, eventThemes: ["WEDDING", "TEMPLE", "GRADUATION"], bodyTypes: ["STANDARD", "CURVY", "PLUS_SIZE"], backupSizeFee: 30000, bufferDays: 1, catIdx: 1, image: "/images/garments/silk-sinh-red.png" },
        { code: "SUT-001", titleLo: "ຊຸດສູດ ສີກົມ ທັນສະໄໝ", titleEn: "Navy Blue Modern Suit", description: "ຊຸດສູດທັນສະໄໝ ເໝາະສຳລັບງານທາງການ", size: "L", color: "Navy", colorHex: "#001F3F", brand: "MeeSai Business", rentalPrice: 400000, deposit: 1200000, isFeatured: false, conditionGrade: ConditionGrade.B, bustMin: 96, bustMax: 104, waistMin: 80, waistMax: 88, hipMin: 100, hipMax: 108, heightMin: 168, heightMax: 185, eventThemes: ["BUSINESS", "GALA", "GRADUATION"], bodyTypes: ["STANDARD", "TALL"], bufferDays: 1, catIdx: 2, image: "/images/garments/navy-suit.png", defectNotes: "ມີຮອຍຂີດເລັກໜ້ອຍ ຢູ່ກົ້ນກະເປົ໋າດ້ານຊ້າຍ" },
        { code: "DRS-002", titleLo: "ຊຸດເດສ ສີແດງ ເປີດຫຼັງ", titleEn: "Red Open-Back Evening Gown", description: "ຊຸດລາຕຣີສີແດງ ເປີດຫຼັງ sexy ສະແໜ້ງ", size: "S", color: "Red", colorHex: "#FF0000", brand: "MeeSai Premium", rentalPrice: 600000, deposit: 2000000, isFeatured: true, conditionGrade: ConditionGrade.A_PLUS, bustMin: 82, bustMax: 86, waistMin: 62, waistMax: 66, hipMin: 88, hipMax: 92, heightMin: 155, heightMax: 168, eventThemes: ["GALA", "BRIDAL_PARTY"], bodyTypes: ["PETITE", "STANDARD"], bufferDays: 2, catIdx: 0, image: "/images/garments/red-evening-gown.png" },
        { code: "TRD-001", titleLo: "ຊຸດປະເພນີ ລາວສົມບູນ", titleEn: "Complete Lao Traditional Set", description: "ຊຸດປະເພນີສົມບູນ ສິ້ນ+ເສື້ອ+ສະໄບ ສຳລັບງານບຸນ", size: "M", color: "Pink & Gold", colorHex: "#FFB6C1", brand: "Lao Heritage", rentalPrice: 350000, deposit: 1000000, isFeatured: false, conditionGrade: ConditionGrade.A, bustMin: 84, bustMax: 92, waistMin: 64, waistMax: 72, hipMin: 90, hipMax: 98, eventThemes: ["TEMPLE", "WEDDING"], bodyTypes: ["STANDARD", "CURVY"], bufferDays: 1, catIdx: 3, image: "/images/garments/lao-traditional-pink.png" },
    ];

    for (const g of legacyGarments) {
        const garment = await prisma.garment.upsert({
            where: { code: g.code },
            update: {},
            create: {
                code: g.code, titleLo: g.titleLo, titleEn: g.titleEn, description: g.description,
                size: g.size, color: g.color, colorHex: g.colorHex, brand: g.brand,
                rentalPrice: g.rentalPrice, deposit: g.deposit, status: GarmentStatus.AVAILABLE,
                isFeatured: g.isFeatured, conditionGrade: g.conditionGrade,
                defectNotes: g.defectNotes,
                bustMin: g.bustMin, bustMax: g.bustMax, waistMin: g.waistMin, waistMax: g.waistMax,
                hipMin: g.hipMin, hipMax: g.hipMax,
                heightMin: g.heightMin, heightMax: g.heightMax,
                eventThemes: g.eventThemes, bodyTypes: g.bodyTypes,
                ...(g.backupSizeFee !== undefined ? { backupSizeFee: g.backupSizeFee } : {}),
                bufferDays: g.bufferDays,
                categoryId: categories[g.catIdx].id, shopId: legacyShop.id, ownerId: legacyOwner.id,
            },
        });
        await prisma.garmentImage.upsert({
            where: { id: `img-${g.code}-0` },
            update: { url: g.image },
            create: { id: `img-${g.code}-0`, url: g.image, alt: g.titleEn, sortOrder: 0, garmentId: garment.id },
        });
    }
    console.log("  ✅ 1 legacy shop + 5 legacy garments");

    // ══════════════════════════════════════════════
    // NEW: 5 shops × 7 garments = 35 garments
    // ══════════════════════════════════════════════

    // ── New Owners ──
    const newOwners = [];
    for (const o of OWNERS) {
        const user = await prisma.user.upsert({
            where: { phone: o.phone },
            update: {},
            create: { name: o.name, phone: o.phone, password: passwordHash, role: UserRole.OWNER },
        });
        newOwners.push(user);
    }
    console.log(`  ✅ ${newOwners.length} new shop owners`);

    // ── New Shops ──
    const newShops = [];
    for (let i = 0; i < SHOPS.length; i++) {
        const s = SHOPS[i];
        const shop = await prisma.shop.upsert({
            where: { ownerId: newOwners[i].id },
            update: {},
            create: {
                nameLo: s.nameLo, nameEn: s.nameEn, description: s.description,
                phone: s.phone, ownerId: newOwners[i].id, isVerified: s.isVerified,
            },
        });
        newShops.push(shop);
    }
    console.log(`  ✅ ${newShops.length} new shops`);

    // ── New Garments + Images ──
    let garmentCount = 0;
    for (const g of GARMENTS) {
        const garment = await prisma.garment.upsert({
            where: { code: g.code },
            update: {},
            create: {
                code: g.code, titleLo: g.titleLo, titleEn: g.titleEn, description: g.description,
                size: g.size, color: g.color, colorHex: g.colorHex, brand: g.brand,
                rentalPrice: g.rentalPrice, deposit: g.deposit, status: GarmentStatus.AVAILABLE,
                isFeatured: g.isFeatured, conditionGrade: g.conditionGrade,
                defectNotes: g.defectNotes,
                bustMin: g.bustMin, bustMax: g.bustMax, waistMin: g.waistMin, waistMax: g.waistMax,
                hipMin: g.hipMin, hipMax: g.hipMax,
                heightMin: g.heightMin, heightMax: g.heightMax,
                eventThemes: g.eventThemes, bodyTypes: g.bodyTypes,
                ...(g.backupSizeFee !== undefined ? { backupSizeFee: g.backupSizeFee } : {}),
                bufferDays: g.bufferDays,
                categoryId: categories[g.catIdx].id,
                shopId: newShops[g.shopIdx].id,
                ownerId: newOwners[g.shopIdx].id,
            },
        });

        const imageUrl = `/images/garments/${g.image}`;
        await prisma.garmentImage.upsert({
            where: { id: `img-${g.code}-0` },
            update: { url: imageUrl },
            create: {
                id: `img-${g.code}-0`, url: imageUrl, alt: g.titleEn,
                sortOrder: 0, garmentId: garment.id,
            },
        });
        garmentCount++;
    }
    console.log(`  ✅ ${garmentCount} new garments + images`);

    console.log("\n🎉 Seed complete! Total: 6 shops, 40 garments");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
