import { expect, test } from '@playwright/test'

test('homepage loads and shows hero', async ({ page }) => {
	await page.goto('/')
	await expect(page.locator('h1').first()).toContainText('Delightful events')
	await expect(page.getByRole('link', { name: /explore events/i })).toBeVisible()
})

test('homepage has working navigation', async ({ page }) => {
	await page.goto('/')
	const exploreLink = page.getByRole('link', { name: /explore events/i }).first()
	await expect(exploreLink).toBeVisible()
})
