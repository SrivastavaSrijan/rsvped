'use client'

import {
  BookmarkIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  DownloadIcon,
  HeartIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PlusIcon,
  QrCodeIcon,
  SearchIcon,
  ShareIcon,
  TagIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'
import { useState } from 'react'

// Import all UI components
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

const ComponentSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
)

const ColorSwatch = ({ name, cssVar, description }: { name: string; cssVar: string; description?: string }) => (
  <div className="space-y-2">
    <div className={`w-full h-16 rounded-md border border-gray-20`} style={{ backgroundColor: `var(${cssVar})` }}></div>
    <div>
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-gray-60 font-mono">{cssVar}</p>
      {description && <p className="text-xs text-gray-50">{description}</p>}
    </div>
  </div>
)

export default function ComponentsPreview() {
  const [date, setDate] = useState<Date>()
  const [isChecked, setIsChecked] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">RSVP'd Component Library</h1>
          <p className="text-muted-foreground text-lg">
            Lu.ma-inspired design system built with ShadCN UI and Tailwind CSS v4
          </p>
        </div>

        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Design Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            {/* Brand Colors */}
            <ComponentSection title="Brand Colors">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <ColorSwatch name="Cranberry 50" cssVar="--cranberry-50" description="Primary brand" />
                <ColorSwatch name="Cranberry 60" cssVar="--cranberry-60" />
                <ColorSwatch name="Cranberry 70" cssVar="--cranberry-70" />
                <ColorSwatch name="Cranberry 80" cssVar="--cranberry-80" />
                <ColorSwatch name="Cranberry 90" cssVar="--cranberry-90" />
              </div>
            </ComponentSection>

            {/* Semantic Colors */}
            <ComponentSection title="Semantic Colors">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="Primary" cssVar="--primary" />
                <ColorSwatch name="Secondary" cssVar="--secondary" />
                <ColorSwatch name="Destructive" cssVar="--destructive" />
                <ColorSwatch name="Muted" cssVar="--muted" />
                <ColorSwatch name="Background" cssVar="--background" />
                <ColorSwatch name="Card" cssVar="--card" />
                <ColorSwatch name="Border" cssVar="--border" />
                <ColorSwatch name="Input" cssVar="--input" />
              </div>
            </ComponentSection>

            {/* Gray Scale */}
            <ComponentSection title="Gray Scale">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                <ColorSwatch name="Gray 10" cssVar="--gray-10" />
                <ColorSwatch name="Gray 20" cssVar="--gray-20" />
                <ColorSwatch name="Gray 30" cssVar="--gray-30" />
                <ColorSwatch name="Gray 40" cssVar="--gray-40" />
                <ColorSwatch name="Gray 50" cssVar="--gray-50" />
                <ColorSwatch name="Gray 60" cssVar="--gray-60" />
                <ColorSwatch name="Gray 70" cssVar="--gray-70" />
                <ColorSwatch name="Gray 80" cssVar="--gray-80" />
                <ColorSwatch name="Gray 90" cssVar="--gray-90" />
                <ColorSwatch name="Gray 100" cssVar="--gray-100" />
              </div>
            </ComponentSection>

            {/* Other Color Palettes */}
            <ComponentSection title="Extended Palette">
              <div className="space-y-4">
                {/* Blue */}
                <div>
                  <h4 className="font-medium mb-2">Blue</h4>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(shade => (
                      <ColorSwatch key={shade} name={`Blue ${shade}`} cssVar={`--blue-${shade}`} />
                    ))}
                  </div>
                </div>
                
                {/* Green */}
                <div>
                  <h4 className="font-medium mb-2">Green</h4>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(shade => (
                      <ColorSwatch key={shade} name={`Green ${shade}`} cssVar={`--green-${shade}`} />
                    ))}
                  </div>
                </div>

                {/* Red */}
                <div>
                  <h4 className="font-medium mb-2">Red</h4>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(shade => (
                      <ColorSwatch key={shade} name={`Red ${shade}`} cssVar={`--red-${shade}`} />
                    ))}
                  </div>
                </div>
              </div>
            </ComponentSection>

            {/* Typography */}
            <ComponentSection title="Typography">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold">Heading 1 - 4xl/Bold</h1>
                <h2 className="text-3xl font-semibold">Heading 2 - 3xl/Semibold</h2>
                <h3 className="text-2xl font-semibold">Heading 3 - 2xl/Semibold</h3>
                <h4 className="text-xl font-medium">Heading 4 - xl/Medium</h4>
                <p className="text-base">Body text - base/regular with good readability and proper line height.</p>
                <p className="text-sm text-muted-foreground">Small text - sm/regular for supporting information.</p>
                <p className="text-xs text-muted-foreground">Caption text - xs/regular for fine print and labels.</p>
              </div>
            </ComponentSection>

            {/* Spacing */}
            <ComponentSection title="Spacing Scale">
              <div className="space-y-2">
                {[
                  { name: 'XS', value: 'xs', px: '2px' },
                  { name: 'SM', value: '1', px: '4px' },
                  { name: 'MD', value: '2', px: '8px' },
                  { name: 'LG', value: '3', px: '16px' },
                  { name: 'XL', value: '4', px: '24px' },
                  { name: '2XL', value: '5', px: '48px' },
                ].map(({ name, value, px }) => (
                  <div key={name} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-mono">{name}</div>
                    <div className="w-20 text-xs text-muted-foreground">{px}</div>
                    <div className={`bg-cranberry-50 rounded-sm`} style={{ width: `var(--spacing-${value})`, height: '16px' }}></div>
                  </div>
                ))}
              </div>
            </ComponentSection>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            {/* Buttons */}
            <ComponentSection title="Buttons">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon"><PlusIcon className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled>Disabled</Button>
                  <Button><CalendarIcon className="w-4 h-4 mr-2" />With Icon</Button>
                </div>
              </div>
            </ComponentSection>

            {/* Badges */}
            <ComponentSection title="Badges">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="bg-green-50 text-green-70">Custom</Badge>
              </div>
            </ComponentSection>

            {/* Avatars */}
            <ComponentSection title="Avatars">
              <div className="flex gap-4 items-center">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <Avatar className="w-12 h-12">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" />
                  <AvatarFallback>LG</AvatarFallback>
                </Avatar>
              </div>
            </ComponentSection>

            {/* Cards */}
            <ComponentSection title="Cards">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Simple Card</CardTitle>
                    <CardDescription>A basic card with header and content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Card content goes here.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Card with Footer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">This card has a footer with actions.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="mr-2">Cancel</Button>
                    <Button>Confirm</Button>
                  </CardFooter>
                </Card>
              </div>
            </ComponentSection>

            {/* Dialogs */}
            <ComponentSection title="Dialogs & Modals">
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog Title</DialogTitle>
                      <DialogDescription>
                        This is a dialog description explaining what this dialog does.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </ComponentSection>

            {/* Dropdowns */}
            <ComponentSection title="Dropdown Menus">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreHorizontalIcon className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-50">Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ComponentSection>

            {/* Tables */}
            <ComponentSection title="Tables">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">RSVP Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">John Doe</TableCell>
                    <TableCell><Badge className="bg-green-50 text-green-70">Confirmed</Badge></TableCell>
                    <TableCell>john@example.com</TableCell>
                    <TableCell className="text-right">2025-07-15</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Jane Smith</TableCell>
                    <TableCell><Badge variant="outline">Pending</Badge></TableCell>
                    <TableCell>jane@example.com</TableCell>
                    <TableCell className="text-right">2025-07-14</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ComponentSection>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            {/* Input Fields */}
            <ComponentSection title="Input Fields">
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter password" />
                </div>
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="search" placeholder="Search events..." className="pl-10" />
                  </div>
                </div>
              </div>
            </ComponentSection>

            {/* Textarea */}
            <ComponentSection title="Textarea">
              <div className="max-w-md">
                <Label htmlFor="description">Event Description</Label>
                <Textarea id="description" placeholder="Describe your event..." rows={4} />
              </div>
            </ComponentSection>

            {/* Select */}
            <ComponentSection title="Select Dropdowns">
              <div className="max-w-md space-y-4">
                <div>
                  <Label>Event Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ComponentSection>

            {/* Checkboxes and Radio */}
            <ComponentSection title="Checkboxes & Radio Groups">
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Preferences</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="newsletter" checked={isChecked} onCheckedChange={setIsChecked} />
                      <Label htmlFor="newsletter">Subscribe to newsletter</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notifications" />
                      <Label htmlFor="notifications">Email notifications</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Event Type</Label>
                  <RadioGroup defaultValue="in-person" className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in-person" id="in-person" />
                      <Label htmlFor="in-person">In-person</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="virtual" id="virtual" />
                      <Label htmlFor="virtual">Virtual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hybrid" id="hybrid" />
                      <Label htmlFor="hybrid">Hybrid</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </ComponentSection>

            {/* Switch */}
            <ComponentSection title="Switches">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="public-event" />
                  <Label htmlFor="public-event">Make event public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-approve" />
                  <Label htmlFor="auto-approve">Auto-approve RSVPs</Label>
                </div>
              </div>
            </ComponentSection>

            {/* Calendar */}
            <ComponentSection title="Calendar">
              <div className="max-w-fit">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>
            </ComponentSection>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            {/* Event Card */}
            <ComponentSection title="Event Card (Lu.ma Style)">
              <Card className="max-w-sm">
                <div className="aspect-video bg-gradient-to-r from-cranberry-50 to-purple-50 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-cranberry-50/10 text-cranberry-50 border-cranberry-50/20">
                      Tech Meetup
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <BookmarkIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ShareIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold mb-2 text-lg">Next.js 15 Workshop</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Learn the latest features in Next.js 15 including the new App Router and React 19 integration.
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarIcon className="w-4 h-4" />
                      <span>July 25, 2025 • 6:00 PM PST</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPinIcon className="w-4 h-4" />
                      <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UsersIcon className="w-4 h-4" />
                      <span>42 attending • 8 spots left</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                        <AvatarFallback className="text-xs">JD</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">by John Doe</span>
                    </div>
                    <Button size="sm">
                      RSVP for Free
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ComponentSection>

            {/* Event Status Examples */}
            <ComponentSection title="Event Status Examples">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="w-3 h-3 bg-green-50 rounded-full"></div>
                  <div>
                    <p className="font-medium">Available</p>
                    <p className="text-sm text-muted-foreground">42 spots remaining</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="w-3 h-3 bg-yellow-50 rounded-full"></div>
                  <div>
                    <p className="font-medium">Almost Full</p>
                    <p className="text-sm text-muted-foreground">3 spots remaining</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="w-3 h-3 bg-red-50 rounded-full"></div>
                  <div>
                    <p className="font-medium">Sold Out</p>
                    <p className="text-sm text-muted-foreground">Join waitlist</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="w-3 h-3 bg-gray-50 rounded-full"></div>
                  <div>
                    <p className="font-medium">Event Ended</p>
                    <p className="text-sm text-muted-foreground">Check out photos</p>
                  </div>
                </div>
              </div>
            </ComponentSection>

            {/* Usage Guide */}
            <ComponentSection title="Usage Guide">
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Color Usage</h4>
                  <div className="space-y-1 pl-4">
                    <p>• <code className="bg-muted px-1 rounded text-xs">text-cranberry-50</code> for primary brand text</p>
                    <p>• <code className="bg-muted px-1 rounded text-xs">bg-gray-10</code> for light backgrounds</p>
                    <p>• <code className="bg-muted px-1 rounded text-xs">border-gray-20</code> for subtle borders</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Component Patterns</h4>
                  <div className="space-y-1 pl-4">
                    <p>• Use <code className="bg-muted px-1 rounded text-xs">Card</code> components for event listings</p>
                    <p>• <code className="bg-muted px-1 rounded text-xs">Badge</code> components for status indicators</p>
                    <p>• <code className="bg-muted px-1 rounded text-xs">Avatar</code> for user profiles and event hosts</p>
                  </div>
                </div>
              </div>
            </ComponentSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}