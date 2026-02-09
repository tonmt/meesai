'use client'

import { CalendarDays, AlertTriangle } from 'lucide-react'

type BookingSlot = {
    pickupDate: Date
    returnDate: Date
    bufferEnd: Date
    status: string
}

type Props = {
    bookings: BookingSlot[]
    locale: string
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
    return new Date(year, month, 1).getDay()
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
    const d = date.getTime()
    return d >= new Date(start).setHours(0, 0, 0, 0) && d <= new Date(end).setHours(23, 59, 59, 999)
}

function isDateInBuffer(date: Date, returnDate: Date, bufferEnd: Date): boolean {
    const d = date.getTime()
    return d > new Date(returnDate).setHours(23, 59, 59, 999) && d <= new Date(bufferEnd).setHours(23, 59, 59, 999)
}

const MONTH_NAMES_LO = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ']
const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_HEADERS_LO = ['ອາ', 'ຈ', 'ອ', 'ພ', 'ພຫ', 'ສ', 'ສ']
const DAY_HEADERS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function AvailabilityCalendar({ bookings, locale }: Props) {
    const now = new Date()
    const months = [0, 1].map(offset => {
        const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
        return { year: d.getFullYear(), month: d.getMonth() }
    })

    const dayHeaders = locale === 'lo' ? DAY_HEADERS_LO : DAY_HEADERS_EN

    function getDayStatus(date: Date): 'available' | 'booked' | 'buffer' | 'past' {
        if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            return 'past'
        }
        for (const b of bookings) {
            if (isDateInRange(date, b.pickupDate, b.returnDate)) return 'booked'
            if (isDateInBuffer(date, b.returnDate, b.bufferEnd)) return 'buffer'
        }
        return 'available'
    }

    const statusColors = {
        available: 'bg-emerald/10 text-emerald font-medium',
        booked: 'bg-red-100 text-red-500 font-medium',
        buffer: 'bg-amber-50 text-amber-500',
        past: 'text-gray-300',
    }

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-medium text-royal-navy flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-champagne-gold" />
                {locale === 'lo' ? 'ຕາຕະລາງຄວາມພ້ອມ' : 'Availability Calendar'}
            </h3>

            {/* Legend */}
            <div className="flex gap-4 text-xs text-navy-600">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald/20" /> {locale === 'lo' ? 'ຫວ່າງ' : 'Free'}</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-100" /> {locale === 'lo' ? 'ຖືກຈອງ' : 'Booked'}</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-50 border border-amber-200" /> {locale === 'lo' ? 'ຊັກອົບ' : 'Cleaning'}</span>
            </div>

            {/* 2-month calendar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {months.map(({ year, month }) => {
                    const daysInMonth = getDaysInMonth(year, month)
                    const firstDay = getFirstDayOfWeek(year, month)
                    const monthName = locale === 'lo' ? MONTH_NAMES_LO[month] : MONTH_NAMES_EN[month]

                    return (
                        <div key={`${year}-${month}`} className="glass rounded-xl p-4 border border-white/60">
                            <div className="text-center text-sm font-bold text-royal-navy mb-3">
                                {monthName} {year}
                            </div>

                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-0.5 mb-1">
                                {dayHeaders.map(d => (
                                    <div key={d} className="text-center text-[10px] text-gray-400 font-medium py-1">{d}</div>
                                ))}
                            </div>

                            {/* Days */}
                            <div className="grid grid-cols-7 gap-0.5">
                                {Array.from({ length: firstDay }, (_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}
                                {Array.from({ length: daysInMonth }, (_, i) => {
                                    const day = i + 1
                                    const date = new Date(year, month, day)
                                    const status = getDayStatus(date)

                                    return (
                                        <div
                                            key={day}
                                            className={`text-center text-xs py-1.5 rounded-md ${statusColors[status]}`}
                                            title={status === 'booked' ? (locale === 'lo' ? 'ຖືກຈອງແລ້ວ' : 'Booked') : status === 'buffer' ? (locale === 'lo' ? 'ກຳລັງຊັກອົບ' : 'Cleaning buffer') : ''}
                                        >
                                            {day}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {bookings.length > 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {locale === 'lo'
                        ? `${bookings.length} ຊ່ວງເວລາ ถูกจອง — ກະລຸນາເລືອກວັນທີ່ຫວ່າງ`
                        : `${bookings.length} date ranges booked — select available dates`
                    }
                </p>
            )}
        </div>
    )
}
