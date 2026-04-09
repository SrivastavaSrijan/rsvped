'use client'

import { useEffect, useState } from 'react'
import { AssetMap } from '@/lib/config/assets'

/** Detect Safari (including iOS browsers which all use WebKit) */
const useIsSafari = () => {
	const [isSafari, setIsSafari] = useState(false)
	useEffect(() => {
		const ua = navigator.userAgent
		const safari =
			/Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua)
		const iOS = /iPad|iPhone|iPod/.test(ua)
		setIsSafari(safari || iOS)
	}, [])
	return isSafari
}

export const HeroVideo = () => {
	const isSafari = useIsSafari()

	return (
		<video
			autoPlay
			loop
			muted
			playsInline
			className="w-full max-w-lg"
			style={
				isSafari
					? { mixBlendMode: 'color-burn', borderRadius: '9999px' }
					: undefined
			}
		>
			<source src={AssetMap.HeroVideo} type="video/webm" />
		</video>
	)
}
