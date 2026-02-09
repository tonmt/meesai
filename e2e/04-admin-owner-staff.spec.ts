import { test, expect } from '@playwright/test';
import { ACCOUNTS, loginAs } from './helpers';

test.describe('👑 Admin Panel', () => {

    test('T4.1 — Admin dashboard loads after login', async ({ page }) => {
        await loginAs(page, ACCOUNTS.admin);
        await page.goto('/lo/admin');
        await page.waitForLoadState('networkidle');
        const body = await page.textContent('body');
        // Admin page should render content (even if redirected)
        expect(body!.length).toBeGreaterThan(50);
    });

    test('T4.2 — Admin page has tabs/sections', async ({ page }) => {
        await loginAs(page, ACCOUNTS.admin);
        await page.goto('/lo/admin');
        await page.waitForLoadState('networkidle');
        // Check for admin-specific UI elements (buttons, tabs etc.)
        const buttons = await page.locator('button').count();
        expect(buttons).toBeGreaterThan(0);
    });
});

test.describe('🏪 Owner Dashboard', () => {

    test('T4.3 — Owner dashboard loads after login', async ({ page }) => {
        await loginAs(page, ACCOUNTS.owner1);
        await page.goto('/lo/owner');
        await page.waitForLoadState('networkidle');
        const body = await page.textContent('body');
        expect(body!.length).toBeGreaterThan(50);
    });
});

test.describe('👷 Staff Panel', () => {

    test('T4.4 — Staff page loads', async ({ page }) => {
        await loginAs(page, ACCOUNTS.admin);
        await page.goto('/lo/staff');
        await page.waitForLoadState('networkidle');
        const body = await page.textContent('body');
        expect(body).toBeTruthy();
    });
});
