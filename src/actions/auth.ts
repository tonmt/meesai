'use server'

import bcrypt from 'bcryptjs'
import { signIn } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type AuthResult = {
    success: boolean
    error?: string
}

export async function registerUser(formData: FormData): Promise<AuthResult> {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // ─── Validation ───
    if (!name || !phone || !password) {
        return { success: false, error: 'กະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບ' }
    }

    if (name.length < 2) {
        return { success: false, error: 'ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ' }
    }

    // ตรวจ format เบอร์โทร (020-XXXX-XXXX)
    const phoneClean = phone.replace(/[-\s]/g, '')
    if (!/^020\d{7,8}$/.test(phoneClean)) {
        return { success: false, error: 'ເບີໂທບໍ່ຖືກຕ້ອງ (020XXXXXXX)' }
    }

    if (password.length < 6) {
        return { success: false, error: 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ' }
    }

    if (password !== confirmPassword) {
        return { success: false, error: 'ລະຫັດຜ່ານບໍ່ກົງກັນ' }
    }

    try {
        // ─── Check duplicate ───
        const existing = await prisma.user.findUnique({
            where: { phone: phoneClean },
        })

        if (existing) {
            return { success: false, error: 'ເບີໂທນີ້ມີບັນຊີແລ້ວ' }
        }

        // ─── Create user ───
        const hash = await bcrypt.hash(password, 12)
        await prisma.user.create({
            data: {
                name,
                phone: phoneClean,
                password: hash,
                role: 'RENTER',
            },
        })

        return { success: true }
    } catch (error) {
        console.error('Register error:', error)
        return { success: false, error: 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່' }
    }
}

export async function loginUser(formData: FormData): Promise<AuthResult> {
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string

    if (!phone || !password) {
        return { success: false, error: 'ກະລຸນາກອກເບີໂທ ແລະ ລະຫັດຜ່ານ' }
    }

    const phoneClean = phone.replace(/[-\s]/g, '')

    try {
        await signIn('credentials', {
            phone: phoneClean,
            password,
            redirect: false,
        })

        return { success: true }
    } catch (error) {
        console.error('Login error:', error)
        return { success: false, error: 'ເບີໂທ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' }
    }
}
