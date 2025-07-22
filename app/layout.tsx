import type { Metadata } from 'next'
import { Averia_Serif_Libre, Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { TRPCProvider } from '@/lib/trpc'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const averia = Averia_Serif_Libre({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-averia',
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
    <html lang="en" className="dark">
      <meta name="apple-mobile-web-app-title" content="rsvp'd" />
      <body className={`${inter.variable} ${averia.variable} font-sans antialiased`}>
        <TRPCProvider>{children}</TRPCProvider>
        <Toaster />
      </body>
    </html>
  )
}
