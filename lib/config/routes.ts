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
		Communities: {
			Root: '/communities',
			get Discover() {
				return `${this.Root}/discover`
			},
			ViewBySlug(slug: string) {
				return `${this.Root}/${slug}/view`
			},

			SubscribeTo(slug: string) {
				return `${this.ViewBySlug(slug)}?action=subscribe`
			},
		},
		Categories: {
			Root: '/categories',
			get Discover() {
				return `${this.Root}/discover`
			},
			ViewBySlug(slug: string) {
				return `${this.Root}/${slug}/view`
			},
		},
		Locations: {
			Root: '/locations',
			get Discover() {
				return `${this.Root}/discover`
			},
			ViewBySlug(slug: string) {
				return `${this.Root}/${slug}/view`
			},
		},
		Events: {
			Root: '/events',
			get Create() {
				return `${this.Root}/create`
			},
			get Discover() {
				return `${this.Root}/discover`
			},
			get DiscoverLocationSelect() {
				return `${this.Discover}?action=select-location`
			},
			get Home() {
				return `${this.Root}/home`
			},
			ViewBySlug(slug: string) {
				return `${this.Root}/${slug}/view`
			},
			ViewBySlugRegister(slug: string) {
				return `${this.ViewBySlug(slug)}?action=register`
			},
			ManageBySlug(slug: string) {
				return `${this.Root}/${slug}/manage`
			},
			EditBySlug(slug: string) {
				return `${this.Root}/${slug}/edit`
			},
		},
	},
}

export const RouteDefs = {
	Protected: [
		Routes.Main.Events.Root,
		Routes.Main.Events.Create,
		Routes.Main.Events.Home,
		Routes.Main.Events.EditBySlug('[slug]'),
	],
	Public: [
		Routes.Main.Events.Discover,
		Routes.Main.Events.ViewBySlug('[slug]'),

		Routes.Main.Events.ViewBySlugRegister('[slug]'),
		Routes.Main.Communities.Discover,
		Routes.Main.Communities.SubscribeTo('[slug]'),
	],
}

export const getAvatarURL = (name: string) => {
	return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}&flip=true`
}

export type Route = (typeof Routes)[keyof typeof Routes]
