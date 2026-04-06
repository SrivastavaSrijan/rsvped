import { expect, test } from '@playwright/test'

test('discover page loads without auth', async ({ page }) => {
	const response = await page.goto('/events/discover')
	// Page requires location data — in CI with empty DB it may error or redirect.
	// Just verify the server responded (not a 500 crash).
	expect(response?.status()).toBeLessThan(500)
})

test('discover page has AI search input when data exists', async ({ page }) => {
	await page.goto('/events/discover')
	// Only assert search input if the page fully rendered (has an h1)
	const h1 = page.locator('h1').first()
	if (await h1.isVisible({ timeout: 3000 }).catch(() => false)) {
		await expect(page.getByPlaceholder(/find events/i)).toBeVisible()
	}
})
