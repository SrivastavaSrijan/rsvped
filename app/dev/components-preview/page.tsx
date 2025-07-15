"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Users } from "lucide-react";

export default function ComponentsPreviewPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
            Lu.ma Design System
          </h1>
          <p className="text-lg text-muted-foreground">
            ShadCN components with Lu.ma design tokens
          </p>
        </div>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color System</CardTitle>
            <CardDescription>
              ShadCN semantic tokens + direct Lu.ma color access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ShadCN Semantic Colors */}
            <div>
              <h4 className="font-medium mb-3">ShadCN Semantic Colors</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-primary rounded-lg border"></div>
                  <p className="text-sm text-muted-foreground">primary</p>
                </div>
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-secondary rounded-lg border"></div>
                  <p className="text-sm text-muted-foreground">secondary</p>
                </div>
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-muted rounded-lg border"></div>
                  <p className="text-sm text-muted-foreground">muted</p>
                </div>
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-destructive rounded-lg border"></div>
                  <p className="text-sm text-muted-foreground">destructive</p>
                </div>
              </div>
            </div>

            {/* Direct Lu.ma Colors */}
            <div>
              <h4 className="font-medium mb-3">Direct Lu.ma Colors</h4>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-cranberry rounded-lg border"></div>
                  <p className="text-sm text-muted-foreground">cranberry</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-blue rounded-lg border"></div>
                  <p className="text-sm text-muted-foreground">blue</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-green rounded-lg border"></div>
                  <p className="text-sm text-muted-foreground">green</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-orange rounded-lg border"></div>
                  <p className="text-sm text-muted-foreground">orange</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-purple rounded-lg border"></div>
                  <p className="text-sm text-muted-foreground">purple</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-barney rounded-lg border"></div>
                  <p className="text-sm text-muted-foreground">barney</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>ShadCN semantic colors with Lu.ma tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Heading 1 (foreground)</h1>
              <code className="text-sm bg-muted px-2 py-1 rounded">text-4xl font-bold</code>
            </div>
            
            <div>
              <h2 className="text-3xl font-semibold mb-2">Heading 2 (foreground)</h2>
              <code className="text-sm bg-muted px-2 py-1 rounded">text-3xl font-semibold</code>
            </div>
            
            <div>
              <h3 className="text-xl font-medium text-muted-foreground mb-2">Heading 3 (muted-foreground)</h3>
              <code className="text-sm bg-muted px-2 py-1 rounded">text-xl font-medium text-muted-foreground</code>
            </div>
            
            <div>
              <p className="text-base text-muted-foreground mb-2">Body text with muted foreground</p>
              <code className="text-sm bg-muted px-2 py-1 rounded">text-base text-muted-foreground</code>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Small muted text</p>
              <code className="text-sm bg-muted px-2 py-1 rounded">text-sm text-muted-foreground</code>
            </div>
            
            <div>
              <p className="text-primary mb-2">Primary colored text (cranberry)</p>
              <code className="text-sm bg-muted px-2 py-1 rounded">text-primary</code>
            </div>
            
            <div>
              <p className="text-destructive mb-2">Destructive text (red)</p>
              <code className="text-sm bg-muted px-2 py-1 rounded">text-destructive</code>
            </div>
          </CardContent>
        </Card>

        {/* Button Variations */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>ShadCN variants with Lu.ma colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Primary uses Lu.ma cranberry-50 */}
              <Button variant="default">
                Primary Button
              </Button>
              
              {/* Secondary uses Lu.ma gray backgrounds */}
              <Button variant="secondary">
                Secondary Button
              </Button>
              
              {/* Outline uses Lu.ma borders */}
              <Button variant="outline">
                Outline Button
              </Button>
              
              {/* Ghost with Lu.ma hover states */}
              <Button variant="ghost">
                Ghost Button
              </Button>
              
              {/* Destructive uses Lu.ma red-50 */}
              <Button variant="destructive">
                Destructive Button
              </Button>
              
              {/* Different sizes */}
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>ShadCN badge variants + custom Lu.ma colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {/* Default ShadCN badges use our semantic mappings */}
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
              <Badge variant="destructive">Destructive Badge</Badge>
              
              {/* Custom Lu.ma style with direct color tokens */}
              <Badge className="bg-cranberry-translucent text-cranberry border-cranberry-30">
                Event
              </Badge>
              
              <Badge className="bg-blue-translucent text-blue border-blue-30">
                Workshop
              </Badge>
              
              <Badge className="bg-green-translucent text-green border-green-30">
                Confirmed
              </Badge>
              
              <Badge className="bg-orange-translucent text-orange border-orange-30">
                Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Event Card Example */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Badge className="bg-cranberry-translucent text-cranberry border-cranberry-30">
                  Conference
                </Badge>
                <CardTitle className="text-xl">
                  Design Systems Meetup
                </CardTitle>
                <CardDescription>
                  Join us for an evening of design system discussions and networking
                </CardDescription>
              </div>
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  DM
                </AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Dec 15, 2024 · 6:00 PM PST</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>42 attending</span>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              {/* Primary button uses Lu.ma cranberry */}
              <Button className="flex-1">
                RSVP Now
              </Button>
              {/* Outline button uses Lu.ma borders */}
              <Button variant="outline">
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>ShadCN forms with Lu.ma styling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="event-name">
                Event Name
              </Label>
              <Input 
                id="event-name"
                placeholder="Enter event name..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="public-event" />
              <Label htmlFor="public-event">
                Make this event public
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Background Variations */}
        <Card>
          <CardHeader>
            <CardTitle>Background System</CardTitle>
            <CardDescription>ShadCN background tokens using Lu.ma colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-background border rounded-lg">
                <h4 className="font-medium mb-2">Background</h4>
                <p className="text-sm text-muted-foreground">bg-background</p>
              </div>
              
              <div className="p-6 bg-card border rounded-lg">
                <h4 className="font-medium mb-2">Card Background</h4>
                <p className="text-sm text-muted-foreground">bg-card</p>
              </div>
              
              <div className="p-6 bg-secondary border rounded-lg">
                <h4 className="font-medium mb-2">Secondary Background</h4>
                <p className="text-sm text-muted-foreground">bg-secondary</p>
              </div>
              
              <div className="p-6 bg-muted border rounded-lg">
                <h4 className="font-medium mb-2">Muted Background</h4>
                <p className="text-sm text-muted-foreground">bg-muted</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
