'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { signIn } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ─── Zod Schemas ───
const RegisterSchema = z.object({
    name: z.string().min(2, 'ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ'),
    phone: z.string()
        .transform(v => v.replace(/[-\s]/g, ''))
        .pipe(z.string().regex(/^020\d{7,8}$/, 'ເບີໂທບໍ່ຖືກຕ້ອງ (020XXXXXXX)')),
    password: z.string().min(6, 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'ລະຫັດຜ່ານບໍ່ກົງກັນ',
    path: ['confirmPassword'],
})

const LoginSchema = z.object({
    phone: z.string()
        .transform(v => v.replace(/[-\s]/g, ''))
        .pipe(z.string().min(1, 'ກະລຸນາກອກເບີໂທ')),
    password: z.string().min(1, 'ກະລຸນາກອກລະຫັດຜ່ານ'),
})

type AuthResult = {
    success: boolean
    error?: string
}

export async function registerUser(formData: FormData): Promise<AuthResult> {
    // ─── Zod Validation ───
    const raw = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
    }

    const parsed = RegisterSchema.safeParse(raw)
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message }
    }

    const { name, phone, password } = parsed.data

    try {
        // ─── Check duplicate ───
        const existing = await prisma.user.findUnique({
            where: { phone },
        })

        if (existing) {
            return { success: false, error: 'ເບີໂທນີ້ມີບັນຊີແລ້ວ' }
        }

        // ─── Create user ───
        const hash = await bcrypt.hash(password, 12)
        await prisma.user.create({
            data: {
                name,
                phone,
                password: hash,
                role: 'RENTER',
            },
        })

        // ─── Auto-login ───
        try {
            await signIn('credentials', {
                phone,
                password,
                redirect: false,
            })
        } catch {
            // Auto-login failed silently — user can login manually
        }

        return { success: true }
    } catch (error) {
        console.error('Register error:', error)
        return { success: false, error: 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່' }
    }
}

export async function loginUser(formData: FormData): Promise<AuthResult> {
    // ─── Zod Validation ───
    const raw = {
        phone: formData.get('phone') as string,
        password: formData.get('password') as string,
    }

    const parsed = LoginSchema.safeParse(raw)
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message }
    }

    const { phone, password } = parsed.data

    try {
        await signIn('credentials', {
            phone,
            password,
            redirect: false,
        })

        return { success: true }
    } catch (error) {
        console.error('Login error:', error)
        return { success: false, error: 'ເບີໂທ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' }
    }
}
