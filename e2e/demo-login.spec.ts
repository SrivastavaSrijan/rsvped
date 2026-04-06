import { expect, test } from '@playwright/test'

test('demo login button is visible on login page', async ({ page }) => {
	await page.goto('/login')
	await expect(page.getByRole('button', { name: /try the demo/i })).toBeVisible()
})

test('login page shows sign in form', async ({ page }) => {
	await page.goto('/login')
	await expect(page.getByPlaceholder(/email/i)).toBeVisible()
	await expect(page.getByPlaceholder(/password/i)).toBeVisible()
})
