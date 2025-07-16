export const Routes = {
  Home: '/',
  Explore: '/explore',
  Pricing: '/pricing',
  Discover: '/discover',
  WhatsNew: '/whats-new',
  SignIn: '/auth/signin',
  CreateEvent: '/events/create',
} as const

export type Route = (typeof Routes)[keyof typeof Routes]
