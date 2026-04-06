import { expect, test } from '@playwright/test'

test('discover page loads without requiring auth', async ({ page }) => {
	await page.goto('/events/discover')
	// Page may redirect to select-location if no locations exist in DB
	await expect(page).toHaveURL(/\/events\/discover/)
	await expect(page.locator('h1').first()).toBeVisible()
})

test('discover page has a heading', async ({ page }) => {
	await page.goto('/events/discover')
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('privacy policy page loads and has content', async ({ page }) => {
	await page.goto('/privacy-policy')
	await expect(page.locator('h1')).toBeVisible()
	await expect(page.locator('body')).toContainText(/privacy/i)
})

test('terms of service page loads and has content', async ({ page }) => {
	await page.goto('/terms-of-service')
	await expect(page.locator('h1')).toBeVisible()
	await expect(page.locator('body')).toContainText(/terms/i)
})
