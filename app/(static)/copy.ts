export const copy = {
  hero: {
    headline1: 'Delightful events',
    headline2: 'start here',
    description: 'Set up an event, invite your friends, and manage RSVPs effortlessly.',
    cta: 'Create your first event',
    imagePlaceholder: 'Event illustration coming soon',
  },
  nav: {
    logo: "RSVP'd",
    exploreEvents: 'Explore Events',
    signIn: 'Sign In',
  },
  footer: {
    logo: "RSVP'd",
    whatsNew: "What's New",
    discover: 'Discover',
    pricing: 'Pricing',
  },
} as const

export type CopyKey = keyof typeof copy
