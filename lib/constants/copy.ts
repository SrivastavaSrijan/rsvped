export const Copy = {
  Hero: {
    headline: "Delightful events start here",
    description: "Create memorable experiences with our intuitive event management platform. From intimate gatherings to large celebrations, we make hosting seamless and delightful for everyone involved.",
    cta: "Create your first event",
    imagePlaceholder: "Event illustration coming soon",
  },
  Navbar: {
    logo: "RSVP'd",
    exploreEvents: "Explore Events",
    signIn: "Sign In",
  },
  Footer: {
    logo: "RSVP'd",
    whatsNew: "What's New",
    discover: "Discover",
    pricing: "Pricing",
  },
} as const

export type CopyKey = keyof typeof Copy
