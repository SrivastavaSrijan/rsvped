import { expect, test } from '@playwright/test'

test('discover page loads without auth', async ({ page }) => {
	await page.goto('/events/discover')
	await expect(page.locator('h1')).toContainText('Discover Events')
})

test('discover page has AI search input', async ({ page }) => {
	await page.goto('/events/discover')
	await expect(
		page.getByPlaceholder(/find events/i)
	).toBeVisible()
})
