'use client'

import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, ShoppingBag, User, Shield, Package, ClipboardList } from 'lucide-react'

export default function BottomNav() {
    const { data: session } = useSession()
    const params = useParams()
    const locale = (params?.locale as string) || 'lo'

    if (!session?.user) return null

    const role = (session.user as { role?: string }).role || 'RENTER'

    const baseItems = [
        { href: `/${locale}`, icon: Home, label: locale === 'lo' ? 'ໜ້າຫຼັກ' : 'Home' },
        { href: `/${locale}/browse`, icon: Search, label: locale === 'lo' ? 'ຊອກ' : 'Browse' },
        { href: `/${locale}/bookings`, icon: ShoppingBag, label: locale === 'lo' ? 'ຈອງ' : 'Bookings' },
    ]

    const roleItems = []
    if (role === 'OWNER' || role === 'ADMIN') {
        roleItems.push({ href: `/${locale}/owner`, icon: Package, label: locale === 'lo' ? 'ເຈົ້າຂອງ' : 'Owner' })
    }
    if (role === 'STAFF' || role === 'ADMIN') {
        roleItems.push({ href: `/${locale}/staff`, icon: ClipboardList, label: locale === 'lo' ? 'ປະຈຳການ' : 'Staff' })
    }
    if (role === 'ADMIN') {
        roleItems.push({ href: `/${locale}/admin`, icon: Shield, label: locale === 'lo' ? 'ແອັດມິນ' : 'Admin' })
    }

    const items = [...baseItems, ...roleItems.slice(0, 1)]
    // If no role items, add profile placeholder
    if (roleItems.length === 0) {
        items.push({ href: `/${locale}/login`, icon: User, label: locale === 'lo' ? 'ບັນຊີ' : 'Account' })
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 safe-area-bottom md:hidden">
            <div className="flex items-center justify-around py-2 px-1">
                {items.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center gap-0.5 px-3 py-1 text-navy-600 hover:text-champagne-gold transition-colors group"
                    >
                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}
