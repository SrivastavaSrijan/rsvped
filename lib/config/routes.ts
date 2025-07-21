export const Routes = {
  Home: '/',
  Utility: {
    HoldOn: '/hold-on',
    Components: '/components',
  },
  Auth: {
    SignIn: '/login',
    SignUp: '/register',
    Profile: '/profile',
  },
  Static: {
    About: '/about',
    Terms: '/terms',
    Privacy: '/privacy',
    Pricing: '/pricing',
    WhatsNew: '/whats-new',
  },
  Main: {
    Events: {
      Root: '/events',
      get Communities() {
        return `${this.Root}/communities`
      },
      get Create() {
        return `${this.Root}/create`
      },
      get Discover() {
        return `${this.Root}/discover`
      },
    },
  },
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
