'use client'

import { useSession, signOut } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, LogOut, Package, Shield, ClipboardList, ShoppingBag, Search, ChevronDown, User } from 'lucide-react'

export default function Navbar() {
    const { data: session } = useSession()
    const params = useParams()
    const locale = (params?.locale as string) || 'lo'
    const [menuOpen, setMenuOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    const role = (session?.user as { role?: string } | undefined)?.role || 'RENTER'

    return (
        <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex items-center gap-2">
                        <span className="text-xl font-bold text-royal-navy" style={{ fontFamily: 'var(--font-serif-lao)' }}>
                            MeeSai
                        </span>
                        <span className="text-xs text-champagne-gold font-medium">
                            {locale === 'lo' ? 'ມີໃສ' : 'Rental'}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink href={`/${locale}/browse`} icon={Search}>
                            {locale === 'lo' ? 'ເບິ່ງສິນຄ້າ' : 'Browse'}
                        </NavLink>

                        {session?.user && (
                            <NavLink href={`/${locale}/bookings`} icon={ShoppingBag}>
                                {locale === 'lo' ? 'ການຈອງ' : 'My Bookings'}
                            </NavLink>
                        )}

                        {(role === 'OWNER' || role === 'ADMIN') && (
                            <NavLink href={`/${locale}/owner`} icon={Package}>
                                {locale === 'lo' ? 'ເຈົ້າຂອງ' : 'Owner'}
                            </NavLink>
                        )}

                        {(role === 'STAFF' || role === 'ADMIN') && (
                            <NavLink href={`/${locale}/staff`} icon={ClipboardList}>
                                {locale === 'lo' ? 'ປະຈຳການ' : 'Staff'}
                            </NavLink>
                        )}

                        {role === 'ADMIN' && (
                            <NavLink href={`/${locale}/admin`} icon={Shield}>
                                {locale === 'lo' ? 'ແອັດມິນ' : 'Admin'}
                            </NavLink>
                        )}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        {session?.user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-royal-navy/5 hover:bg-royal-navy/10 transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full bg-champagne-gold/20 flex items-center justify-center text-xs font-bold text-champagne-gold">
                                        {session.user.name?.charAt(0) || '?'}
                                    </div>
                                    <span className="text-sm font-medium text-royal-navy hidden sm:inline max-w-[80px] truncate">
                                        {session.user.name}
                                    </span>
                                    <ChevronDown className="w-3 h-3 text-gray-400" />
                                </button>

                                {profileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1">
                                            <div className="px-4 py-2 border-b border-gray-50">
                                                <p className="text-sm font-bold text-royal-navy">{session.user.name}</p>
                                                <span className="text-[10px] font-bold text-champagne-gold bg-champagne-gold/10 px-2 py-0.5 rounded-full">{role}</span>
                                            </div>
                                            <Link
                                                href={`/${locale}/account`}
                                                onClick={() => setProfileOpen(false)}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-navy-600 hover:bg-royal-navy/5 transition-colors"
                                            >
                                                <User className="w-4 h-4" />
                                                {locale === 'lo' ? 'ບັນຊີຂອງຂ້ອຍ' : 'My Account'}
                                            </Link>
                                            <button
                                                onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                {locale === 'lo' ? 'ອອກຈາກລະບົບ' : 'Sign Out'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link
                                href={`/${locale}/login`}
                                className="px-4 py-2 bg-champagne-gold text-royal-navy font-bold text-sm rounded-xl hover:bg-champagne-gold/90 transition-all"
                            >
                                {locale === 'lo' ? 'ເຂົ້າສູ່ລະບົບ' : 'Login'}
                            </Link>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden p-2 text-royal-navy"
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
                        <MobileLink href={`/${locale}/browse`} onClick={() => setMenuOpen(false)}>
                            <Search className="w-4 h-4" />
                            {locale === 'lo' ? 'ເບິ່ງສິນຄ້າ' : 'Browse All'}
                        </MobileLink>

                        {session?.user && (
                            <MobileLink href={`/${locale}/bookings`} onClick={() => setMenuOpen(false)}>
                                <ShoppingBag className="w-4 h-4" />
                                {locale === 'lo' ? 'ການຈອງຂອງຂ້ອຍ' : 'My Bookings'}
                            </MobileLink>
                        )}

                        {(role === 'OWNER' || role === 'ADMIN') && (
                            <MobileLink href={`/${locale}/owner`} onClick={() => setMenuOpen(false)}>
                                <Package className="w-4 h-4" />
                                {locale === 'lo' ? 'ເຈົ້າຂອງ Dashboard' : 'Owner Dashboard'}
                            </MobileLink>
                        )}

                        {(role === 'STAFF' || role === 'ADMIN') && (
                            <MobileLink href={`/${locale}/staff`} onClick={() => setMenuOpen(false)}>
                                <ClipboardList className="w-4 h-4" />
                                {locale === 'lo' ? 'ປະຈຳການ' : 'Staff Panel'}
                            </MobileLink>
                        )}

                        {role === 'ADMIN' && (
                            <MobileLink href={`/${locale}/admin`} onClick={() => setMenuOpen(false)}>
                                <Shield className="w-4 h-4" />
                                {locale === 'lo' ? 'ແອັດມິນ' : 'Admin Panel'}
                            </MobileLink>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}

function NavLink({ href, icon: Icon, children }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-navy-600 hover:text-royal-navy hover:bg-royal-navy/5 transition-all"
        >
            <Icon className="w-4 h-4" />
            {children}
        </Link>
    )
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-navy-600 hover:bg-royal-navy/5 transition-all"
        >
            {children}
        </Link>
    )
}
