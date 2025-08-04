'use server'

import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	const formData = await request.formData()
	const file = formData.get('file') as File | null
	if (!file) {
		return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
	}

	const blob = await put(file.name, file, {
		access: 'public',
	})

	return NextResponse.json(blob)
}
