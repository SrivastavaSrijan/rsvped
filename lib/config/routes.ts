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
			get Home() {
				return `${this.Root}/home`
			},
			ViewBySlug(slug: string) {
				return `${this.Root}/${slug}`
			},
			ViewBySlugWithRegister(slug: string) {
				return `${this.ViewBySlug(slug)}?register=true`
			},
			ManageBySlug(slug: string) {
				return `${this.Root}/${slug}/manage`
			},
			EditBySlug(slug: string) {
				return `${this.Root}/${slug}/edit`
			},
		},
	},
} as const

export const getAvatarURL = (name: string) => {
	return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}&flip=true`
}

export type Route = (typeof Routes)[keyof typeof Routes]
