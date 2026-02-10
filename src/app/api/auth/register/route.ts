import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
    phone: z.string().min(10, "เบอร์โทรไม่ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 },
            );
        }

        const { name, phone, password } = parsed.data;

        // Check duplicate phone
        const existing = await prisma.user.findUnique({
            where: { phone },
        });

        if (existing) {
            return NextResponse.json(
                { error: "ເບີໂທນີ້ຖືກໃຊ້ແລ້ວ" },
                { status: 409 },
            );
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                name,
                phone,
                password: hashedPassword,
                role: "RENTER",
            },
        });

        return NextResponse.json(
            { id: user.id, message: "ລົງທະບຽນສຳເລັດ" },
            { status: 201 },
        );
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { error: "ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່" },
            { status: 500 },
        );
    }
}
