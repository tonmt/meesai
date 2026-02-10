"use server";

import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════
// AUTOMATED RESPONSE ENGINE
// ดึงข้อมูลจาก Garment/Booking metadata สร้างคำตอบอัตโนมัติ
// ═══════════════════════════════════════════════════

type AutoResponse = {
    response: string;
    confidence: "high" | "medium" | "low";
    source: string;
};

export async function generateAutoResponse(
    ticketId: string,
): Promise<AutoResponse | null> {
    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
            booking: {
                include: {
                    garment: {
                        include: {
                            images: { take: 3, orderBy: { sortOrder: "asc" } },
                            shop: { select: { nameLo: true, district: true } },
                        },
                    },
                },
            },
        },
    });

    if (!ticket) return null;

    const garment = ticket.booking?.garment;
    const booking = ticket.booking;

    switch (ticket.category) {
        // ═══ 📸 PHOTO REQUEST ═══
        case "PHOTO_REQUEST": {
            if (!garment) return fallback("ບໍ່ພົບຂໍ້ມູນສິນຄ້າ");
            const imageCount = garment.images.length;
            if (imageCount === 0) {
                return {
                    response: `ຊຸດ ${garment.titleLo} (${garment.code}) ຍັງບໍ່ມີຮູບຈິງໃນລະບົບ ☁️ ທີມ MeeSai ກຳລັງປະສານຮ້ານຄ້າເພື່ອຖ່າຍຮູບຈິງ ຈະສົ່ງໃຫ້ພາຍໃນ 30 ນາທີ`,
                    confidence: "high",
                    source: "garment.images (empty)",
                };
            }
            return {
                response: `ຊຸດ ${garment.titleLo} (${garment.code}) ມີຮູບຈິງ ${imageCount} ຮູບ ໃນແອັບ 📸\n\nສະພາບ: ${gradeLabel(garment.conditionGrade)} ${garment.defectNotes ? `(${garment.defectNotes})` : "(ບໍ່ມີຕຳນິ)"}\n\nກະລຸນາກົດ "ເບິ່ງລາຍລະອຽດ" ໃນໜ້າສິນຄ້າເພື່ອເບິ່ງຮູບທັງໝົດ`,
                confidence: "high",
                source: `garment.images (${imageCount}), garment.conditionGrade`,
            };
        }

        // ═══ 📏 SIZE INQUIRY ═══
        case "SIZE_INQUIRY": {
            if (!garment) return fallback("ບໍ່ພົບຂໍ້ມູນສິນຄ້າ");
            const hasMeasurements = garment.bustMin || garment.waistMin || garment.hipMin;
            if (!hasMeasurements) {
                return {
                    response: `ຊຸດ ${garment.titleLo} (${garment.code}) ໄຊສ໌: ${garment.size}\n\nຂະໜາດວັດຕົວຈິງຍັງບໍ່ໄດ້ບັນທຶກ ⏳ ທີມ MeeSai ກຳລັງປະສານຮ້ານຄ້າ ຈະວັດ + ສົ່ງຂໍ້ມູນໃຫ້ພາຍໃນ 15 ນາທີ`,
                    confidence: "medium",
                    source: "garment.size (no measurements)",
                };
            }
            const lines: string[] = [
                `📏 ຊຸດ ${garment.titleLo} (${garment.code}) — ໄຊສ໌ ${garment.size}`,
                "",
            ];
            if (garment.bustMin && garment.bustMax) lines.push(`ອົກ: ${garment.bustMin}-${garment.bustMax} ຊມ`);
            if (garment.waistMin && garment.waistMax) lines.push(`ແອວ: ${garment.waistMin}-${garment.waistMax} ຊມ`);
            if (garment.hipMin && garment.hipMax) lines.push(`ສະໂພກ: ${garment.hipMin}-${garment.hipMax} ຊມ`);
            if (garment.heightMin && garment.heightMax) lines.push(`ສ່ວນສູງ: ${garment.heightMin}-${garment.heightMax} ຊມ`);
            if (garment.bodyTypes.length > 0) {
                lines.push(`\nແນະນຳສຳລັບ: ${garment.bodyTypes.map(bodyLabel).join(", ")}`);
            }
            lines.push("\n💡 ຖ້າບໍ່ແນ່ໃຈ ສົ່ງ Size Profile ມາ ເຮົາຊ່ວຍເລືອກໃຫ້!");

            return {
                response: lines.join("\n"),
                confidence: "high",
                source: "garment measurements (bust/waist/hip/height)",
            };
        }

        // ═══ 📅 AVAILABILITY ═══
        case "AVAILABILITY": {
            if (!garment) return fallback("ບໍ່ພົບຂໍ້ມູນສິນຄ້າ");

            const upcomingBookings = await prisma.booking.findMany({
                where: {
                    garmentId: garment.id,
                    status: { notIn: ["CANCELLED", "COMPLETED"] },
                    returnDate: { gte: new Date() },
                },
                orderBy: { pickupDate: "asc" },
                take: 5,
                select: { pickupDate: true, returnDate: true, bufferEnd: true },
            });

            if (upcomingBookings.length === 0) {
                return {
                    response: `✅ ຊຸດ ${garment.titleLo} (${garment.code}) ວ່າງ! ສາມາດຈອງໄດ້ທັນທີ\n\nຄ່າເຊົ່າ: ${garment.rentalPrice.toLocaleString()}₭\nHold ວົງເງິນ: ${garment.deposit.toLocaleString()}₭ (ຄືນ 100% ຫຼັງ QC)`,
                    confidence: "high",
                    source: "booking availability query (no conflicts)",
                };
            }

            const blockedDates = upcomingBookings.map(b => {
                const from = new Date(b.pickupDate).toLocaleDateString("lo-LA", { day: "numeric", month: "short" });
                const to = new Date(b.bufferEnd).toLocaleDateString("lo-LA", { day: "numeric", month: "short" });
                return `  🚫 ${from} → ${to}`;
            }).join("\n");

            return {
                response: `ຊຸດ ${garment.titleLo} (${garment.code}) ມີການຈອງ:\n\n${blockedDates}\n\n📅 ວັນທີ່ນອກເໜືອທີ່ແຈ້ງ ວ່າງຈອງໄດ້! ກະລຸນາແຈ້ງວັນທີ່ຕ້ອງການ`,
                confidence: "high",
                source: `booking calendar (${upcomingBookings.length} bookings)`,
            };
        }

        // ═══ 💳 DEPOSIT QUERY ═══
        case "DEPOSIT_QUERY": {
            const holdAmount = garment ? garment.deposit : booking?.holdAmount || 0;
            const rentalPrice = garment?.rentalPrice || booking?.rentalFee || 0;

            return {
                response: `💳 ລະບົບ Deposit ຂອງ MeeSai:\n\n🔒 Hold ວົງເງິນ: ${holdAmount.toLocaleString()}₭ (ບໍ່ຕັດເງິນຈິງ)\n💰 ຄ່າເຊົ່າ: ${rentalPrice.toLocaleString()}₭\n\n✅ ວິທີເຮັດວຽກ:\n1. ກົດຈອງ → ລະບົບ Hold ວົງເງິນ (ບໍ່ໂອນ)\n2. ຮັບຊຸດ + ໃຊ້ງານ\n3. ຄືນຊຸດ → QC ຜ່ານ\n4. ປົດ Hold ພາຍໃນ 1 ຊມ ✅\n\n🛡️ ປອດໄພກວ່າໂອນມັດຈຳສົດ 100%`,
                confidence: "high",
                source: "garment.deposit + system policy",
            };
        }

        // ═══ 🚚 DELIVERY ═══
        case "DELIVERY": {
            if (!booking) return fallback("ບໍ່ພົບລາຍລະອຽດການຈອງ");

            const statusLabels: Record<string, string> = {
                PENDING: "⏳ ຮໍຢືນຢັນ",
                AWAITING_PAYMENT: "💳 ຮໍຊຳລະ",
                CONFIRMED: "✅ ຢືນຢັນແລ້ວ — ກຳລັງຈັດເຕ",
                AT_HUB: "🏭 ຊຸດຢູ່ Hub — ກຳລັງ QC + ແພັກ",
                SHIPPING: `🚚 ກຳລັງສົ່ງ${booking.trackingCode ? ` — Tracking: ${booking.trackingCode}` : ""}`,
                PICKED_UP: "👕 ລັບແລ້ວ",
                IN_USE: "✨ ກຳລັງໃຊ້ງານ",
                AWAITING_RETURN: "📦 ຮໍຄືນ",
            };

            const statusText = statusLabels[booking.status] || `📋 ${booking.status}`;

            return {
                response: `📦 ສະຖານະ Order #${booking.id.slice(-6)}:\n\n${statusText}\n\n📅 ວັນຮັບ: ${new Date(booking.pickupDate).toLocaleDateString("lo-LA")}\n📅 ວັນຄືນ: ${new Date(booking.returnDate).toLocaleDateString("lo-LA")}\n${booking.trackingCode ? `\n🔗 Tracking: ${booking.trackingCode}` : ""}\n\nມີຄຳຖາມເພີ່ມ? ທີມ MeeSai ພ້ອມຊ່ວຍ 24/7 ☎️`,
                confidence: "high",
                source: "booking.status + tracking",
            };
        }

        // ═══ ⚠️ DAMAGE ═══
        case "DAMAGE": {
            return {
                response: `⚠️ ຮັບແຈ້ງແລ້ວ — ທີມ QC ຈະໂທຫາພາຍໃນ 15 ນາທີ ☎️\n\n🛡️ MeeSai Insurance ຄຸ້ມຄ້ອງ:\n• Damage ≤ 500,000₭ → MeeSai ຮັບ\n• Damage > 500,000₭ → ແບ່ງຄ່າໃຊ້ຈ່າຍ 50/50\n\n📸 ກະລຸນາຖ່າຍຮູບ + ສົ່ງມາ ເພື່ອປະກອບ Claim`,
                confidence: "high",
                source: "damage policy (standard)",
            };
        }

        // ═══ 💬 GENERAL ═══
        default:
            return fallback("ຂໍ້ຄວາມທົ່ວໄປ — ທີມ MeeSai ຈະຕອບພາຍໃນ 5 ນາທີ");
    }
}

function fallback(reason: string): AutoResponse {
    return {
        response: `ຂອບໃຈທີ່ຕິດຕໍ່ MeeSai! ⏱️\n\n${reason}\n\nທີມ Concierge ຈະຕອບລະອຽດພາຍໃນ 5 ນາທີ`,
        confidence: "low",
        source: "fallback",
    };
}

function gradeLabel(grade: string): string {
    const map: Record<string, string> = {
        A_PLUS: "🌟 ເໝືອນໃໝ່",
        A: "✅ ດີຫຼາຍ",
        B: "👍 ດີ (ມີຕຳນິເລັກນ້ອຍ)",
        C: "⚠️ ພໍໃຊ້",
    };
    return map[grade] || grade;
}

function bodyLabel(type: string): string {
    const map: Record<string, string> = {
        STANDARD: "ມາດຕະຖານ",
        CURVY: "ສາວອ້ວບ",
        PETITE: "ຕົວນ້ອຍ",
        TALL: "ສູງ",
        PLUS_SIZE: "ໄຊສ໌ໃຫຍ່",
    };
    return map[type] || type;
}
