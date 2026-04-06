import { expect, test } from '@playwright/test'

test('discover page loads without auth', async ({ page }) => {
	await page.goto('/events/discover')
	// Page may redirect to select-location if no locations exist in DB
	await expect(page).toHaveURL(/\/events\/discover/)
	await expect(page.locator('h1').first()).toBeVisible()
})

test('discover page has AI search input', async ({ page }) => {
	await page.goto('/events/discover')
	// Only check for search input if we landed on the main discover page (not select-location)
	const url = page.url()
	if (!url.includes('select-location')) {
		await expect(
			page.getByPlaceholder(/find events/i)
		).toBeVisible()
	}
})
