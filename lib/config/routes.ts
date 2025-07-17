export const Routes = {
  Home: '/',
  Dashboard: '/overview',
  Explore: '/explore',
  Pricing: '/pricing',
  Discover: '/discover',
  WhatsNew: '/whats-new',
  SignIn: '/login',
  SignUp: '/register',
  CreateEvent: '/events/create',
} as const

export type Route = (typeof Routes)[keyof typeof Routes]
