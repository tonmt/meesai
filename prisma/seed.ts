import { PrismaClient, AssetGrade, AssetStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const DEFAULT_PASSWORD = bcrypt.hashSync('meesai123', 12)

async function main() {
    console.log('🌱 Seeding MeeSai database...')

    // ─── System Config ───
    const configs = [
        { key: 'BUFFER_DAYS', value: '3', note: 'จำนวนวันเผื่อซักอบรีดหลังคืนชุด' },
        { key: 'SERVICE_FEE_PERCENT', value: '15', note: 'เปอร์เซ็นต์ค่าบริการจากค่าเช่า' },
        { key: 'DEPOSIT_PERCENT', value: '30', note: 'เปอร์เซ็นต์มัดจำจากราคาซื้อ' },
    ]
    for (const cfg of configs) {
        await prisma.systemConfig.upsert({
            where: { key: cfg.key },
            update: { value: cfg.value, note: cfg.note },
            create: cfg,
        })
    }
    console.log('  ✅ SystemConfig: 3 entries')

    // ─── Users ───
    const admin = await prisma.user.upsert({
        where: { phone: '02099990001' },
        update: {},
        create: { name: 'Admin MeeSai', phone: '02099990001', email: 'admin@meesai.la', password: DEFAULT_PASSWORD, role: 'ADMIN' },
    })
    const staff = await prisma.user.upsert({
        where: { phone: '02099990002' },
        update: {},
        create: { name: 'Staff Noy', phone: '02099990002', password: DEFAULT_PASSWORD, role: 'STAFF' },
    })
    const owner1 = await prisma.user.upsert({
        where: { phone: '02055551001' },
        update: {},
        create: { name: 'ນາງ ສົມພອນ', phone: '02055551001', email: 'somphone@gmail.com', password: DEFAULT_PASSWORD, role: 'OWNER' },
    })
    const owner2 = await prisma.user.upsert({
        where: { phone: '02055551002' },
        update: {},
        create: { name: 'ນາງ ວິໄລ', phone: '02055551002', password: DEFAULT_PASSWORD, role: 'OWNER' },
    })
    const owner3 = await prisma.user.upsert({
        where: { phone: '02055551003' },
        update: {},
        create: { name: 'ທ. ພູວົງ', phone: '02055551003', password: DEFAULT_PASSWORD, role: 'OWNER' },
    })
    const renter1 = await prisma.user.upsert({
        where: { phone: '02077772001' },
        update: {},
        create: { name: 'ນາງ ແກ້ວ', phone: '02077772001', password: DEFAULT_PASSWORD, role: 'RENTER' },
    })
    const renter2 = await prisma.user.upsert({
        where: { phone: '02077772002' },
        update: {},
        create: { name: 'ນາງ ດາວ', phone: '02077772002', password: DEFAULT_PASSWORD, role: 'RENTER' },
    })
    const renter3 = await prisma.user.upsert({
        where: { phone: '02077772003' },
        update: {},
        create: { name: 'ທ. ສົມຈິດ', phone: '02077772003', password: DEFAULT_PASSWORD, role: 'RENTER' },
    })
    const renter4 = await prisma.user.upsert({
        where: { phone: '02077772004' },
        update: {},
        create: { name: 'ນາງ ນ້ອຍ', phone: '02077772004', password: DEFAULT_PASSWORD, role: 'RENTER' },
    })
    const renter5 = await prisma.user.upsert({
        where: { phone: '02077772005' },
        update: {},
        create: { name: 'ນາງ ຈັນ', phone: '02077772005', password: DEFAULT_PASSWORD, role: 'RENTER' },
    })
    console.log('  ✅ Users: 1 Admin, 1 Staff, 3 Owners, 5 Renters')

    // ─── Wallets for Owners ───
    for (const owner of [owner1, owner2, owner3]) {
        await prisma.wallet.upsert({
            where: { userId: owner.id },
            update: {},
            create: { userId: owner.id },
        })
    }
    console.log('  ✅ Wallets: 3 Owner wallets')

    // ─── Categories ───
    const categories = [
        { nameLo: 'ງານດອງ', nameEn: 'Wedding', icon: '💒', slug: 'wedding', sortOrder: 1 },
        { nameLo: 'ງານບຸນ', nameEn: 'Traditional', icon: '🙏', slug: 'traditional', sortOrder: 2 },
        { nameLo: 'ງານລາຕຣີ', nameEn: 'Gala Night', icon: '✨', slug: 'gala', sortOrder: 3 },
        { nameLo: 'ສູດ/ທັກຊິໂດ້', nameEn: 'Suit & Tuxedo', icon: '🤵', slug: 'suits', sortOrder: 4 },
        { nameLo: 'ເສື້ອໜາວ', nameEn: 'Winter Wear', icon: '🧥', slug: 'winter', sortOrder: 5 },
        { nameLo: 'ເຄື່ອງປະດັບ', nameEn: 'Accessories', icon: '💎', slug: 'accessories', sortOrder: 6 },
    ]
    const catMap: Record<string, string> = {}
    for (const cat of categories) {
        const c = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { nameLo: cat.nameLo, nameEn: cat.nameEn, icon: cat.icon },
            create: cat,
        })
        catMap[cat.slug] = c.id
    }
    console.log('  ✅ Categories: 6')

    // ─── Products + ItemAssets ───
    const products = [
        // Wedding (5 products)
        { titleLo: 'ຊຸດແຕ່ງດອງ Vera Wang Inspired', titleEn: 'Vera Wang Inspired Wedding Gown', category: 'wedding', rentalPrice: 2500000, buyPrice: 15000000, size: 'M', color: 'ຂາວ', brand: 'MeeSai Collection', owner: owner1.id, grade: 'A' as AssetGrade, assetCode: 'WED-001' },
        { titleLo: 'ຊຸດສິ້ນທອງລາວ ແບບດັ້ງເດີມ', titleEn: 'Traditional Lao Sin Thong', category: 'wedding', rentalPrice: 1800000, buyPrice: 12000000, size: 'S', color: 'ທອງ', brand: 'ຜ້າໄໝລາວ', owner: owner1.id, grade: 'A' as AssetGrade, assetCode: 'WED-002' },
        { titleLo: 'ຊຸດເຈົ້າສາວ Mermaid Cut', titleEn: 'Mermaid Cut Bridal Dress', category: 'wedding', rentalPrice: 3000000, buyPrice: 20000000, size: 'M', color: 'ງາຊ້າງ', brand: 'Pronovias Style', owner: owner2.id, grade: 'A' as AssetGrade, assetCode: 'WED-003' },
        { titleLo: 'ຊຸດເຈົ້າບ່າວ ສີຄຣີມ', titleEn: 'Cream Groom Suit', category: 'wedding', rentalPrice: 1200000, buyPrice: 8000000, size: 'L', color: 'ຄຣີມ', brand: 'Hugo Boss Style', owner: owner3.id, grade: 'A' as AssetGrade, assetCode: 'WED-004' },
        { titleLo: 'ຊຸດ Bridesmaid ສີຊົມພູ', titleEn: 'Pink Bridesmaid Dress', category: 'wedding', rentalPrice: 800000, buyPrice: 5000000, size: 'S', color: 'ຊົມພູ', brand: 'MeeSai Collection', owner: owner1.id, grade: 'B' as AssetGrade, assetCode: 'WED-005' },

        // Traditional (3 products)
        { titleLo: 'ຊຸດສິ້ນລາວ ຜ້າໄໝແທ້', titleEn: 'Authentic Lao Silk Sin', category: 'traditional', rentalPrice: 1500000, buyPrice: 10000000, size: 'M', color: 'ແດງ', brand: 'ຜ້າໄໝລາວ', owner: owner2.id, grade: 'A' as AssetGrade, assetCode: 'TRD-001' },
        { titleLo: 'ຊຸດນຸ່ງລາວ ງານບຸນ', titleEn: 'Lao Ceremony Outfit', category: 'traditional', rentalPrice: 1000000, buyPrice: 7000000, size: 'L', color: 'ທອງ', brand: 'ແມ່ຄ້າ', owner: owner1.id, grade: 'A' as AssetGrade, assetCode: 'TRD-002' },
        { titleLo: 'ຊຸດພື້ນເມືອງ ຜູ້ຊາຍ', titleEn: 'Traditional Men Outfit', category: 'traditional', rentalPrice: 800000, buyPrice: 5000000, size: 'XL', color: 'ຂາວ', brand: 'ແມ່ຄ້າ', owner: owner3.id, grade: 'B' as AssetGrade, assetCode: 'TRD-003' },

        // Gala (4 products)
        { titleLo: 'ຊຸດລາຕຣີ Versace Style', titleEn: 'Versace Style Evening Gown', category: 'gala', rentalPrice: 3500000, buyPrice: 25000000, size: 'S', color: 'ດຳ', brand: 'Versace Style', owner: owner2.id, grade: 'A' as AssetGrade, assetCode: 'GAL-001' },
        { titleLo: 'ຊຸດລາຕຣີ ສີແດງ Elegant', titleEn: 'Red Elegant Evening Dress', category: 'gala', rentalPrice: 2800000, buyPrice: 18000000, size: 'M', color: 'ແດງ', brand: 'Dior Style', owner: owner1.id, grade: 'A' as AssetGrade, assetCode: 'GAL-002' },
        { titleLo: 'ຊຸດລາຕຣີ ສີນ້ຳເງີນ Royal', titleEn: 'Royal Blue Gala Dress', category: 'gala', rentalPrice: 2200000, buyPrice: 15000000, size: 'M', color: 'ນ້ຳເງີນ', brand: 'MeeSai Premium', owner: owner2.id, grade: 'A' as AssetGrade, assetCode: 'GAL-003' },
        { titleLo: 'ຊຸດລາຕຣີ ປະກາຍເພັດ', titleEn: 'Diamond Sparkle Gown', category: 'gala', rentalPrice: 4000000, buyPrice: 30000000, size: 'S', color: 'ເງິນ', brand: 'Swarovski Style', owner: owner1.id, grade: 'A' as AssetGrade, assetCode: 'GAL-004' },

        // Suits (3 products)
        { titleLo: 'ສູດສີດຳ Classic Fit', titleEn: 'Black Classic Fit Suit', category: 'suits', rentalPrice: 1500000, buyPrice: 10000000, size: 'L', color: 'ດຳ', brand: 'Armani Style', owner: owner3.id, grade: 'A' as AssetGrade, assetCode: 'SUT-001' },
        { titleLo: 'ທັກຊິໂດ້ ສີດຳ Slim', titleEn: 'Black Slim Tuxedo', category: 'suits', rentalPrice: 2000000, buyPrice: 14000000, size: 'M', color: 'ດຳ', brand: 'Tom Ford Style', owner: owner3.id, grade: 'A' as AssetGrade, assetCode: 'SUT-002' },
        { titleLo: 'ສູດສີກາກີ Modern', titleEn: 'Khaki Modern Suit', category: 'suits', rentalPrice: 1200000, buyPrice: 8000000, size: 'L', color: 'ກາກີ', brand: 'Zara Style', owner: owner2.id, grade: 'B' as AssetGrade, assetCode: 'SUT-003' },

        // Winter (3 products)
        { titleLo: 'ເສື້ອໂຄດ Burberry Style', titleEn: 'Burberry Style Coat', category: 'winter', rentalPrice: 1800000, buyPrice: 12000000, size: 'M', color: 'ນ້ຳຕານ', brand: 'Burberry Style', owner: owner1.id, grade: 'A' as AssetGrade, assetCode: 'WIN-001' },
        { titleLo: 'ເສື້ອໜາວ Puffer Jacket', titleEn: 'Premium Puffer Jacket', category: 'winter', rentalPrice: 1200000, buyPrice: 8000000, size: 'L', color: 'ດຳ', brand: 'North Face Style', owner: owner3.id, grade: 'A' as AssetGrade, assetCode: 'WIN-002' },
        { titleLo: 'ຜ້າຄຸມ Cashmere Wrap', titleEn: 'Cashmere Wrap Shawl', category: 'winter', rentalPrice: 600000, buyPrice: 4000000, size: 'Free', color: 'ເທົາ', brand: 'MeeSai Collection', owner: owner2.id, grade: 'A' as AssetGrade, assetCode: 'WIN-003' },

        // Accessories (2 products)
        { titleLo: 'ກະເປົາ Chanel Classic', titleEn: 'Chanel Classic Flap Bag', category: 'accessories', rentalPrice: 2500000, buyPrice: 20000000, size: 'Free', color: 'ດຳ', brand: 'Chanel Style', owner: owner1.id, grade: 'A' as AssetGrade, assetCode: 'ACC-001' },
        { titleLo: 'ເຄື່ອງປະດັບ Set ທອງຄຳ', titleEn: 'Gold Jewelry Set', category: 'accessories', rentalPrice: 1500000, buyPrice: 10000000, size: 'Free', color: 'ທອງ', brand: 'MeeSai Premium', owner: owner2.id, grade: 'A' as AssetGrade, assetCode: 'ACC-002' },
    ]

    let productCount = 0
    let assetCount = 0
    for (const p of products) {
        const product = await prisma.product.upsert({
            where: { id: `seed-${p.assetCode}` },
            update: {},
            create: {
                id: `seed-${p.assetCode}`,
                titleLo: p.titleLo,
                titleEn: p.titleEn,
                images: [],
                rentalPrice: p.rentalPrice,
                buyPrice: p.buyPrice,
                size: p.size,
                color: p.color,
                brand: p.brand,
                categoryId: catMap[p.category],
            },
        })
        productCount++

        // สร้าง ItemAsset 1 ตัวต่อ Product (ในระบบจริงอาจมีหลายตัว)
        await prisma.itemAsset.upsert({
            where: { assetCode: p.assetCode },
            update: {},
            create: {
                assetCode: p.assetCode,
                barcode: `MS-${p.assetCode}`,
                status: AssetStatus.AVAILABLE,
                grade: p.grade,
                productId: product.id,
                ownerId: p.owner,
            },
        })
        assetCount++
    }
    console.log(`  ✅ Products: ${productCount}`)
    console.log(`  ✅ ItemAssets: ${assetCount}`)

    console.log('\n🎉 Seeding complete!')
    console.log('   Total: 10 Users, 6 Categories, 20 Products, 20 Assets, 3 Wallets, 3 Configs')
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
