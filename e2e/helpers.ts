import { test, expect, Page } from '@playwright/test';

// ─── Shared Credentials ───
export const ACCOUNTS = {
    admin: { phone: '02099990001', password: 'meesai123', role: 'ADMIN' },
    owner1: { phone: '02055551001', password: 'meesai123', role: 'OWNER' },
    owner2: { phone: '02055551002', password: 'meesai123', role: 'OWNER' },
    renter1: { phone: '02077772001', password: 'meesai123', role: 'RENTER' },
    renter2: { phone: '02077772002', password: 'meesai123', role: 'RENTER' },
};

// ─── Helper: Login via UI ───
export async function loginAs(page: Page, account: { phone: string; password: string }) {
    await page.goto('/lo/login');
    await page.waitForLoadState('networkidle');

    // Fill phone
    await page.locator('input[name="phone"]').fill(account.phone);
    // Fill password
    await page.locator('input[name="password"]').fill(account.password);
    // Submit
    await page.locator('button[type="submit"]').click();

    // Wait for navigation (may stay on login if error, or redirect)
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
}
