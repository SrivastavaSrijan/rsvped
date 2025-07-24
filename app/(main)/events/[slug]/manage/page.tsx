import { ArrowUpLeft } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound, unauthorized } from 'next/navigation'
import { ManageEventCard } from '@/app/(main)/components'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const api = await getAPI()
  const event = await api.event.getMetadataBySlug({ slug })
  return {
    title: `${event.title} · RSVP'd`,
    description: `View details for the event: ${event.title}`,
  }
}
export default async function ViewEvent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const api = await getAPI()
  const session = await auth()

  const event = await api.event.getBySlug({ slug })
  if (!event) {
    return notFound()
  }

  if (event.hostId !== session?.user?.id) {
    return unauthorized()
  }
  const pathname = (await headers()).get('x-pathname') || ''
  const url = process.env.NEXT_PUBLIC_BASE_URL + pathname

  return (
    <Tabs
      className="mx-auto flex w-full max-w-page flex-col gap-8 px-3 lg:gap-12 lg:px-8"
      defaultValue="details"
    >
      <div className="flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col gap-1">
          <Link href={Routes.Main.Events.Home} passHref>
            <Button variant="link" size="sm" className=" text-muted-foreground opacity-50">
              <ArrowUpLeft className=" text-muted-foreground" /> Back home
            </Button>
          </Link>
          <h1 className="font-bold text-2xl lg:text-3xl">{event.title}</h1>
        </div>
        <TabsList className="w-full">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="stats">Community</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="details">
        <ManageEventCard {...event} url={url} />
      </TabsContent>
      <TabsContent value="stats"></TabsContent>
    </Tabs>
  )
}
