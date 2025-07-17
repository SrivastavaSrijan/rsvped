import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { TRPCProvider } from '@/lib/trpc'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "rsvp'd · Delightful Events Start Here",
  description:
    "rsvp'd is an event management platform that makes organizing and attending events a breeze.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} dark font-sans antialiased`}>
        <TRPCProvider>{children}</TRPCProvider>
        <Toaster />
      </body>
    </html>
  )
}
