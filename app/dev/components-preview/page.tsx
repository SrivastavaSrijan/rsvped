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
      <CardTitle className="text-lg font-semibold text-primary-color">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
)

const ColorSwatch = ({ name, cssVar, description }: { 
  name: string; 
  cssVar: string; 
  description?: string 
}) => (
  <div className="space-y-2">
    <div 
      className="w-full h-16 rounded-md border border-secondary-border-color"
      style={{ backgroundColor: `var(${cssVar})` }}
    ></div>
    <div>
      <p className="text-sm font-medium text-primary-color">{name}</p>
      <p className="text-xs text-tertiary-color font-mono">{cssVar}</p>
      {description && <p className="text-xs text-quaternary-color">{description}</p>}
    </div>
  </div>
)

const LumaExample = ({ title, children, className = "" }: { 
  title: string; 
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-3 ${className}`}>
    <h5 className="text-sm font-medium text-secondary-color">{title}</h5>
    {children}
  </div>
)

const PatternShowcase = ({ pattern, description, children }: {
  pattern: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3 p-4 rounded-lg border border-secondary-border-color bg-secondary-bg-color">
    <div>
      <h6 className="font-medium text-primary-color">{pattern}</h6>
      <p className="text-sm text-tertiary-color">{description}</p>
    </div>
    {children}
  </div>
)

export default function ComponentsPreview() {
  const [date, setDate] = useState<Date>()
  const [isChecked, setIsChecked] = useState(false)

  return (
    <div className="min-h-screen bg-primary-bg-color">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2 text-primary-color">RSVP'd Component Library</h1>
          <p className="text-secondary-color text-lg">
            Lu.ma-inspired design system with comprehensive design tokens
          </p>
        </div>

        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-secondary-bg-color border border-secondary-border-color">
            <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
            <TabsTrigger value="patterns">Lu.ma Patterns</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Design Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            {/* Lu.ma Color System */}
            <ComponentSection title="Lu.ma Color System">
              <div className="space-y-6">
                {/* Brand Colors */}
                <div>
                  <h4 className="font-medium mb-3 text-primary-color">Brand Colors</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <ColorSwatch name="Brand Color" cssVar="--color-brand-color" description="Primary brand" />
                    <ColorSwatch name="Brand Active" cssVar="--color-brand-active-color" description="Hover/active" />
                    <ColorSwatch name="Brand Pale" cssVar="--color-brand-pale-bg-color" description="Pale background" />
                    <ColorSwatch name="Brand Faint" cssVar="--color-brand-faint-bg-color" description="Faint background" />
                  </div>
                </div>

                {/* Semantic Colors */}
                <div>
                  <h4 className="font-medium mb-3 text-primary-color">Semantic Colors</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ColorSwatch name="Success" cssVar="--color-success-color" />
                    <ColorSwatch name="Success Pale" cssVar="--color-success-pale-bg-color" />
                    <ColorSwatch name="Error" cssVar="--color-error-color" />
                    <ColorSwatch name="Error Pale" cssVar="--color-error-pale-bg-color" />
                    <ColorSwatch name="Warning" cssVar="--color-warning-color" />
                    <ColorSwatch name="Warning Pale" cssVar="--color-warning-pale-bg-color" />
                    <ColorSwatch name="Info" cssVar="--color-info-color" />
                    <ColorSwatch name="Info Pale" cssVar="--color-info-pale-bg-color" />
                  </div>
                </div>

                {/* Background Hierarchy */}
                <div>
                  <h4 className="font-medium mb-3 text-primary-color">Background Hierarchy</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ColorSwatch name="Primary BG" cssVar="--color-primary-bg-color" description="Main background" />
                    <ColorSwatch name="Secondary BG" cssVar="--color-secondary-bg-color" description="Cards, panels" />
                    <ColorSwatch name="Tertiary BG" cssVar="--color-tertiary-bg-color" description="Subtle sections" />
                    <ColorSwatch name="Raised BG" cssVar="--color-raised-bg-color" description="Elevated content" />
                  </div>
                </div>

                {/* Text Hierarchy */}
                <div>
                  <h4 className="font-medium mb-3 text-primary-color">Text Hierarchy</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ColorSwatch name="Primary Text" cssVar="--color-primary-color" description="Headings, emphasis" />
                    <ColorSwatch name="Secondary Text" cssVar="--color-secondary-color" description="Body text" />
                    <ColorSwatch name="Tertiary Text" cssVar="--color-tertiary-color" description="Supporting text" />
                    <ColorSwatch name="Quaternary Text" cssVar="--color-quaternary-color" description="Subtle text" />
                  </div>
                </div>

                {/* Border System */}
                <div>
                  <h4 className="font-medium mb-3 text-primary-color">Border System</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ColorSwatch name="Primary Border" cssVar="--color-primary-border-color" />
                    <ColorSwatch name="Secondary Border" cssVar="--color-secondary-border-color" />
                    <ColorSwatch name="Tertiary Border" cssVar="--color-tertiary-border-color" />
                    <ColorSwatch name="Focus Border" cssVar="--color-focus-border-color" />
                  </div>
                </div>
              </div>
            </ComponentSection>

            {/* Raw Color Palette */}
            <ComponentSection title="Raw Color Palette">
              <div className="space-y-6">
                {/* Cranberry */}
                <div>
                  <h4 className="font-medium mb-3 text-cranberry-50">Cranberry (Brand)</h4>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(shade => (
                      <ColorSwatch key={shade} name={`${shade}`} cssVar={`--color-cranberry-${shade}`} />
                    ))}
                  </div>
                </div>

                {/* Purple & Barney */}
                <div>
                  <h4 className="font-medium mb-3 text-purple-50">Purple & Barney</h4>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(shade => (
                      <ColorSwatch key={shade} name={`P${shade}`} cssVar={`--color-purple-${shade}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mt-2">
                    {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(shade => (
                      <ColorSwatch key={shade} name={`B${shade}`} cssVar={`--color-barney-${shade}`} />
                    ))}
                  </div>
                </div>

                {/* Functional Colors */}
                <div>
                  <h4 className="font-medium mb-3 text-blue-50">Functional Colors</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(shade => (
                        <ColorSwatch key={shade} name={`Blue ${shade}`} cssVar={`--color-blue-${shade}`} />
                      ))}
                    </div>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(shade => (
                        <ColorSwatch key={shade} name={`Green ${shade}`} cssVar={`--color-green-${shade}`} />
                      ))}
                    </div>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(shade => (
                        <ColorSwatch key={shade} name={`Red ${shade}`} cssVar={`--color-red-${shade}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Translucent Colors */}
                <div>
                  <h4 className="font-medium mb-3 text-primary-color">Translucent & Pale Colors</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ColorSwatch name="Pale Cranberry" cssVar="--color-pale-cranberry" />
                    <ColorSwatch name="Faint Cranberry" cssVar="--color-faint-cranberry" />
                    <ColorSwatch name="Pale Blue" cssVar="--color-pale-blue" />
                    <ColorSwatch name="Faint Blue" cssVar="--color-faint-blue" />
                    <ColorSwatch name="Pale Green" cssVar="--color-pale-green" />
                    <ColorSwatch name="Darker Pale Green" cssVar="--color-darker-pale-green" />
                    <ColorSwatch name="Pale Red" cssVar="--color-pale-red" />
                    <ColorSwatch name="Half Red" cssVar="--color-half-red" />
                  </div>
                </div>
              </div>
            </ComponentSection>

            {/* Typography System */}
            <ComponentSection title="Typography System">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold text-primary-color">Display - 5xl/Bold</h1>
                  <h1 className="text-4xl font-bold text-primary-color">Heading 1 - 4xl/Bold</h1>
                  <h2 className="text-3xl font-semibold text-primary-color">Heading 2 - 3xl/Semibold</h2>
                  <h3 className="text-2xl font-semibold text-secondary-color">Heading 3 - 2xl/Semibold</h3>
                  <h4 className="text-xl font-medium text-secondary-color">Heading 4 - xl/Medium</h4>
                  <p className="text-lg text-secondary-color">Large body text - lg/regular for introductions and important content.</p>
                  <p className="text-base text-secondary-color">Body text - base/regular with optimal readability and proper line height for sustained reading.</p>
                  <p className="text-sm text-tertiary-color">Small text - sm/regular for supporting information and secondary content.</p>
                  <p className="text-xs text-quaternary-color">Caption text - xs/regular for fine print, labels, and metadata.</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-primary-color">Font Weights & Variants</h4>
                  <div className="space-y-1">
                    <p className="font-light text-secondary-color">Light (300) - For large display text</p>
                    <p className="font-normal text-secondary-color">Regular (400) - Default body text</p>
                    <p className="font-medium text-secondary-color">Medium (500) - Emphasized content</p>
                    <p className="font-semibold text-secondary-color">Semibold (600) - Headings and labels</p>
                    <p className="font-bold text-secondary-color">Bold (700) - Strong emphasis</p>
                  </div>
                </div>
              </div>
            </ComponentSection>

            {/* Layout Tokens */}
            <ComponentSection title="Layout & Spacing Tokens">
              <div className="space-y-6">
                {/* Lu.ma Spacing Scale */}
                <div>
                  <h4 className="font-medium mb-3 text-primary-color">Lu.ma Spacing Scale</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'XS', var: '--spacing-xs', px: '2px' },
                      { name: 'SM', var: '--spacing-1', px: '4px' },
                      { name: 'MD', var: '--spacing-2', px: '8px' },
                      { name: 'LG', var: '--spacing-3', px: '16px' },
                      { name: 'XL', var: '--spacing-4', px: '24px' },
                      { name: '2XL', var: '--spacing-5', px: '48px' },
                    ].map(({ name, var: cssVar, px }) => (
                      <div key={name} className="flex items-center gap-4">
                        <div className="w-16 text-sm font-mono text-tertiary-color">{name}</div>
                        <div className="w-20 text-xs text-quaternary-color">{px}</div>
                        <div className="bg-brand-color rounded-sm" style={{ width: `var(${cssVar})`, height: '16px' }}></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Component-specific Spacing */}
                <div>
                  <h4 className="font-medium mb-3 text-primary-color">Component-Specific Spacing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-3 bg-secondary-bg-color rounded border border-secondary-border-color">
                      <span className="text-secondary-color">Content Card Padding</span>
                      <span className="font-mono text-tertiary-color">var(--content-card-padding)</span>
                    </div>
                    <div className="flex justify-between p-3 bg-secondary-bg-color rounded border border-secondary-border-color">
                      <span className="text-secondary-color">Event Row Padding</span>
                      <span className="font-mono text-tertiary-color">var(--event-row-padding)</span>
                    </div>
                    <div className="flex justify-between p-3 bg-secondary-bg-color rounded border border-secondary-border-color">
                      <span className="text-secondary-color">Base List Row Padding</span>
                      <span className="font-mono text-tertiary-color">var(--base-list-row-default-padding)</span>
                    </div>
                  </div>
                </div>

                {/* Layout Constants */}
                <div>
                  <h4 className="font-medium mb-3 text-primary-color">Layout Constants</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-3 bg-secondary-bg-color rounded border border-secondary-border-color">
                      <span className="text-secondary-color">Max Width</span>
                      <span className="font-mono text-tertiary-color">820px</span>
                    </div>
                    <div className="flex justify-between p-3 bg-secondary-bg-color rounded border border-secondary-border-color">
                      <span className="text-secondary-color">Max Width Wide</span>
                      <span className="font-mono text-tertiary-color">960px</span>
                    </div>
                    <div className="flex justify-between p-3 bg-secondary-bg-color rounded border border-secondary-border-color">
                      <span className="text-secondary-color">Max Width Extra Wide</span>
                      <span className="font-mono text-tertiary-color">1080px</span>
                    </div>
                  </div>
                </div>
              </div>
            </ComponentSection>
          </TabsContent>

          {/* Lu.ma Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            {/* Event Cards */}
            <ComponentSection title="Event Card Patterns">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Primary Event Card */}
                <PatternShowcase pattern="Primary Event Card" description="Main event listing card with image, metadata, and actions">
                  <Card className="bg-secondary-bg-color border-secondary-border-color">
                    <div className="aspect-video bg-gradient-to-r from-cranberry-50 to-purple-50 rounded-t-lg"></div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className="bg-brand-pale-bg-color text-brand-color border-brand-color/20">
                          Tech Meetup
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-tertiary-color hover:text-brand-color">
                            <BookmarkIcon className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-tertiary-color hover:text-brand-color">
                            <ShareIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <h3 className="font-semibold mb-2 text-lg text-primary-color">Next.js 15 Workshop</h3>
                      <p className="text-tertiary-color text-sm mb-4">
                        Learn the latest features in Next.js 15 including the new App Router and React 19 integration.
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-tertiary-color">
                          <CalendarIcon className="w-4 h-4" />
                          <span>July 25, 2025 • 6:00 PM PST</span>
                        </div>
                        <div className="flex items-center gap-2 text-tertiary-color">
                          <MapPinIcon className="w-4 h-4" />
                          <span>San Francisco, CA</span>
                        </div>
                        <div className="flex items-center gap-2 text-tertiary-color">
                          <UsersIcon className="w-4 h-4" />
                          <span>42 attending • 8 spots left</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                            <AvatarFallback className="text-xs bg-tertiary-bg-color">JD</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-tertiary-color">by John Doe</span>
                        </div>
                        <Button size="sm" className="bg-brand-color hover:bg-brand-active-color">
                          RSVP for Free
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </PatternShowcase>

                {/* Compact Event Card */}
                <PatternShowcase pattern="Compact Event Card" description="Horizontal layout for lists and search results">
                  <Card className="bg-secondary-bg-color border-secondary-border-color">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-40 to-green-40 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-primary-color truncate">Design System Workshop</h4>
                            <Badge variant="outline" className="text-xs border-success-color text-success-color">
                              Available
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-tertiary-color">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              <span>Aug 15 • 2:00 PM</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <UsersIcon className="w-3 h-3" />
                              <span>25 attending</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </PatternShowcase>
              </div>
            </ComponentSection>

            {/* Status Patterns */}
            <ComponentSection title="Status & State Patterns">
              <div className="space-y-4">
                <PatternShowcase pattern="Event Status Indicators" description="Visual status system for events">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-3 p-3 bg-success-pale-bg-color border border-success-color/20 rounded-lg">
                      <div className="w-3 h-3 bg-success-color rounded-full"></div>
                      <div>
                        <p className="font-medium text-success-color">Available</p>
                        <p className="text-sm text-tertiary-color">42 spots remaining</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-warning-pale-bg-color border border-warning-color/20 rounded-lg">
                      <div className="w-3 h-3 bg-warning-color rounded-full"></div>
                      <div>
                        <p className="font-medium text-warning-color">Almost Full</p>
                        <p className="text-sm text-tertiary-color">3 spots remaining</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-error-pale-bg-color border border-error-color/20 rounded-lg">
                      <div className="w-3 h-3 bg-error-color rounded-full"></div>
                      <div>
                        <p className="font-medium text-error-color">Sold Out</p>
                        <p className="text-sm text-tertiary-color">Join waitlist</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-tertiary-bg-color border border-tertiary-border-color rounded-lg">
                      <div className="w-3 h-3 bg-quaternary-color rounded-full"></div>
                      <div>
                        <p className="font-medium text-quaternary-color">Event Ended</p>
                        <p className="text-sm text-tertiary-color">Check out photos</p>
                      </div>
                    </div>
                  </div>
                </PatternShowcase>

                <PatternShowcase pattern="RSVP Status Badges" description="User RSVP status indicators">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-success-color text-white">Confirmed</Badge>
                    <Badge className="bg-warning-color text-white">Pending</Badge>
                    <Badge className="bg-info-color text-white">Waitlisted</Badge>
                    <Badge variant="outline" className="border-quaternary-color text-quaternary-color">Declined</Badge>
                    <Badge className="bg-brand-color text-white">Host</Badge>
                  </div>
                </PatternShowcase>
              </div>
            </ComponentSection>

            {/* Interactive Patterns */}
            <ComponentSection title="Interactive Patterns">
              <div className="space-y-4">
                <PatternShowcase pattern="Action Buttons" description="Primary actions for events">
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-brand-color hover:bg-brand-active-color">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      RSVP Now
                    </Button>
                    <Button variant="outline" className="border-brand-color text-brand-color hover:bg-brand-pale-bg-color">
                      <ShareIcon className="w-4 h-4 mr-2" />
                      Share Event
                    </Button>
                    <Button variant="ghost" className="text-tertiary-color hover:text-brand-color">
                      <BookmarkIcon className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </PatternShowcase>

                <PatternShowcase pattern="Event Actions Menu" description="Contextual actions for event management">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-tertiary-color hover:text-brand-color">
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-secondary-bg-color border-secondary-border-color">
                      <DropdownMenuItem className="text-secondary-color">
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Add to Calendar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-secondary-color">
                        <ShareIcon className="w-4 h-4 mr-2" />
                        Share Event
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-secondary-color">
                        <QrCodeIcon className="w-4 h-4 mr-2" />
                        View QR Code
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-secondary-border-color" />
                      <DropdownMenuItem className="text-error-color">
                        <XIcon className="w-4 h-4 mr-2" />
                        Cancel RSVP
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </PatternShowcase>
              </div>
            </ComponentSection>

            {/* List Patterns */}
            <ComponentSection title="List & Table Patterns">
              <PatternShowcase pattern="Attendee List" description="Event attendee management table">
                <div className="bg-secondary-bg-color rounded-lg border border-secondary-border-color overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-secondary-border-color">
                        <TableHead className="text-secondary-color">Attendee</TableHead>
                        <TableHead className="text-secondary-color">Status</TableHead>
                        <TableHead className="text-secondary-color">RSVP Date</TableHead>
                        <TableHead className="text-secondary-color">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-b border-tertiary-border-color">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                              <AvatarFallback className="bg-tertiary-bg-color text-tertiary-color">JD</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-primary-color">John Doe</p>
                              <p className="text-sm text-tertiary-color">john@example.com</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-success-color text-white">Confirmed</Badge>
                        </TableCell>
                        <TableCell className="text-tertiary-color">July 15, 2025</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-tertiary-color hover:text-brand-color">
                            <CheckIcon className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-tertiary-bg-color text-tertiary-color">JS</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-primary-color">Jane Smith</p>
                              <p className="text-sm text-tertiary-color">jane@example.com</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-warning-color text-warning-color">Pending</Badge>
                        </TableCell>
                        <TableCell className="text-tertiary-color">July 14, 2025</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-tertiary-color hover:text-brand-color">
                            <ClockIcon className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </PatternShowcase>
            </ComponentSection>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            {/* Standard ShadCN Components with Lu.ma theming */}
            <ComponentSection title="Buttons">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Primary</Button>
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
              </div>
            </ComponentSection>

            <ComponentSection title="Form Components">
              <div className="max-w-md space-y-4">
                <div>
                  <Label htmlFor="event-name" className="text-secondary-color">Event Name</Label>
                  <Input id="event-name" placeholder="Enter event name" className="bg-primary-bg-color border-secondary-border-color" />
                </div>
                <div>
                  <Label htmlFor="description" className="text-secondary-color">Description</Label>
                  <Textarea id="description" placeholder="Describe your event..." rows={3} className="bg-primary-bg-color border-secondary-border-color" />
                </div>
                <div>
                  <Label className="text-secondary-color">Category</Label>
                  <Select>
                    <SelectTrigger className="bg-primary-bg-color border-secondary-border-color">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary-bg-color border-secondary-border-color">
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ComponentSection>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <ComponentSection title="Event Creation Form">
              <PatternShowcase pattern="Complete Event Form" description="Full event creation form with Lu.ma styling">
                <form className="space-y-6 max-w-2xl">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="title" className="text-secondary-color">Event Title</Label>
                      <Input id="title" placeholder="Amazing Tech Meetup" className="bg-primary-bg-color border-secondary-border-color" />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-secondary-color">Category</Label>
                      <Select>
                        <SelectTrigger className="bg-primary-bg-color border-secondary-border-color">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-secondary-bg-color border-secondary-border-color">
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-secondary-color">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Tell people what your event is about..." 
                      rows={4} 
                      className="bg-primary-bg-color border-secondary-border-color" 
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="date" className="text-secondary-color">Date & Time</Label>
                      <Input id="date" type="datetime-local" className="bg-primary-bg-color border-secondary-border-color" />
                    </div>
                    <div>
                      <Label htmlFor="capacity" className="text-secondary-color">Capacity</Label>
                      <Input id="capacity" type="number" placeholder="50" className="bg-primary-bg-color border-secondary-border-color" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-secondary-color">Location</Label>
                    <Input id="location" placeholder="123 Main St, San Francisco, CA" className="bg-primary-bg-color border-secondary-border-color" />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-secondary-color">Event Settings</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="public" />
                        <Label htmlFor="public" className="text-tertiary-color">Make event public</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-approve" />
                        <Label htmlFor="auto-approve" className="text-tertiary-color">Auto-approve RSVPs</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="bg-brand-color hover:bg-brand-active-color">
                      Create Event
                    </Button>
                    <Button type="button" variant="outline" className="border-secondary-border-color text-tertiary-color">
                      Save Draft
                    </Button>
                  </div>
                </form>
              </PatternShowcase>
            </ComponentSection>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <ComponentSection title="Complete Lu.ma Examples">
              <div className="space-y-8">
                {/* Event Discovery Page */}
                <PatternShowcase pattern="Event Discovery Layout" description="Main event listing page layout">
                  <div className="bg-primary-bg-color p-6 rounded-lg border border-secondary-border-color">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-primary-color">Discover Events</h2>
                        <p className="text-tertiary-color">Find amazing events in your area</p>
                      </div>
                      <Button className="bg-brand-color hover:bg-brand-active-color">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                      <div className="relative max-w-md">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tertiary-color" />
                        <Input 
                          placeholder="Search events..." 
                          className="pl-10 bg-secondary-bg-color border-secondary-border-color" 
                        />
                      </div>
                    </div>

                    {/* Event Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="bg-secondary-bg-color border-secondary-border-color">
                          <div className="aspect-video bg-gradient-to-r from-blue-40 to-green-40 rounded-t-lg"></div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <Badge className="bg-brand-pale-bg-color text-brand-color border-brand-color/20">
                                Tech
                              </Badge>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-tertiary-color hover:text-brand-color">
                                <HeartIcon className="w-3 h-3" />
                              </Button>
                            </div>
                            <h4 className="font-medium text-primary-color mb-1">React Conference {i}</h4>
                            <p className="text-sm text-tertiary-color mb-3">Learn React 19 features</p>
                            <div className="flex items-center justify-between text-xs text-tertiary-color">
                              <span>Aug {15 + i} • 2:00 PM</span>
                              <span>{20 + i * 5} attending</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </PatternShowcase>

                {/* Event Detail Page */}
                <PatternShowcase pattern="Event Detail Layout" description="Individual event page with all details">
                  <div className="bg-primary-bg-color rounded-lg border border-secondary-border-color overflow-hidden">
                    {/* Hero Image */}
                    <div className="aspect-[3/1] bg-gradient-to-r from-purple-40 to-cranberry-40 relative">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <Badge className="bg-white/20 text-white border-white/30 mb-3">
                          Technology Conference
                        </Badge>
                        <h1 className="text-3xl font-bold text-white mb-2">React Universe Conference 2025</h1>
                        <p className="text-white/90">The premier React conference bringing together developers worldwide</p>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                          <div>
                            <h3 className="font-semibold text-primary-color mb-3">About this event</h3>
                            <p className="text-secondary-color">
                              Join us for an incredible day of learning about React 19, Next.js 15, and the future of web development. 
                              We'll have amazing speakers from Meta, Vercel, and other leading companies.
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold text-primary-color mb-3">Schedule</h3>
                            <div className="space-y-3">
                              {[
                                { time: "9:00 AM", title: "Registration & Coffee", speaker: "" },
                                { time: "10:00 AM", title: "React 19 Deep Dive", speaker: "Dan Abramov" },
                                { time: "11:30 AM", title: "Next.js 15 Features", speaker: "Lee Robinson" },
                              ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-3 bg-secondary-bg-color rounded border border-secondary-border-color">
                                  <div className="text-sm font-mono text-tertiary-color w-20">{item.time}</div>
                                  <div>
                                    <p className="font-medium text-primary-color">{item.title}</p>
                                    {item.speaker && <p className="text-sm text-tertiary-color">{item.speaker}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                          <Card className="bg-secondary-bg-color border-secondary-border-color">
                            <CardContent className="p-6 space-y-4">
                              <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                  <CalendarIcon className="w-4 h-4 text-tertiary-color" />
                                  <div>
                                    <p className="text-primary-color">August 15, 2025</p>
                                    <p className="text-tertiary-color">9:00 AM - 5:00 PM PST</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <MapPinIcon className="w-4 h-4 text-tertiary-color" />
                                  <div>
                                    <p className="text-primary-color">Moscone Center</p>
                                    <p className="text-tertiary-color">San Francisco, CA</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <UsersIcon className="w-4 h-4 text-tertiary-color" />
                                  <div>
                                    <p className="text-primary-color">847 attending</p>
                                    <p className="text-tertiary-color">153 spots left</p>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-tertiary-border-color">
                                <Button className="w-full bg-brand-color hover:bg-brand-active-color mb-2">
                                  Register Now - $99
                                </Button>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="flex-1 border-secondary-border-color text-tertiary-color">
                                    <ShareIcon className="w-4 h-4 mr-1" />
                                    Share
                                  </Button>
                                  <Button variant="outline" size="sm" className="flex-1 border-secondary-border-color text-tertiary-color">
                                    <BookmarkIcon className="w-4 h-4 mr-1" />
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Host Info */}
                          <Card className="bg-secondary-bg-color border-secondary-border-color">
                            <CardContent className="p-6">
                              <h4 className="font-medium text-primary-color mb-3">Hosted by</h4>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                                  <AvatarFallback className="bg-tertiary-bg-color">RC</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-primary-color">React Community</p>
                                  <p className="text-sm text-tertiary-color">15.2k followers</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                </PatternShowcase>
              </div>
            </ComponentSection>

            {/* Usage Guidelines */}
            <ComponentSection title="Design System Usage">
              <div className="space-y-4">
                <PatternShowcase pattern="Color Usage Guidelines" description="How to properly use the Lu.ma color system">
                  <div className="space-y-3 text-sm">
                    <div className="space-y-1">
                      <h6 className="font-medium text-primary-color">Text Hierarchy</h6>
                      <div className="pl-4 space-y-1">
                        <p>• <code className="bg-secondary-bg-color px-2 py-1 rounded text-xs font-mono">text-primary-color</code> for headings and primary content</p>
                        <p>• <code className="bg-secondary-bg-color px-2 py-1 rounded text-xs font-mono">text-secondary-color</code> for body text</p>
                        <p>• <code className="bg-secondary-bg-color px-2 py-1 rounded text-xs font-mono">text-tertiary-color</code> for supporting text</p>
                        <p>• <code className="bg-secondary-bg-color px-2 py-1 rounded text-xs font-mono">text-quaternary-color</code> for subtle text</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h6 className="font-medium text-primary-color">Background Layers</h6>
                      <div className="pl-4 space-y-1">
                        <p>• <code className="bg-secondary-bg-color px-2 py-1 rounded text-xs font-mono">bg-primary-bg-color</code> for main page background</p>
                        <p>• <code className="bg-secondary-bg-color px-2 py-1 rounded text-xs font-mono">bg-secondary-bg-color</code> for cards and panels</p>
                        <p>• <code className="bg-secondary-bg-color px-2 py-1 rounded text-xs font-mono">bg-raised-bg-color</code> for elevated content</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h6 className="font-medium text-primary-color">Interactive Elements</h6>
                      <div className="pl-4 space-y-1">
                        <p>• <code className="bg-secondary-bg-color px-2 py-1 rounded text-xs font-mono">bg-brand-color</code> for primary actions</p>
                        <p>• <code className="bg-secondary-bg-color px-2 py-1 rounded text-xs font-mono">bg-brand-pale-bg-color</code> for subtle brand accents</p>
                        <p>• <code className="bg-secondary-bg-color px-2 py-1 rounded text-xs font-mono">border-focus-border-color</code> for focus states</p>
                      </div>
                    </div>
                  </div>
                </PatternShowcase>

                <PatternShowcase pattern="Component Guidelines" description="Best practices for using components">
                  <div className="space-y-3 text-sm">
                    <div className="space-y-1">
                      <h6 className="font-medium text-primary-color">Event Cards</h6>
                      <div className="pl-4 space-y-1">
                        <p>• Always include event image, title, date, and location</p>
                        <p>• Use appropriate status badges for availability</p>
                        <p>• Include host information and attendee count</p>
                        <p>• Provide clear call-to-action buttons</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h6 className="font-medium text-primary-color">Forms</h6>
                      <div className="pl-4 space-y-1">
                        <p>• Use clear, descriptive labels</p>
                        <p>• Group related fields together</p>
                        <p>• Provide helpful placeholder text</p>
                        <p>• Use appropriate input types and validation</p>
                      </div>
                    </div>
                  </div>
                </PatternShowcase>
              </div>
            </ComponentSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}