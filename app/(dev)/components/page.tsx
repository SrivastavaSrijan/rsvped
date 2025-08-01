'use client'

import {
	Bell,
	Bookmark,
	Calendar,
	Check,
	ChevronRight,
	Clock,
	Copy,
	CreditCard,
	DollarSign,
	Download,
	Edit,
	Filter,
	Heart,
	Image,
	Link,
	Mail,
	MapPin,
	MessageSquare,
	Mic,
	MoreHorizontal,
	QrCode,
	Search,
	Send,
	Share2,
	Trash2,
	Upload,
	UserPlus,
	Users,
	Video,
	X,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

export default function ComponentsPreviewPage() {
	return (
		<div className="min-h-screen p-6">
			<div className="mx-auto max-w-6xl space-y-12">
				{/* Header */}
				<div className="space-y-4">
					<h1 className="font-bold text-4xl">
						Lu.ma Design System - Complete Component Library
					</h1>
					<p className="text-lg text-muted-foreground">
						All UI components needed for an event platform (RSVP'd)
					</p>
				</div>

				{/* Navigation Components */}
				<Card>
					<CardHeader>
						<CardTitle>Navigation & Header</CardTitle>
						<CardDescription>
							Top navigation, search, and user menus
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Main Navigation */}
						<div className="rounded-lg border bg-card p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-6">
									<h3 className="font-bold text-primary text-xl">RSVP'd</h3>
									<nav className="hidden items-center gap-4 md:flex">
										<Button variant="ghost" size="sm">
											Discover
										</Button>
										<Button variant="ghost" size="sm">
											Create
										</Button>
										<Button variant="ghost" size="sm">
											My Events
										</Button>
									</nav>
								</div>
								<div className="flex items-center gap-3">
									<div className="relative">
										<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
										<Input
											placeholder="Search events..."
											className="w-64 pl-10"
										/>
									</div>
									<Button variant="ghost" size="icon">
										<Bell className="h-4 w-4" />
									</Button>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Avatar className="h-8 w-8 cursor-pointer">
												<AvatarFallback>JD</AvatarFallback>
											</Avatar>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>My Account</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem>Profile</DropdownMenuItem>
											<DropdownMenuItem>Settings</DropdownMenuItem>
											<DropdownMenuItem>Sign out</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						</div>

						{/* Breadcrumb Navigation */}
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<Button variant="ghost" size="sm" className="h-auto p-0">
								Events
							</Button>
							<ChevronRight className="h-4 w-4" />
							<Button variant="ghost" size="sm" className="h-auto p-0">
								Tech
							</Button>
							<ChevronRight className="h-4 w-4" />
							<span>Design Systems Meetup</span>
						</div>
					</CardContent>
				</Card>

				{/* Event Cards - Different Layouts */}
				<Card>
					<CardHeader>
						<CardTitle>Event Cards</CardTitle>
						<CardDescription>
							Various event card layouts and states
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-8">
						{/* Featured Event Card */}
						<div className="overflow-hidden rounded-xl border bg-card">
							<div className="flex h-48 items-center justify-center bg-gradient-to-r from-purple to-blue">
								<Image className="h-12 w-12 text-white/60" />
							</div>
							<div className="p-6">
								<div className="mb-4 flex items-start justify-between">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Badge className="border-cranberry-30 bg-cranberry-translucent text-cranberry">
												Featured
											</Badge>
											<Badge variant="outline">Free</Badge>
										</div>
										<h3 className="font-bold text-2xl">
											AI & Design: The Future of Creativity
										</h3>
										<p className="text-muted-foreground">
											Explore how artificial intelligence is reshaping the
											creative industry
										</p>
									</div>
									<div className="flex gap-2">
										<Button variant="ghost" size="icon">
											<Bookmark className="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="icon">
											<Share2 className="h-4 w-4" />
										</Button>
									</div>
								</div>

								<div className="mb-6 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Calendar className="h-4 w-4" />
										<span>Dec 20, 2024 · 7:00 PM</span>
									</div>
									<div className="flex items-center gap-2 text-muted-foreground">
										<MapPin className="h-4 w-4" />
										<span>Online Event</span>
									</div>
									<div className="flex items-center gap-2 text-muted-foreground">
										<Users className="h-4 w-4" />
										<span>234 attending</span>
									</div>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Avatar className="h-10 w-10">
											<AvatarFallback>SM</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">Sarah Miller</p>
											<p className="text-muted-foreground text-sm">
												AI Research Lead
											</p>
										</div>
									</div>
									<Button>Register Free</Button>
								</div>
							</div>
						</div>

						{/* Grid of Regular Event Cards */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{/* Paid Event */}
							<Card className="overflow-hidden">
								<div className="flex h-32 items-center justify-center bg-gradient-to-r from-orange to-cranberry">
									<Calendar className="h-8 w-8 text-white/60" />
								</div>
								<CardContent className="p-4">
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Badge className="border-green-30 bg-green-translucent text-green">
												Workshop
											</Badge>
											<Badge
												variant="outline"
												className="border-cranberry text-cranberry"
											>
												$49
											</Badge>
										</div>
										<h4 className="font-semibold">
											React Performance Workshop
										</h4>
										<div className="space-y-1 text-muted-foreground text-sm">
											<div className="flex items-center gap-2">
												<Clock className="h-3 w-3" />
												<span>Dec 18 · 2:00 PM PST</span>
											</div>
											<div className="flex items-center gap-2">
												<Users className="h-3 w-3" />
												<span>12/20 spots</span>
											</div>
										</div>
										<Button size="sm" className="w-full">
											Buy Ticket
										</Button>
									</div>
								</CardContent>
							</Card>

							{/* Sold Out Event */}
							<Card className="overflow-hidden opacity-75">
								<div className="flex h-32 items-center justify-center bg-gradient-to-r from-barney to-purple">
									<Mic className="h-8 w-8 text-white/60" />
								</div>
								<CardContent className="p-4">
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Badge variant="secondary">Networking</Badge>
											<Badge variant="destructive">Sold Out</Badge>
										</div>
										<h4 className="font-semibold">Startup Founder Meetup</h4>
										<div className="space-y-1 text-muted-foreground text-sm">
											<div className="flex items-center gap-2">
												<Clock className="h-3 w-3" />
												<span>Dec 22 · 6:30 PM PST</span>
											</div>
											<div className="flex items-center gap-2">
												<Users className="h-3 w-3" />
												<span>50/50 attending</span>
											</div>
										</div>
										<Button
											size="sm"
											className="w-full"
											variant="secondary"
											disabled
										>
											Waitlist
										</Button>
									</div>
								</CardContent>
							</Card>

							{/* Past Event */}
							<Card className="overflow-hidden">
								<div className="flex h-32 items-center justify-center bg-gradient-to-r from-blue to-green">
									<Video className="h-8 w-8 text-white/60" />
								</div>
								<CardContent className="p-4">
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Badge variant="outline">Past Event</Badge>
											<Badge className="border-blue-30 bg-blue-translucent text-blue">
												Conference
											</Badge>
										</div>
										<h4 className="font-semibold">DesignOps Summit 2024</h4>
										<div className="space-y-1 text-muted-foreground text-sm">
											<div className="flex items-center gap-2">
												<Clock className="h-3 w-3" />
												<span>Dec 10 · Completed</span>
											</div>
											<div className="flex items-center gap-2">
												<Users className="h-3 w-3" />
												<span>150 attended</span>
											</div>
										</div>
										<Button size="sm" className="w-full" variant="outline">
											View Recording
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</CardContent>
				</Card>

				{/* RSVP & Ticket Components */}
				<Card>
					<CardHeader>
						<CardTitle>RSVP & Ticketing</CardTitle>
						<CardDescription>
							Registration flows and ticket management
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* RSVP Form */}
						<div className="rounded-lg border bg-card p-6">
							<h4 className="mb-4 font-semibold text-lg">Register for Event</h4>
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="first-name">First Name</Label>
										<Input id="first-name" placeholder="John" />
									</div>
									<div>
										<Label htmlFor="last-name">Last Name</Label>
										<Input id="last-name" placeholder="Doe" />
									</div>
								</div>
								<div>
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="john@example.com"
									/>
								</div>
								<div>
									<Label htmlFor="company">Company (Optional)</Label>
									<Input id="company" placeholder="Your company" />
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox id="newsletter" />
									<Label htmlFor="newsletter" className="text-sm">
										Subscribe to event updates
									</Label>
								</div>
								<Button className="w-full">Complete Registration</Button>
							</div>
						</div>

						{/* Ticket Selection */}
						<div className="rounded-lg border bg-card p-6">
							<h4 className="mb-4 font-semibold text-lg">Select Tickets</h4>
							<div className="space-y-3">
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div>
										<h5 className="font-medium">General Admission</h5>
										<p className="text-muted-foreground text-sm">
											Access to all sessions
										</p>
									</div>
									<div className="flex items-center gap-3">
										<span className="font-semibold">$49</span>
										<Select defaultValue="1">
											<SelectTrigger className="w-20">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="0">0</SelectItem>
												<SelectItem value="1">1</SelectItem>
												<SelectItem value="2">2</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div>
										<h5 className="font-medium">VIP Pass</h5>
										<p className="text-muted-foreground text-sm">
											Includes networking dinner
										</p>
									</div>
									<div className="flex items-center gap-3">
										<span className="font-semibold">$149</span>
										<Select defaultValue="0">
											<SelectTrigger className="w-20">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="0">0</SelectItem>
												<SelectItem value="1">1</SelectItem>
												<SelectItem value="2">2</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<Separator />
								<div className="flex items-center justify-between pt-2">
									<span className="font-semibold">Total</span>
									<span className="font-bold text-xl">$49.00</span>
								</div>
								<Button className="w-full">
									<CreditCard className="mr-2 h-4 w-4" />
									Proceed to Payment
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Filters & Search */}
				<Card>
					<CardHeader>
						<CardTitle>Filters & Discovery</CardTitle>
						<CardDescription>
							Event discovery and filtering components
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Search Bar */}
						<div className="relative">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								placeholder="Search events, topics, or locations..."
								className="pl-10"
							/>
						</div>

						{/* Filter Bar */}
						<div className="flex flex-wrap gap-3">
							<Select>
								<SelectTrigger className="w-40">
									<Filter className="mr-2 h-4 w-4" />
									<SelectValue placeholder="Category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="tech">Technology</SelectItem>
									<SelectItem value="design">Design</SelectItem>
									<SelectItem value="business">Business</SelectItem>
									<SelectItem value="networking">Networking</SelectItem>
								</SelectContent>
							</Select>

							<Select>
								<SelectTrigger className="w-32">
									<SelectValue placeholder="Date" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="today">Today</SelectItem>
									<SelectItem value="tomorrow">Tomorrow</SelectItem>
									<SelectItem value="week">This Week</SelectItem>
									<SelectItem value="month">This Month</SelectItem>
								</SelectContent>
							</Select>

							<Select>
								<SelectTrigger className="w-32">
									<SelectValue placeholder="Price" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="free">Free</SelectItem>
									<SelectItem value="paid">Paid</SelectItem>
									<SelectItem value="under50">Under $50</SelectItem>
								</SelectContent>
							</Select>

							<Select>
								<SelectTrigger className="w-36">
									<SelectValue placeholder="Location" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="online">Online</SelectItem>
									<SelectItem value="sf">San Francisco</SelectItem>
									<SelectItem value="ny">New York</SelectItem>
									<SelectItem value="london">London</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Active Filters */}
						<div className="flex flex-wrap gap-2">
							<Badge variant="secondary" className="gap-2">
								Technology
								<X className="h-3 w-3 cursor-pointer" />
							</Badge>
							<Badge variant="secondary" className="gap-2">
								This Week
								<X className="h-3 w-3 cursor-pointer" />
							</Badge>
							<Badge variant="secondary" className="gap-2">
								Free
								<X className="h-3 w-3 cursor-pointer" />
							</Badge>
							<Button
								variant="ghost"
								size="sm"
								className="h-auto p-1 text-muted-foreground"
							>
								Clear all
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Host Dashboard Components */}
				<Card>
					<CardHeader>
						<CardTitle>Host Dashboard</CardTitle>
						<CardDescription>
							Event management and analytics for organizers
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Dashboard Stats */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-muted-foreground text-sm">
												Total Events
											</p>
											<p className="font-bold text-2xl">12</p>
										</div>
										<Calendar className="h-8 w-8 text-muted-foreground" />
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-muted-foreground text-sm">
												Total RSVPs
											</p>
											<p className="font-bold text-2xl">1,234</p>
										</div>
										<Users className="h-8 w-8 text-muted-foreground" />
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-muted-foreground text-sm">Revenue</p>
											<p className="font-bold text-2xl">$5,670</p>
										</div>
										<DollarSign className="h-8 w-8 text-muted-foreground" />
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-muted-foreground text-sm">Check-ins</p>
											<p className="font-bold text-2xl">89%</p>
										</div>
										<QrCode className="h-8 w-8 text-muted-foreground" />
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Event Management Table */}
						<div className="rounded-lg border">
							<div className="border-b p-4">
								<h4 className="font-semibold">My Events</h4>
							</div>
							<div className="divide-y">
								{/* Event Row */}
								<div className="flex items-center justify-between p-4">
									<div className="flex items-center gap-3">
										<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple to-blue">
											<Calendar className="h-6 w-6 text-white" />
										</div>
										<div>
											<h5 className="font-medium">Design Systems Workshop</h5>
											<p className="text-muted-foreground text-sm">
												Dec 20, 2024 · 45 registered
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge className="border-green-30 bg-green-translucent text-green">
											Published
										</Badge>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem>
													<Edit className="mr-2 h-4 w-4" />
													Edit Event
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Users className="mr-2 h-4 w-4" />
													View Attendees
												</DropdownMenuItem>
												<DropdownMenuItem>
													<QrCode className="mr-2 h-4 w-4" />
													Check-in
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem className="text-destructive">
													<Trash2 className="mr-2 h-4 w-4" />
													Delete Event
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>

								{/* Draft Event Row */}
								<div className="flex items-center justify-between p-4 opacity-75">
									<div className="flex items-center gap-3">
										<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
											<Calendar className="h-6 w-6 text-muted-foreground" />
										</div>
										<div>
											<h5 className="font-medium">React Conference 2025</h5>
											<p className="text-muted-foreground text-sm">
												Draft · Not published
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="outline">Draft</Badge>
										<Button variant="outline" size="sm">
											Continue Setup
										</Button>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* User Profile & Social */}
				<Card>
					<CardHeader>
						<CardTitle>User Profiles & Social</CardTitle>
						<CardDescription>
							User management and social features
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* User Profile Card */}
						<div className="rounded-lg border bg-card p-6">
							<div className="flex items-start gap-4">
								<Avatar className="h-16 w-16">
									<AvatarFallback>JD</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<div className="mb-2 flex items-center gap-3">
										<h4 className="font-semibold text-xl">John Doe</h4>
										<Badge className="border-blue-30 bg-blue-translucent text-blue">
											Host
										</Badge>
									</div>
									<p className="mb-3 text-muted-foreground">
										Senior Product Designer at TechCorp. Passionate about design
										systems and user experience.
									</p>
									<div className="flex items-center gap-4 text-muted-foreground text-sm">
										<span>12 events hosted</span>
										<span>234 followers</span>
										<span>89 following</span>
									</div>
								</div>
								<div className="flex gap-2">
									<Button variant="outline" size="sm">
										<UserPlus className="mr-2 h-4 w-4" />
										Follow
									</Button>
									<Button variant="outline" size="sm">
										<MessageSquare className="mr-2 h-4 w-4" />
										Message
									</Button>
								</div>
							</div>
						</div>

						{/* Attendee List */}
						<div className="rounded-lg border">
							<div className="flex items-center justify-between border-b p-4">
								<h4 className="font-semibold">Event Attendees (45)</h4>
								<div className="flex gap-2">
									<Button variant="outline" size="sm">
										<Download className="mr-2 h-4 w-4" />
										Export CSV
									</Button>
									<Button variant="outline" size="sm">
										<Send className="mr-2 h-4 w-4" />
										Send Update
									</Button>
								</div>
							</div>
							<div className="max-h-64 divide-y overflow-y-auto">
								{Array.from({ length: 5 }).map((_, i) => (
									<div
										// biome-ignore lint/suspicious/noArrayIndexKey: just testing!
										key={i}
										className="flex items-center justify-between p-4"
									>
										<div className="flex items-center gap-3">
											<Avatar className="h-10 w-10">
												<AvatarFallback>
													{String.fromCharCode(65 + i)}
													{String.fromCharCode(65 + i + 1)}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">Attendee {i + 1}</p>
												<p className="text-muted-foreground text-sm">
													attendee{i + 1}@example.com
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge
												className={
													i % 2 === 0
														? 'border-green-30 bg-green-translucent text-green'
														: ''
												}
												variant={i % 2 === 0 ? 'outline' : 'secondary'}
											>
												{i % 2 === 0 ? 'Checked In' : 'Registered'}
											</Badge>
											<Button variant="ghost" size="icon">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Notification & Communication */}
				<Card>
					<CardHeader>
						<CardTitle>Notifications & Communication</CardTitle>
						<CardDescription>
							Alerts, messages, and communication components
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Notification List */}
						<div className="space-y-3">
							<div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-brand p-3">
								<Bell className="mt-0.5 h-5 w-5 text-blue-600" />
								<div className="flex-1">
									<p className="font-medium text-blue-900">
										New RSVP for Design Workshop
									</p>
									<p className="text-blue-700 text-sm">
										Sarah Johnson just registered for your event
									</p>
									<p className="mt-1 text-blue-600 text-xs">2 minutes ago</p>
								</div>
								<Button variant="ghost" size="icon" className="text-blue-600">
									<X className="h-4 w-4" />
								</Button>
							</div>

							<div className="flex items-start gap-3 rounded-lg border p-3">
								<Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
								<div className="flex-1">
									<p className="font-medium">Event reminder</p>
									<p className="text-muted-foreground text-sm">
										React Workshop starts in 2 hours
									</p>
									<p className="mt-1 text-muted-foreground text-xs">
										1 hour ago
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3 rounded-lg border p-3">
								<Heart className="mt-0.5 h-5 w-5 text-muted-foreground" />
								<div className="flex-1">
									<p className="font-medium">Event feedback received</p>
									<p className="text-muted-foreground text-sm">
										5 new reviews for Design Systems Meetup
									</p>
									<p className="mt-1 text-muted-foreground text-xs">
										3 hours ago
									</p>
								</div>
							</div>
						</div>

						{/* Message Composer */}
						<div className="rounded-lg border bg-card p-4">
							<h4 className="mb-3 font-medium">Send Update to Attendees</h4>
							<div className="space-y-3">
								<Input placeholder="Subject line..." />
								<Textarea placeholder="Write your message..." rows={3} />
								<div className="flex items-center justify-between">
									<div className="flex gap-2">
										<Button variant="ghost" size="icon">
											<Link className="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="icon">
											<Image className="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="icon">
											<Upload className="h-4 w-4" />
										</Button>
									</div>
									<Button>
										<Send className="mr-2 h-4 w-4" />
										Send Update
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Form Components */}
				<Card>
					<CardHeader>
						<CardTitle>Advanced Form Components</CardTitle>
						<CardDescription>
							Complex forms for event creation and management
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Event Creation Form */}
						<Tabs defaultValue="basic" className="w-full">
							<TabsList className="grid w-full grid-cols-4">
								<TabsTrigger value="basic">Basic Info</TabsTrigger>
								<TabsTrigger value="details">Details</TabsTrigger>
								<TabsTrigger value="tickets">Tickets</TabsTrigger>
								<TabsTrigger value="settings">Settings</TabsTrigger>
							</TabsList>

							<TabsContent value="basic" className="space-y-4">
								<div>
									<Label htmlFor="event-title">Event Title</Label>
									<Input id="event-title" placeholder="Enter event title..." />
								</div>
								<div>
									<Label htmlFor="event-subtitle">Subtitle (Optional)</Label>
									<Input
										id="event-subtitle"
										placeholder="Short description..."
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="start-date">Start Date & Time</Label>
										<Input id="start-date" type="datetime-local" />
									</div>
									<div>
										<Label htmlFor="end-date">End Date & Time</Label>
										<Input id="end-date" type="datetime-local" />
									</div>
								</div>
							</TabsContent>

							<TabsContent value="details" className="space-y-4">
								<div>
									<Label htmlFor="description">Event Description</Label>
									<Textarea
										id="description"
										placeholder="Describe your event..."
										rows={4}
									/>
								</div>
								<div>
									<Label htmlFor="category">Category</Label>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Select category..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="tech">Technology</SelectItem>
											<SelectItem value="design">Design</SelectItem>
											<SelectItem value="business">Business</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</TabsContent>

							<TabsContent value="tickets" className="space-y-4">
								<div className="flex items-center space-x-2">
									<Switch id="paid-event" />
									<Label htmlFor="paid-event">This is a paid event</Label>
								</div>
								<div>
									<Label htmlFor="capacity">Event Capacity</Label>
									<Input
										id="capacity"
										type="number"
										placeholder="Maximum attendees..."
									/>
								</div>
							</TabsContent>

							<TabsContent value="settings" className="space-y-4">
								<div className="flex items-center space-x-2">
									<Switch id="public-event" defaultChecked />
									<Label htmlFor="public-event">Make event public</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Switch id="allow-waitlist" />
									<Label htmlFor="allow-waitlist">
										Allow waitlist when sold out
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Switch id="require-approval" />
									<Label htmlFor="require-approval">
										Require approval for registration
									</Label>
								</div>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>

				{/* Status & Badge System */}
				<Card>
					<CardHeader>
						<CardTitle>Status & Badge System</CardTitle>
						<CardDescription>
							All possible states and status indicators
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Event Status Badges */}
						<div>
							<h4 className="mb-3 font-medium">Event Status</h4>
							<div className="flex flex-wrap gap-2">
								<Badge className="border-green-30 bg-green-translucent text-green">
									Live
								</Badge>
								<Badge className="border-blue-30 bg-blue-translucent text-blue">
									Published
								</Badge>
								<Badge variant="outline">Draft</Badge>
								<Badge className="border-orange-30 bg-orange-translucent text-orange">
									Upcoming
								</Badge>
								<Badge variant="secondary">Past</Badge>
								<Badge variant="destructive">Cancelled</Badge>
								<Badge className="border-purple-30 bg-purple-translucent text-purple">
									Sold Out
								</Badge>
							</div>
						</div>

						{/* User Role Badges */}
						<div>
							<h4 className="mb-3 font-medium">User Roles</h4>
							<div className="flex flex-wrap gap-2">
								<Badge className="border-cranberry-30 bg-cranberry-translucent text-cranberry">
									Host
								</Badge>
								<Badge className="border-blue-30 bg-blue-translucent text-blue">
									Co-host
								</Badge>
								<Badge className="border-green-30 bg-green-translucent text-green">
									Attendee
								</Badge>
								<Badge className="border-orange-30 bg-orange-translucent text-orange">
									VIP
								</Badge>
								<Badge className="border-purple-30 bg-purple-translucent text-purple">
									Speaker
								</Badge>
								<Badge variant="outline">Waitlisted</Badge>
							</div>
						</div>

						{/* Payment Status */}
						<div>
							<h4 className="mb-3 font-medium">Payment Status</h4>
							<div className="flex flex-wrap gap-2">
								<Badge className="border-green-30 bg-green-translucent text-green">
									<Check className="mr-1 h-3 w-3" />
									Paid
								</Badge>
								<Badge className="border-orange-30 bg-orange-translucent text-orange">
									<Clock className="mr-1 h-3 w-3" />
									Pending
								</Badge>
								<Badge variant="destructive">
									<X className="mr-1 h-3 w-3" />
									Failed
								</Badge>
								<Badge className="border-blue-30 bg-blue-translucent text-blue">
									Free
								</Badge>
								<Badge variant="outline">Refunded</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Interactive Elements */}
				<Card>
					<CardHeader>
						<CardTitle>Interactive Components</CardTitle>
						<CardDescription>
							Modals, dropdowns, and interactive elements
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Dialog Example */}
						<div>
							<h4 className="mb-3 font-medium">Modal Dialogs</h4>
							<div className="flex gap-3">
								<Dialog>
									<DialogTrigger asChild>
										<Button variant="outline">Cancel Event</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Cancel Event</DialogTitle>
											<DialogDescription>
												Are you sure you want to cancel this event? This action
												cannot be undone.
											</DialogDescription>
										</DialogHeader>
										<div className="mt-6 flex justify-end gap-3">
											<Button variant="outline">Keep Event</Button>
											<Button variant="destructive">Cancel Event</Button>
										</div>
									</DialogContent>
								</Dialog>

								<Dialog>
									<DialogTrigger asChild>
										<Button>Share Event</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Share Event</DialogTitle>
											<DialogDescription>
												Share this event with others
											</DialogDescription>
										</DialogHeader>
										<div className="mt-4 space-y-4">
											<div className="flex gap-2">
												<Input
													value="https://rsvpd.app/events/design-workshop"
													readOnly
												/>
												<Button variant="outline">
													<Copy className="h-4 w-4" />
												</Button>
											</div>
											<div className="flex gap-2">
												<Button className="flex-1">
													<Mail className="mr-2 h-4 w-4" />
													Email
												</Button>
												<Button className="flex-1" variant="outline">
													<Share2 className="mr-2 h-4 w-4" />
													Social
												</Button>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
