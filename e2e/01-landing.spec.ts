import { test, expect } from '@playwright/test';

test.describe('🏠 Landing Page — หน้าแรก', () => {

    test('T1.1 — Page loads with hero content', async ({ page }) => {
        await page.goto('/lo');
        await page.waitForLoadState('networkidle');
        const content = await page.content();
        expect(content).toContain('Fashion Bank of Laos');
    });

    test('T1.2 — Hero has stats', async ({ page }) => {
        await page.goto('/lo');
        await page.waitForLoadState('networkidle');
        const content = await page.content();
        expect(content).toContain('20+');
        expect(content).toContain('3+');
    });

    test('T1.3 — BookingEngine search → /browse', async ({ page }) => {
        await page.goto('/lo');
        await page.waitForLoadState('networkidle');
        const searchBtn = page.getByRole('button', { name: /ເຊັກຄິວ/ }).first();
        await expect(searchBtn).toBeVisible({ timeout: 10000 });
        await searchBtn.click();
        await page.waitForURL(/\/browse/, { timeout: 8000 });
        expect(page.url()).toContain('/browse');
    });

    test('T1.4 — OccasionNav 6 occasion links', async ({ page }) => {
        await page.goto('/lo');
        await page.waitForLoadState('networkidle');
        const links = page.locator('a[href*="/browse?category="]');
        const count = await links.count();
        expect(count).toBeGreaterThanOrEqual(6);
    });

    test('T1.5 — HowItWorks 3 steps exist', async ({ page }) => {
        await page.goto('/lo');
        await page.waitForLoadState('networkidle');
        const content = await page.content();
        expect(content).toContain('STEP 01');
        expect(content).toContain('STEP 02');
        expect(content).toContain('STEP 03');
    });

    test('T1.6 — DynamicFeed shows products', async ({ page }) => {
        await page.goto('/lo');
        await page.waitForLoadState('networkidle');
        const productLinks = page.locator('a[href*="/booking/seed-"]');
        const count = await productLinks.count();
        expect(count).toBeGreaterThanOrEqual(10);
    });

    test('T1.7 — TrustSection visible', async ({ page }) => {
        await page.goto('/lo');
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('5 ດາວ', { exact: false }).first()).toBeVisible({ timeout: 10000 });
    });

    test('T1.8 — OwnerZone 0% GP', async ({ page }) => {
        await page.goto('/lo');
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('GP Commission').first()).toBeVisible({ timeout: 10000 });
    });

    test('T1.9 — Footer copyright', async ({ page }) => {
        await page.goto('/lo');
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('© 2026').first()).toBeVisible({ timeout: 10000 });
    });

    test('T1.10 — EN page loads', async ({ page }) => {
        await page.goto('/en');
        await page.waitForLoadState('networkidle');
        const content = await page.content();
        expect(content).toContain('Fashion Bank of Laos');
    });
});
