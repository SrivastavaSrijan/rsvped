import { z } from 'zod'

export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required'),
})

export const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.regex(/[a-z]/, 'Password must contain a lowercase letter')
	.regex(/[A-Z]/, 'Password must contain an uppercase letter')
	.regex(/[0-9]/, 'Password must contain a number')

export const registrationSchema = loginSchema.extend({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	password: passwordSchema,
	image: z.string().optional(),
})
