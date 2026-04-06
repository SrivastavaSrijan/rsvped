import { expect, test } from '@playwright/test'

test('clicking Explore Events navigates to discover page', async ({ page }) => {
	await page.goto('/')
	const exploreLink = page.getByRole('link', { name: /explore events/i }).first()
	await exploreLink.click()
	await expect(page).toHaveURL(/\/events\/discover/)
})

test('footer contains Discover link', async ({ page }) => {
	await page.goto('/')
	const footer = page.locator('footer')
	await expect(footer.getByRole('link', { name: /discover/i })).toBeVisible()
})

test('footer contains Terms link', async ({ page }) => {
	await page.goto('/')
	const footer = page.locator('footer')
	await expect(footer.getByRole('link', { name: /terms/i })).toBeVisible()
})

test('footer contains Privacy link', async ({ page }) => {
	await page.goto('/')
	const footer = page.locator('footer')
	await expect(footer.getByRole('link', { name: /privacy/i })).toBeVisible()
})

test('logo links back to homepage', async ({ page }) => {
	await page.goto('/events/discover')
	const logo = page.getByRole('link', { name: /rsvp/i }).first()
	await logo.click()
	await expect(page).toHaveURL('/')
})
