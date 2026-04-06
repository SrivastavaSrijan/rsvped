import { expect, test } from '@playwright/test'

test('login page shows Google sign-in button', async ({ page }) => {
	await page.goto('/login')
	await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
})

test('login page has email input', async ({ page }) => {
	await page.goto('/login')
	await expect(page.getByPlaceholder(/email/i)).toBeVisible()
})

test('login page has password input', async ({ page }) => {
	await page.goto('/login')
	await expect(page.getByPlaceholder(/password/i)).toBeVisible()
})

test('register page shows name field', async ({ page }) => {
	await page.goto('/register')
	await expect(page.getByPlaceholder(/name/i)).toBeVisible()
})

test('register page shows email and password fields', async ({ page }) => {
	await page.goto('/register')
	await expect(page.getByPlaceholder(/email/i)).toBeVisible()
	await expect(page.getByPlaceholder(/password/i)).toBeVisible()
})

test('register page is accessible', async ({ page }) => {
	await page.goto('/register')
	await expect(page.getByPlaceholder(/name/i)).toBeVisible()
})
