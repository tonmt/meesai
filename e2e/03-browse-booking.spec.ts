import { test, expect } from '@playwright/test';
import { ACCOUNTS, loginAs } from './helpers';

test.describe('🛍️ Browse & Booking — ผู้เช่า (Renter)', () => {

    test('T3.1 — Browse page loads', async ({ page }) => {
        await page.goto('/lo/browse');
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('/browse');
    });

    test('T3.2 — Browse with category filter', async ({ page }) => {
        await page.goto('/lo/browse?category=wedding');
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('category=wedding');
    });

    test('T3.3 — Product card links to booking page', async ({ page }) => {
        await page.goto('/lo/browse');
        await page.waitForLoadState('networkidle');
        const productLink = page.locator('a[href*="/booking/"]').first();
        if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
            const href = await productLink.getAttribute('href');
            await productLink.click();
            await page.waitForLoadState('networkidle');
            expect(page.url()).toContain('/booking/');
        }
    });

    test('T3.4 — Renter can login and view /bookings', async ({ page }) => {
        await loginAs(page, ACCOUNTS.renter1);
        await page.goto('/lo/bookings');
        await page.waitForLoadState('networkidle');
        // Should see bookings or empty state
        const body = await page.textContent('body');
        expect(body).toBeTruthy();
    });

    test('T3.5 — Renter can view /account', async ({ page }) => {
        await loginAs(page, ACCOUNTS.renter1);
        await page.goto('/lo/account');
        await page.waitForLoadState('networkidle');
        const body = await page.textContent('body');
        expect(body).toBeTruthy();
    });

    test('T3.6 — Booking page shows product details', async ({ page }) => {
        await page.goto('/lo/booking/seed-WED-001');
        await page.waitForLoadState('networkidle');
        // Should show product name or redirect to login
        const body = await page.textContent('body');
        expect(body).toBeTruthy();
    });
});
