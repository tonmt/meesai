'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// ──────────────────────────────────────────
// Get current user profile
// ──────────────────────────────────────────
export async function getUserProfile() {
    const session = await auth()
    if (!session?.user?.id) return null

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            avatar: true,
            createdAt: true,
            _count: {
                select: {
                    bookings: true,
                    assets: true,
                },
            },
        },
    })

    return user
}

// ──────────────────────────────────────────
// Update user profile
// ──────────────────────────────────────────
const updateProfileSchema = z.object({
    name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
    email: z.string().email('อีเมลไม่ถูกต้อง').optional().or(z.literal('')),
})

export async function updateUserProfile(formData: FormData): Promise<{
    success: boolean
    error?: string
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ' }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string

    const parsed = updateProfileSchema.safeParse({ name, email: email || '' })
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: parsed.data.name,
                email: parsed.data.email || null,
            },
        })

        return { success: true }
    } catch (error) {
        console.error('Update profile error:', error)
        return { success: false, error: 'ບໍ່ສາມາດອັບເດດໄດ້' }
    }
}

// ──────────────────────────────────────────
// Change password
// ──────────────────────────────────────────
export async function changePassword(formData: FormData): Promise<{
    success: boolean
    error?: string
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ' }
    }

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!currentPassword || !newPassword) {
        return { success: false, error: 'ກະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບ' }
    }

    if (newPassword.length < 6) {
        return { success: false, error: 'ລະຫັດໃໝ່ຕ້ອງຢ່າງໜ້ອຍ 6 ຕົວ' }
    }

    if (newPassword !== confirmPassword) {
        return { success: false, error: 'ລະຫັດໃໝ່ບໍ່ກົງກັນ' }
    }

    try {
        // Use raw query to access password (may be omitted from default select)
        const users = await prisma.$queryRaw<Array<{ password: string | null }>>`
            SELECT password FROM users WHERE id = ${session.user.id} LIMIT 1
        `
        const userPw = users[0]?.password
        if (!userPw) {
            return { success: false, error: 'ບໍ່ພົບບັນຊີ' }
        }

        // Verify current password
        const bcrypt = await import('bcryptjs')
        const isValid = await bcrypt.compare(currentPassword, userPw)
        if (!isValid) {
            return { success: false, error: 'ລະຫັດເກົ່າບໍ່ຖືກຕ້ອງ' }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        await prisma.$executeRaw`
            UPDATE users SET password = ${hashedPassword}, "updatedAt" = NOW() WHERE id = ${session.user.id}
        `

        return { success: true }
    } catch (error) {
        console.error('Change password error:', error)
        return { success: false, error: 'ບໍ່ສາມາດປ່ຽນລະຫັດໄດ້' }
    }
}
