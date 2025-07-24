'use client'

import { Mail, MessageCircle, Share, Twitter } from 'lucide-react'
import { Button } from '@/components/ui'

interface ShareActionsProps {
  title: string
  url: string
}

export function ShareActions({ title, url }: ShareActionsProps) {
  const shareText = `Check out this event: ${title}`

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Invitation: ${title}`)
    const body = encodeURIComponent(
      `Hi! I'd like to invite you to this event:\n\n${title}\n\n${url}`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: url,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback to copy link
      try {
        await navigator.clipboard.writeText(url)
        alert('Event link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  return (
    <div className="flex w-full flex-row items-center justify-between gap-1 lg:gap-2">
      <p className="text-xs">Share event</p>
      <div className="flex flex-row gap-2 lg:gap-2">
        <Button variant="ghost" size="sm" onClick={handleNativeShare} title="Share">
          <Share className="size-3.75" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleTwitterShare} title="Share on Twitter">
          <Twitter className="size-3.75" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleWhatsAppShare} title="Share on WhatsApp">
          <MessageCircle className="size-3.75" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleEmailShare} title="Share via Email">
          <Mail className="size-3.75" />
        </Button>
      </div>
    </div>
  )
}
