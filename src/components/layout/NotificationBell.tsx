'use client'

import { useState, useEffect, useTransition } from 'react'
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/actions/notifications'

type Notification = {
    id: string
    type: string
    title: string
    body: string
    link: string | null
    isRead: boolean
    createdAt: Date
}

export default function NotificationBell() {
    const { data: session } = useSession()
    const params = useParams()
    const router = useRouter()
    const locale = (params?.locale as string) || 'lo'
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isPending, startTransition] = useTransition()

    // Fetch unread count on mount & every 30s
    useEffect(() => {
        if (!session?.user) return

        const fetchCount = async () => {
            const count = await getUnreadCount()
            setUnreadCount(count)
        }
        fetchCount()
        const interval = setInterval(fetchCount, 30000)
        return () => clearInterval(interval)
    }, [session?.user])

    // Fetch notifications when opening
    async function handleOpen() {
        if (!open) {
            const notifs = await getNotifications()
            setNotifications(notifs.map((n: Notification) => ({ ...n, createdAt: new Date(n.createdAt) })))
        }
        setOpen(!open)
    }

    // Mark one as read + navigate
    function handleClick(notif: Notification) {
        startTransition(async () => {
            if (!notif.isRead) {
                await markAsRead(notif.id)
                setUnreadCount(prev => Math.max(0, prev - 1))
                setNotifications(prev =>
                    prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
                )
            }
            if (notif.link) {
                router.push(notif.link)
                setOpen(false)
            }
        })
    }

    // Mark all read
    function handleMarkAllRead() {
        startTransition(async () => {
            await markAllAsRead()
            setUnreadCount(0)
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        })
    }

    if (!session?.user) return null

    const typeIcons: Record<string, string> = {
        BOOKING_CONFIRMED: '✅',
        BOOKING_CANCELLED: '❌',
        PAYOUT_DONE: '💰',
        PAYMENT_RECEIVED: '💳',
        SYSTEM: '🔔',
    }

    return (
        <div className="relative">
            <button
                onClick={handleOpen}
                className="relative p-2 text-navy-600 hover:text-champagne-gold transition-colors rounded-lg hover:bg-royal-navy/5"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-royal-navy">
                                {locale === 'lo' ? 'ການແຈ້ງເຕືອນ' : 'Notifications'}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    disabled={isPending}
                                    className="text-xs text-champagne-gold hover:underline flex items-center gap-1"
                                >
                                    <CheckCheck className="w-3 h-3" />
                                    {locale === 'lo' ? 'ອ່ານທັງໝົດ' : 'Mark all read'}
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-72">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">
                                        {locale === 'lo' ? 'ບໍ່ມີການແຈ້ງເຕືອນ' : 'No notifications'}
                                    </p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleClick(notif)}
                                        className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-champagne-gold/5' : ''}`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-base mt-0.5">{typeIcons[notif.type] || '🔔'}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm truncate ${!notif.isRead ? 'font-bold text-royal-navy' : 'text-navy-600'}`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.isRead && (
                                                        <span className="w-2 h-2 bg-champagne-gold rounded-full flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{notif.body}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-[10px] text-gray-300">
                                                        {formatTimeAgo(notif.createdAt, locale)}
                                                    </span>
                                                    {notif.link && <ExternalLink className="w-3 h-3 text-gray-300" />}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function formatTimeAgo(date: Date, locale: string): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    if (diffMin < 1) return locale === 'lo' ? 'ຫາກໍ' : 'just now'
    if (diffMin < 60) return `${diffMin} ${locale === 'lo' ? 'ນາທີກ່ອນ' : 'min ago'}`
    if (diffHr < 24) return `${diffHr} ${locale === 'lo' ? 'ຊົ່ວໂມງກ່ອນ' : 'hr ago'}`
    return `${diffDay} ${locale === 'lo' ? 'ມື້ກ່ອນ' : 'day ago'}`
}
