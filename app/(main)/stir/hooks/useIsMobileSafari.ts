'use client'

import { useEffect, useState } from 'react'

const isMobileSafariBrowser = () => {
	const ua = navigator.userAgent
	const isIOSDevice = /iPhone|iPad|iPod/i.test(ua)
	const isSafariEngine = /Safari/i.test(ua)
	const isOtherIOSBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua)

	return isIOSDevice && isSafariEngine && !isOtherIOSBrowser
}

export const useIsMobileSafari = () => {
	const [isMobileSafari, setIsMobileSafari] = useState(false)

	useEffect(() => {
		setIsMobileSafari(isMobileSafariBrowser())
	}, [])

	return isMobileSafari
}
