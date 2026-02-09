'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ──────────────────────────────────────────
// Get unread notification count
// ──────────────────────────────────────────
export async function getUnreadCount(): Promise<number> {
    const session = await auth()
    if (!session?.user?.id) return 0

    const count = await prisma.notification.count({
        where: { userId: session.user.id, isRead: false },
    })

    return count
}

// ──────────────────────────────────────────
// Get recent notifications (max 20)
// ──────────────────────────────────────────
export async function getNotifications() {
    const session = await auth()
    if (!session?.user?.id) return []

    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
            id: true,
            type: true,
            title: true,
            body: true,
            link: true,
            isRead: true,
            createdAt: true,
        },
    })

    return notifications
}

// ──────────────────────────────────────────
// Mark a notification as read
// ──────────────────────────────────────────
export async function markAsRead(notificationId: string): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) return

    await prisma.notification.updateMany({
        where: { id: notificationId, userId: session.user.id },
        data: { isRead: true },
    })
}

// ──────────────────────────────────────────
// Mark all notifications as read
// ──────────────────────────────────────────
export async function markAllAsRead(): Promise<void> {
    const session = await auth()
    if (!session?.user?.id) return

    await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
    })
}

// ──────────────────────────────────────────
// Create notification (for internal use by other actions)
// ──────────────────────────────────────────
export async function createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    link?: string
) {
    await prisma.notification.create({
        data: {
            userId,
            type,
            title,
            body,
            link: link || null,
        },
    })
}
