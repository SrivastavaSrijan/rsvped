'use client'

import { usePathname } from 'next/navigation'
import { Routes } from '@/lib/config'
import { getRandomColor } from '@/lib/utils'

const BackgroundStyleMap = {
  [Routes.Main.Events.Create]: {
    background: `linear-gradient(135deg, ${getRandomColor({ intensity: 30 })}, ${getRandomColor({ intensity: 50 })})`,
  },
}

const PseudoElementStyleMap = {
  [Routes.Main.Events.Discover]: {
    background: `linear-gradient(${getRandomColor({ faint: true })} 0%, ${getRandomColor({ faint: true })} 50%, var(--color-faint-gray) 100%)`,
  },
}

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const style = BackgroundStyleMap[pathname as keyof typeof BackgroundStyleMap] || {}
  const pseudoElementStyle =
    PseudoElementStyleMap[pathname as keyof typeof PseudoElementStyleMap] || {}

  return (
    <div className="min-h-screen w-full" style={style}>
      <div
        className="fixed top-0 left-0 z-[-1] flex h-[200px] w-full flex-col"
        style={pseudoElementStyle}
      />
      {children}
    </div>
  )
}
