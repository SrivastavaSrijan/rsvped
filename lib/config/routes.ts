export const Routes = {
  Home: '/',
  HoldOn: '/hold-on',
  Dashboard: '/overview',
  Explore: '/explore',
  Pricing: '/pricing',
  Discover: '/discover',
  WhatsNew: '/whats-new',
  SignIn: '/login',
  SignUp: '/register',
  Profile: '/profile',
  CreateEvent: '/events/create',
} as const

const randomPasterColor = () => {
  const letters = '0123456789ABCDEF'
  let color = ''
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}
export const getAvatarURL = (name: string) => {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${name}&flip=true&backgroundColor=${randomPasterColor()}`
}

export type Route = (typeof Routes)[keyof typeof Routes]
