'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui'

interface ShareLinkProps {
  url: string
  className?: string
}

export function ShareLink({ url, className }: ShareLinkProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div
      className={`flex w-full items-center justify-between gap-2 rounded bg-white/10 px-2 py-2 lg:px-3 lg:py-3 ${className}`}
    >
      <span className="max-w-[calc(100vw-8rem)] flex-1 truncate text-sm lg:max-w-[50ch]">
        {url.replace(process.env.NEXT_PUBLIC_BASE_URL || '', '')}
      </span>
      <Button variant="ghost" onClick={handleCopy}>
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      </Button>
    </div>
  )
}
