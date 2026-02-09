'use client'

import { useState, useTransition } from 'react'
import { User, Phone, Mail, Shield, Calendar, Edit3, Lock, Save, X, Loader2, Package, ShoppingBag } from 'lucide-react'
import { updateUserProfile, changePassword } from '@/actions/profile'

type Profile = {
    id: string
    name: string
    phone: string
    email: string | null
    role: string
    avatar: string | null
    createdAt: Date
    _count: {
        bookings: number
        assets: number
    }
}

export default function ProfilePanel({ profile, locale }: { profile: Profile; locale: string }) {
    const [editing, setEditing] = useState(false)
    const [changingPw, setChangingPw] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const roleLabels: Record<string, { lo: string; en: string; color: string }> = {
        RENTER: { lo: 'ຜູ້ເຊົ່າ', en: 'Renter', color: 'bg-blue-100 text-blue-700' },
        OWNER: { lo: 'ເຈົ້າຂອງ', en: 'Owner', color: 'bg-amber-100 text-amber-700' },
        STAFF: { lo: 'ພະນັກງານ', en: 'Staff', color: 'bg-purple-100 text-purple-700' },
        ADMIN: { lo: 'ແອັດມິນ', en: 'Admin', color: 'bg-red-100 text-red-700' },
    }

    const role = roleLabels[profile.role] || roleLabels.RENTER

    function handleProfileUpdate(formData: FormData) {
        startTransition(async () => {
            const result = await updateUserProfile(formData)
            if (result.success) {
                setMessage({ type: 'success', text: locale === 'lo' ? 'ອັບເດດສຳເລັດ' : 'Updated successfully' })
                setEditing(false)
            } else {
                setMessage({ type: 'error', text: result.error || 'Error' })
            }
        })
    }

    function handlePasswordChange(formData: FormData) {
        startTransition(async () => {
            const result = await changePassword(formData)
            if (result.success) {
                setMessage({ type: 'success', text: locale === 'lo' ? 'ປ່ຽນລະຫັດສຳເລັດ' : 'Password changed' })
                setChangingPw(false)
            } else {
                setMessage({ type: 'error', text: result.error || 'Error' })
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Message */}
            {message && (
                <div className={`p-3 rounded-xl text-sm text-center ${message.type === 'success' ? 'bg-emerald/10 text-emerald border border-emerald/30' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Profile Card */}
            <div className="glass rounded-2xl p-6 border border-white/60">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-champagne-gold/20 flex items-center justify-center text-2xl font-bold text-champagne-gold">
                        {profile.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-royal-navy">{profile.name}</h2>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${role.color}`}>
                            {locale === 'lo' ? role.lo : role.en}
                        </span>
                    </div>
                </div>

                {!editing ? (
                    <div className="space-y-3">
                        <InfoRow icon={Phone} label={locale === 'lo' ? 'ເບີໂທ' : 'Phone'} value={profile.phone} />
                        <InfoRow icon={Mail} label={locale === 'lo' ? 'ອີເມລ' : 'Email'} value={profile.email || '-'} />
                        <InfoRow icon={Calendar} label={locale === 'lo' ? 'ສະໝັກເມື່ອ' : 'Joined'} value={new Date(profile.createdAt).toLocaleDateString(locale === 'lo' ? 'th-TH' : 'en-US')} />
                        <button
                            onClick={() => { setEditing(true); setMessage(null) }}
                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-royal-navy/5 text-royal-navy rounded-xl text-sm font-medium hover:bg-royal-navy/10 transition-colors"
                        >
                            <Edit3 className="w-4 h-4" />
                            {locale === 'lo' ? 'ແກ້ໄຂ' : 'Edit Profile'}
                        </button>
                    </div>
                ) : (
                    <form action={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-navy-600 mb-1">{locale === 'lo' ? 'ຊື່' : 'Name'}</label>
                            <input name="name" defaultValue={profile.name} required className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-navy-600 mb-1">{locale === 'lo' ? 'ອີເມລ' : 'Email'}</label>
                            <input name="email" type="email" defaultValue={profile.email || ''} className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold" />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" disabled={isPending} className="flex items-center gap-2 px-4 py-2 bg-champagne-gold text-royal-navy rounded-xl text-sm font-bold hover:bg-champagne-gold/90 transition-colors disabled:opacity-60">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {locale === 'lo' ? 'ບັນທຶກ' : 'Save'}
                            </button>
                            <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-navy-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                                <X className="w-4 h-4" />
                                {locale === 'lo' ? 'ຍົກເລີກ' : 'Cancel'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5 border border-white/60 text-center">
                    <ShoppingBag className="w-6 h-6 text-champagne-gold mx-auto mb-2" />
                    <p className="text-2xl font-bold text-royal-navy">{profile._count.bookings}</p>
                    <p className="text-xs text-navy-600">{locale === 'lo' ? 'ການຈອງ' : 'Bookings'}</p>
                </div>
                {(profile.role === 'OWNER' || profile.role === 'ADMIN') && (
                    <div className="glass rounded-2xl p-5 border border-white/60 text-center">
                        <Package className="w-6 h-6 text-champagne-gold mx-auto mb-2" />
                        <p className="text-2xl font-bold text-royal-navy">{profile._count.assets}</p>
                        <p className="text-xs text-navy-600">{locale === 'lo' ? 'ຊຸດທີ່ມີ' : 'My Items'}</p>
                    </div>
                )}
            </div>

            {/* Change Password */}
            <div className="glass rounded-2xl p-6 border border-white/60">
                {!changingPw ? (
                    <button
                        onClick={() => { setChangingPw(true); setMessage(null) }}
                        className="flex items-center gap-2 text-navy-600 text-sm hover:text-champagne-gold transition-colors"
                    >
                        <Lock className="w-4 h-4" />
                        {locale === 'lo' ? 'ປ່ຽນລະຫັດຜ່ານ' : 'Change Password'}
                    </button>
                ) : (
                    <form action={handlePasswordChange} className="space-y-4">
                        <h3 className="text-sm font-bold text-royal-navy flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            {locale === 'lo' ? 'ປ່ຽນລະຫັດຜ່ານ' : 'Change Password'}
                        </h3>
                        <input name="currentPassword" type="password" required placeholder={locale === 'lo' ? 'ລະຫັດປະຈຸບັນ' : 'Current password'} className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold" />
                        <input name="newPassword" type="password" required minLength={6} placeholder={locale === 'lo' ? 'ລະຫັດໃໝ່ (ຢ່າງໜ້ອຍ 6 ຕົວ)' : 'New password (min 6)'} className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold" />
                        <input name="confirmPassword" type="password" required minLength={6} placeholder={locale === 'lo' ? 'ຢືນຢັນລະຫັດໃໝ່' : 'Confirm new password'} className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold" />
                        <div className="flex gap-2">
                            <button type="submit" disabled={isPending} className="flex items-center gap-2 px-4 py-2 bg-champagne-gold text-royal-navy rounded-xl text-sm font-bold hover:bg-champagne-gold/90 disabled:opacity-60">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {locale === 'lo' ? 'ບັນທຶກ' : 'Save'}
                            </button>
                            <button type="button" onClick={() => setChangingPw(false)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-navy-600 rounded-xl text-sm hover:bg-gray-50">
                                <X className="w-4 h-4" />
                                {locale === 'lo' ? 'ຍົກເລີກ' : 'Cancel'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <Icon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-navy-600 w-20">{label}</span>
            <span className="text-sm font-medium text-royal-navy">{value}</span>
        </div>
    )
}
