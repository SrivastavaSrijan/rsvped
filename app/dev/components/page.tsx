"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Star, 
  Share2, 
  Heart, 
  Bookmark, 
  Download, 
  QrCode,
  Settings,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Bell,
  Check,
  X,
  ChevronDown,
  ExternalLink,
  Copy,
  Mail,
  Phone,
  Globe,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  MoreHorizontal,
  UserPlus,
  MessageSquare,
  Image,
  Video,
  Mic,
  Send,
  Link,
  Upload
} from "lucide-react";

export default function ComponentsPreviewPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
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
            <CardDescription>Top navigation, search, and user menus</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Navigation */}
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <h3 className="text-xl font-bold text-primary">rsvp'd</h3>
                  <nav className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" size="sm">Discover</Button>
                    <Button variant="ghost" size="sm">Create</Button>
                    <Button variant="ghost" size="sm">My Events</Button>
                  </nav>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search events..." className="pl-10 w-64" />
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" className="p-0 h-auto">Events</Button>
              <ChevronRight className="h-4 w-4" />
              <Button variant="ghost" size="sm" className="p-0 h-auto">Tech</Button>
              <ChevronRight className="h-4 w-4" />
              <span>Design Systems Meetup</span>
            </div>
          </CardContent>
        </Card>

        {/* Event Cards - Different Layouts */}
        <Card>
          <CardHeader>
            <CardTitle>Event Cards</CardTitle>
            <CardDescription>Various event card layouts and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Featured Event Card */}
            <div className="border rounded-xl overflow-hidden bg-card">
              <div className="h-48 bg-gradient-to-r from-purple to-blue flex items-center justify-center">
                <Image className="h-12 w-12 text-white/60" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-cranberry-translucent text-cranberry border-cranberry-30">
                        Featured
                      </Badge>
                      <Badge variant="outline">Free</Badge>
                    </div>
                    <h3 className="text-2xl font-bold">AI & Design: The Future of Creativity</h3>
                    <p className="text-muted-foreground">
                      Explore how artificial intelligence is reshaping the creative industry
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
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
                      <p className="text-sm text-muted-foreground">AI Research Lead</p>
                    </div>
                  </div>
                  <Button>Register Free</Button>
                </div>
              </div>
            </div>

            {/* Grid of Regular Event Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Paid Event */}
              <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-orange to-cranberry flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-white/60" />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-translucent text-green border-green-30">Workshop</Badge>
                      <Badge variant="outline" className="text-cranberry border-cranberry">$49</Badge>
                    </div>
                    <h4 className="font-semibold">React Performance Workshop</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>Dec 18 · 2:00 PM PST</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span>12/20 spots</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full">Buy Ticket</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sold Out Event */}
              <Card className="overflow-hidden opacity-75">
                <div className="h-32 bg-gradient-to-r from-barney to-purple flex items-center justify-center">
                  <Mic className="h-8 w-8 text-white/60" />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Networking</Badge>
                      <Badge variant="destructive">Sold Out</Badge>
                    </div>
                    <h4 className="font-semibold">Startup Founder Meetup</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>Dec 22 · 6:30 PM PST</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span>50/50 attending</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full" variant="secondary" disabled>
                      Waitlist
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Past Event */}
              <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue to-green flex items-center justify-center">
                  <Video className="h-8 w-8 text-white/60" />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Past Event</Badge>
                      <Badge className="bg-blue-translucent text-blue border-blue-30">Conference</Badge>
                    </div>
                    <h4 className="font-semibold">DesignOps Summit 2024</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
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
            <CardDescription>Registration flows and ticket management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* RSVP Form */}
            <div className="border rounded-lg p-6 bg-card">
              <h4 className="text-lg font-semibold mb-4">Register for Event</h4>
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
                  <Input id="email" type="email" placeholder="john@example.com" />
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
            <div className="border rounded-lg p-6 bg-card">
              <h4 className="text-lg font-semibold mb-4">Select Tickets</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">General Admission</h5>
                    <p className="text-sm text-muted-foreground">Access to all sessions</p>
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
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">VIP Pass</h5>
                    <p className="text-sm text-muted-foreground">Includes networking dinner</p>
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
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold">$49.00</span>
                </div>
                <Button className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
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
            <CardDescription>Event discovery and filtering components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search events, topics, or locations..." className="pl-10" />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3">
              <Select>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
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
              <Button variant="ghost" size="sm" className="h-auto p-1 text-muted-foreground">
                Clear all
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Host Dashboard Components */}
        <Card>
          <CardHeader>
            <CardTitle>Host Dashboard</CardTitle>
            <CardDescription>Event management and analytics for organizers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total RSVPs</p>
                      <p className="text-2xl font-bold">1,234</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">$5,670</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Check-ins</p>
                      <p className="text-2xl font-bold">89%</p>
                    </div>
                    <QrCode className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Event Management Table */}
            <div className="border rounded-lg">
              <div className="p-4 border-b">
                <h4 className="font-semibold">My Events</h4>
              </div>
              <div className="divide-y">
                {/* Event Row */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple to-blue rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h5 className="font-medium">Design Systems Workshop</h5>
                      <p className="text-sm text-muted-foreground">Dec 20, 2024 · 45 registered</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-translucent text-green border-green-30">
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
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          View Attendees
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <QrCode className="h-4 w-4 mr-2" />
                          Check-in
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Draft Event Row */}
                <div className="p-4 flex items-center justify-between opacity-75">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h5 className="font-medium">React Conference 2025</h5>
                      <p className="text-sm text-muted-foreground">Draft · Not published</p>
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
            <CardDescription>User management and social features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Profile Card */}
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-xl font-semibold">John Doe</h4>
                    <Badge className="bg-blue-translucent text-blue border-blue-30">
                      Host
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    Senior Product Designer at TechCorp. Passionate about design systems and user experience.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>12 events hosted</span>
                    <span>234 followers</span>
                    <span>89 following</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>

            {/* Attendee List */}
            <div className="border rounded-lg">
              <div className="p-4 border-b flex items-center justify-between">
                <h4 className="font-semibold">Event Attendees (45)</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send Update
                  </Button>
                </div>
              </div>
              <div className="divide-y max-h-64 overflow-y-auto">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {String.fromCharCode(65 + i)}{String.fromCharCode(65 + i + 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Attendee {i + 1}</p>
                        <p className="text-sm text-muted-foreground">attendee{i + 1}@example.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={i % 2 === 0 ? "bg-green-translucent text-green border-green-30" : ""} 
                             variant={i % 2 === 0 ? "outline" : "secondary"}>
                        {i % 2 === 0 ? "Checked In" : "Registered"}
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
            <CardDescription>Alerts, messages, and communication components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notification List */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 border-blue-200">
                <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">New RSVP for Design Workshop</p>
                  <p className="text-sm text-blue-700">Sarah Johnson just registered for your event</p>
                  <p className="text-xs text-blue-600 mt-1">2 minutes ago</p>
                </div>
                <Button variant="ghost" size="icon" className="text-blue-600">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Event reminder</p>
                  <p className="text-sm text-muted-foreground">React Workshop starts in 2 hours</p>
                  <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Heart className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Event feedback received</p>
                  <p className="text-sm text-muted-foreground">5 new reviews for Design Systems Meetup</p>
                  <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                </div>
              </div>
            </div>

            {/* Message Composer */}
            <div className="border rounded-lg p-4 bg-card">
              <h4 className="font-medium mb-3">Send Update to Attendees</h4>
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
                    <Send className="h-4 w-4 mr-2" />
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
            <CardDescription>Complex forms for event creation and management</CardDescription>
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
                  <Input id="event-subtitle" placeholder="Short description..." />
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
                  <Textarea id="description" placeholder="Describe your event..." rows={4} />
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
                  <Input id="capacity" type="number" placeholder="Maximum attendees..." />
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="public-event" defaultChecked />
                  <Label htmlFor="public-event">Make event public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="allow-waitlist" />
                  <Label htmlFor="allow-waitlist">Allow waitlist when sold out</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="require-approval" />
                  <Label htmlFor="require-approval">Require approval for registration</Label>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Status & Badge System */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Badge System</CardTitle>
            <CardDescription>All possible states and status indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event Status Badges */}
            <div>
              <h4 className="font-medium mb-3">Event Status</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-translucent text-green border-green-30">Live</Badge>
                <Badge className="bg-blue-translucent text-blue border-blue-30">Published</Badge>
                <Badge variant="outline">Draft</Badge>
                <Badge className="bg-orange-translucent text-orange border-orange-30">Upcoming</Badge>
                <Badge variant="secondary">Past</Badge>
                <Badge variant="destructive">Cancelled</Badge>
                <Badge className="bg-purple-translucent text-purple border-purple-30">Sold Out</Badge>
              </div>
            </div>

            {/* User Role Badges */}
            <div>
              <h4 className="font-medium mb-3">User Roles</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-cranberry-translucent text-cranberry border-cranberry-30">Host</Badge>
                <Badge className="bg-blue-translucent text-blue border-blue-30">Co-host</Badge>
                <Badge className="bg-green-translucent text-green border-green-30">Attendee</Badge>
                <Badge className="bg-orange-translucent text-orange border-orange-30">VIP</Badge>
                <Badge className="bg-purple-translucent text-purple border-purple-30">Speaker</Badge>
                <Badge variant="outline">Waitlisted</Badge>
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <h4 className="font-medium mb-3">Payment Status</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-translucent text-green border-green-30">
                  <Check className="h-3 w-3 mr-1" />
                  Paid
                </Badge>
                <Badge className="bg-orange-translucent text-orange border-orange-30">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
                <Badge variant="destructive">
                  <X className="h-3 w-3 mr-1" />
                  Failed
                </Badge>
                <Badge className="bg-blue-translucent text-blue border-blue-30">Free</Badge>
                <Badge variant="outline">Refunded</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Components</CardTitle>
            <CardDescription>Modals, dropdowns, and interactive elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dialog Example */}
            <div>
              <h4 className="font-medium mb-3">Modal Dialogs</h4>
              <div className="flex gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel Event</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Event</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this event? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-6">
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
                    <div className="space-y-4 mt-4">
                      <div className="flex gap-2">
                        <Input value="https://rsvpd.app/events/design-workshop" readOnly />
                        <Button variant="outline">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                        <Button className="flex-1" variant="outline">
                          <Share2 className="h-4 w-4 mr-2" />
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
  );
}
