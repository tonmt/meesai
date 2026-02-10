/**
 * In-memory Rate Limiter สำหรับ Server Actions
 * ป้องกัน spam requests จาก user เดียวกัน
 *
 * ข้อจำกัด: ทำงานเฉพาะ per-process (reset เมื่อ restart)
 * Production: ควรเปลี่ยนเป็น Redis-based
 */

const attempts = new Map<string, { count: number; resetAt: number }>();

// ลบ entries หมดอายุทุก 5 นาที
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of attempts) {
        if (now > val.resetAt) attempts.delete(key);
    }
}, 5 * 60 * 1000);

/**
 * ตรวจสอบ rate limit
 * @param key - unique key (เช่น `cancel:${userId}`)
 * @param maxAttempts - จำนวนครั้งสูงสุด
 * @param windowMs - ช่วงเวลา (ms) ค่าเริ่มต้น 60 วินาที
 * @throws Error ถ้าเกิน limit
 */
export function rateLimit(
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 60_000,
): void {
    const now = Date.now();
    const entry = attempts.get(key);

    if (!entry || now > entry.resetAt) {
        // window หมดอายุ → reset
        attempts.set(key, { count: 1, resetAt: now + windowMs });
        return;
    }

    if (entry.count >= maxAttempts) {
        const waitSec = Math.ceil((entry.resetAt - now) / 1000);
        throw new Error(
            `ທ່ານດຳເນີນການໄວເກີນໄປ ກະລຸນາລໍຖ້າ ${waitSec} ວິນາທີ`,
        );
    }

    entry.count++;
}
