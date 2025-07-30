'use client'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Routes } from '@/lib/config'
import type { RouterOutput } from '@/server/api'

type CategoriesData = RouterOutput['category']['list']

type CategoryDiscoverCardProps = CategoriesData[number]
export const CategoryDiscoverCard = ({ slug, name, _count: count }: CategoryDiscoverCardProps) => {
	return (
		<Card className="lg:py-6 py-3 ">
			<CardHeader>
				<CardTitle>
					<p className="text-sm lg:text-base">{name}</p>
				</CardTitle>
				<CardDescription>{count.events} events</CardDescription>
				<CardAction>
					<Link href={Routes.Main.Events.DiscoverByCategory(slug)}>
						<Button size="icon" variant="ghost">
							<ArrowUpRight />
						</Button>
					</Link>
				</CardAction>
			</CardHeader>
		</Card>
	)
}
