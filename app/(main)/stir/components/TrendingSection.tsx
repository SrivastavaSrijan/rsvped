'use client'
import {
	Badge,
	Card,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui'

interface TrendingSectionProps {
	trendingEvents: { id: string; title: string; startDate: Date }[]
	trendingUsers: {
		id: string
		name: string | null
		profession?: string | null
	}[]
	trendingCommunities: { id: string; name: string; isPublic: boolean }[]
	suggestions: { id: string; title: string; startDate: Date }[]
}

export const TrendingSection = ({
	trendingEvents,
	trendingUsers,
	trendingCommunities,
	suggestions,
}: TrendingSectionProps) => {
	return (
		<div className="flex flex-col gap-4">
			<Tabs defaultValue="events">
				<div className="flex items-center justify-between">
					<TabsList>
						<TabsTrigger value="events">Trending Events</TabsTrigger>
						<TabsTrigger value="users">People</TabsTrigger>
						<TabsTrigger value="communities">Communities</TabsTrigger>
						<TabsTrigger value="suggestions">For You</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="events">
					<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
						{(trendingEvents ?? []).map((e) => (
							<Card key={e.id} className="border-0 p-4">
								<div className="flex flex-col gap-2">
									<h3 className="text-base font-semibold">{e.title}</h3>
									<p className="text-xs text-muted-foreground">
										{new Date(e.startDate).toLocaleString()}
									</p>
								</div>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value="users">
					<div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
						{(trendingUsers ?? []).map((u) => (
							<Card key={u.id} className="border-0 p-4">
								<div className="flex flex-col gap-2">
									<h3 className="text-base font-semibold">
										{u.name ?? 'Anonymous'}
									</h3>
									{u.profession && (
										<p className="text-xs text-muted-foreground">
											{u.profession}
										</p>
									)}
								</div>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value="communities">
					<div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
						{(trendingCommunities ?? []).map((c) => (
							<Card key={c.id} className="border-0 p-4">
								<div className="flex flex-col gap-2">
									<h3 className="text-base font-semibold">{c.name}</h3>
									<Badge variant="secondary" className="w-fit text-xs">
										{c.isPublic ? 'Public' : 'Private'}
									</Badge>
								</div>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value="suggestions">
					<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
						{(suggestions ?? []).map((e) => (
							<Card key={e.id} className="border-0 p-4">
								<div className="flex flex-col gap-2">
									<h3 className="text-base font-semibold">{e.title}</h3>
									<p className="text-xs text-muted-foreground">
										{new Date(e.startDate).toLocaleString()}
									</p>
								</div>
							</Card>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
