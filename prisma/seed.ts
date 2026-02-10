import { PrismaClient, UserRole, GarmentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding MeeSai V2 database...");

    // ── Categories ──
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: "dress" },
            update: {},
            create: {
                nameLo: "ຊຸດເດສ",
                nameEn: "Dress",
                icon: "shirt",
                slug: "dress",
                sortOrder: 1,
            },
        }),
        prisma.category.upsert({
            where: { slug: "sinh" },
            update: {},
            create: {
                nameLo: "ສິ້ນ",
                nameEn: "Sinh (Lao Skirt)",
                icon: "palette",
                slug: "sinh",
                sortOrder: 2,
            },
        }),
        prisma.category.upsert({
            where: { slug: "suit" },
            update: {},
            create: {
                nameLo: "ຊຸດສູດ",
                nameEn: "Suit",
                icon: "briefcase",
                slug: "suit",
                sortOrder: 3,
            },
        }),
        prisma.category.upsert({
            where: { slug: "traditional" },
            update: {},
            create: {
                nameLo: "ຊຸດປະເພນີ",
                nameEn: "Traditional",
                icon: "crown",
                slug: "traditional",
                sortOrder: 4,
            },
        }),
        prisma.category.upsert({
            where: { slug: "accessories" },
            update: {},
            create: {
                nameLo: "ເຄື່ອງປະດັບ",
                nameEn: "Accessories",
                icon: "gem",
                slug: "accessories",
                sortOrder: 5,
            },
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

    // ── Users ──
    const passwordHash = await bcrypt.hash("meesai123", 12);

    const admin = await prisma.user.upsert({
        where: { phone: "02099990001" },
        update: {},
        create: {
            name: "Admin MeeSai",
            phone: "02099990001",
            password: passwordHash,
            role: UserRole.ADMIN,
        },
    });

    const staff = await prisma.user.upsert({
        where: { phone: "02099990002" },
        update: {},
        create: {
            name: "Staff Somchai",
            phone: "02099990002",
            password: passwordHash,
            role: UserRole.STAFF,
        },
    });

    const owner = await prisma.user.upsert({
        where: { phone: "02055551001" },
        update: {},
        create: {
            name: "Owner Khamla",
            phone: "02055551001",
            password: passwordHash,
            role: UserRole.OWNER,
        },
    });

    const renter = await prisma.user.upsert({
        where: { phone: "02077772001" },
        update: {},
        create: {
            name: "Renter Noy",
            phone: "02077772001",
            password: passwordHash,
            role: UserRole.RENTER,
        },
    });

    console.log("  ✅ 4 users (admin, staff, owner, renter)");

    // ── Shop (for Owner) ──
    const shop = await prisma.shop.upsert({
        where: { ownerId: owner.id },
        update: {},
        create: {
            nameLo: "ຮ້ານຄຳລາ ແຟຊັ່ນ",
            nameEn: "Khamla Fashion",
            description: "ຊຸດແຟຊັ່ນລະດັບພຣີມຽມ",
            phone: "02055551001",
            ownerId: owner.id,
            isVerified: true,
        },
    });

    console.log("  ✅ 1 shop");

    // ── Sample Garments ──
    const garments = await Promise.all([
        prisma.garment.create({
            data: {
                code: "DRS-001",
                titleLo: "ຊຸດເດສ ສີຄຳ ປະດັບເພັດ",
                titleEn: "Gold Sequin Evening Dress",
                description: "ຊຸດລາຕຣີ ສີຄຳ ປະດັບເພັດ ເໝາະສຳລັບງານລ້ຽງ",
                size: "M",
                color: "Gold",
                colorHex: "#FFD700",
                brand: "MeeSai Premium",
                rentalPrice: 500000,
                deposit: 1500000,
                status: GarmentStatus.AVAILABLE,
                isFeatured: true,
                conditionGrade: "A_PLUS",
                bustMin: 86, bustMax: 90,
                waistMin: 66, waistMax: 70,
                hipMin: 92, hipMax: 96,
                heightMin: 155, heightMax: 170,
                eventThemes: ["GALA", "WEDDING", "BRIDAL_PARTY"],
                bodyTypes: ["STANDARD", "PETITE"],
                backupSizeFee: 50000,
                bufferDays: 2,
                categoryId: categories[0].id,
                shopId: shop.id,
                ownerId: owner.id,
            },
        }),
        prisma.garment.create({
            data: {
                code: "SNH-001",
                titleLo: "ສິ້ນໄໝ ລາຍດອກຄຳ",
                titleEn: "Silk Sinh with Gold Pattern",
                description: "ສິ້ນໄໝແທ້ ທໍດ້ວຍມື ລາຍດອກຄຳ",
                size: "FREE",
                color: "Red & Gold",
                colorHex: "#C41E3A",
                brand: "Handmade Lao",
                rentalPrice: 300000,
                deposit: 1000000,
                status: GarmentStatus.AVAILABLE,
                isFeatured: true,
                conditionGrade: "A",
                bustMin: 80, bustMax: 100,
                waistMin: 60, waistMax: 85,
                hipMin: 88, hipMax: 108,
                eventThemes: ["WEDDING", "TEMPLE", "GRADUATION"],
                bodyTypes: ["STANDARD", "CURVY", "PLUS_SIZE"],
                backupSizeFee: 30000,
                bufferDays: 1,
                categoryId: categories[1].id,
                shopId: shop.id,
                ownerId: owner.id,
            },
        }),
        prisma.garment.create({
            data: {
                code: "SUT-001",
                titleLo: "ຊຸດສູດ ສີກົມ ທັນສະໄໝ",
                titleEn: "Navy Blue Modern Suit",
                description: "ຊຸດສູດທັນສະໄໝ ເໝາະສຳລັບງານທາງການ",
                size: "L",
                color: "Navy",
                colorHex: "#001F3F",
                brand: "MeeSai Business",
                rentalPrice: 400000,
                deposit: 1200000,
                status: GarmentStatus.AVAILABLE,
                conditionGrade: "B",
                defectNotes: "ມີຮອຍຂີດເລັກໜ້ອຍ ຢູ່ກົ້ນກະເປົ໋າດ້ານຊ້າຍ",
                bustMin: 96, bustMax: 104,
                waistMin: 80, waistMax: 88,
                hipMin: 100, hipMax: 108,
                heightMin: 168, heightMax: 185,
                eventThemes: ["BUSINESS", "GALA", "GRADUATION"],
                bodyTypes: ["STANDARD", "TALL"],
                bufferDays: 1,
                categoryId: categories[2].id,
                shopId: shop.id,
                ownerId: owner.id,
            },
        }),
        prisma.garment.create({
            data: {
                code: "DRS-002",
                titleLo: "ຊຸດເດສ ສີແດງ ເປີດຫຼັງ",
                titleEn: "Red Open-Back Evening Gown",
                description: "ຊຸດລາຕຣີສີແດງ ເປີດຫຼັງ sexy ສະແໜ້ງ",
                size: "S",
                color: "Red",
                colorHex: "#FF0000",
                brand: "MeeSai Premium",
                rentalPrice: 600000,
                deposit: 2000000,
                status: GarmentStatus.AVAILABLE,
                isFeatured: true,
                conditionGrade: "A_PLUS",
                bustMin: 82, bustMax: 86,
                waistMin: 62, waistMax: 66,
                hipMin: 88, hipMax: 92,
                heightMin: 155, heightMax: 168,
                eventThemes: ["GALA", "BRIDAL_PARTY"],
                bodyTypes: ["PETITE", "STANDARD"],
                bufferDays: 2,
                categoryId: categories[0].id,
                shopId: shop.id,
                ownerId: owner.id,
            },
        }),
        prisma.garment.create({
            data: {
                code: "TRD-001",
                titleLo: "ຊຸດປະເພນີ ລາວສົມບູນ",
                titleEn: "Complete Lao Traditional Set",
                description: "ຊຸດປະເພນີສົມບູນ ສິ້ນ+ເສື້ອ+ສະໄບ ສຳລັບງານບຸນ",
                size: "M",
                color: "Pink & Gold",
                colorHex: "#FFB6C1",
                brand: "Lao Heritage",
                rentalPrice: 350000,
                deposit: 1000000,
                status: GarmentStatus.AVAILABLE,
                conditionGrade: "A",
                bustMin: 84, bustMax: 92,
                waistMin: 64, waistMax: 72,
                hipMin: 90, hipMax: 98,
                eventThemes: ["TEMPLE", "WEDDING"],
                bodyTypes: ["STANDARD", "CURVY"],
                bufferDays: 1,
                categoryId: categories[3].id,
                shopId: shop.id,
                ownerId: owner.id,
            },
        }),
    ]);

    console.log(`  ✅ ${garments.length} garments`);

    // ── Garment Images ──
    const imageMap: Record<string, string[]> = {
        "DRS-001": ["/images/garments/gold-sequin-dress.png"],
        "SNH-001": ["/images/garments/silk-sinh-red.png"],
        "SUT-001": ["/images/garments/navy-suit.png"],
        "DRS-002": ["/images/garments/red-evening-gown.png"],
        "TRD-001": ["/images/garments/lao-traditional-pink.png"],
    };

    for (const garment of garments) {
        const urls = imageMap[garment.code] || [];
        for (let i = 0; i < urls.length; i++) {
            await prisma.garmentImage.upsert({
                where: { id: `img-${garment.code}-${i}` },
                update: { url: urls[i], sortOrder: i },
                create: {
                    id: `img-${garment.code}-${i}`,
                    url: urls[i],
                    alt: garment.titleEn,
                    sortOrder: i,
                    garmentId: garment.id,
                },
            });
        }
    }

    console.log(`  ✅ garment images seeded`);

    console.log("\n🎉 Seed complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
