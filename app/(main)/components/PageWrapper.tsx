'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Routes } from '@/lib/config'
import { getRandomColor } from '@/lib/utils'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [styles, setStyles] = useState<{
    background?: React.CSSProperties
    pseudoElement?: React.CSSProperties
  }>({})
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const backgroundStyleMap = {
      [Routes.Main.Events.Create]: {
        backgroundColor: getRandomColor(),
      },
    }

    const pseudoElementStyleMap = {
      [Routes.Main.Events.Root]: {
        background: `linear-gradient(${getRandomColor({ faint: true })} 0%, ${getRandomColor({ faint: true })} 50%, var(--color-faint-gray) 100%)`,
      },
    }
    const isMatchingRoot = Object.keys(pseudoElementStyleMap).find((key) =>
      pathname.startsWith(key)
    )
    setStyles({
      background: backgroundStyleMap[pathname as keyof typeof backgroundStyleMap] || {},
      pseudoElement: isMatchingRoot
        ? pseudoElementStyleMap[isMatchingRoot as keyof typeof pseudoElementStyleMap]
        : {},
    })
    setIsLoaded(true)
  }, [pathname])

  return (
    <div
      className={`min-h-screen w-full transition-all duration-500 ease-in-out ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={styles.background}
    >
      <div
        className={`fixed top-0 left-0 z-[-1] flex h-[200px] w-full flex-col transition-all duration-500 ease-in-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={styles.pseudoElement}
      />
      {children}
    </div>
  )
}
