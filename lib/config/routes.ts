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
		EditProfile: '/profile/edit',
	},
	Static: {
		Terms: '/terms-of-service',
		Privacy: '/privacy-policy',
	},
	Main: {
		Communities: {
			Root: '/communities',
			get Home() {
				return `${this.Root}/home`
			},
			get Managed() {
				return `${this.Home}?tab=managed`
			},
			get Member() {
				return `${this.Home}?tab=member`
			},
			get Discover() {
				return `${this.Root}/discover`
			},
			ViewBySlug(slug: string) {
				return `${this.Root}/${slug}/view`
			},

			SubscribeTo(slug: string) {
				return `${this.ViewBySlug(slug)}/subscribe`
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
				return `${this.Discover}/select-location`
			},
			get Home() {
				return `${this.Root}/home`
			},
			ViewBySlug(slug: string) {
				return `${this.Root}/${slug}/view`
			},
			ViewBySlugRegister(slug: string) {
				return `${this.ViewBySlug(slug)}/register`
			},
			ManageBySlug(slug: string) {
				return `${this.Root}/${slug}/manage`
			},
			EditBySlug(slug: string) {
				return `${this.Root}/${slug}/edit`
			},
		},
		Stir: {
			Root: '/stir',
			Search(query: string) {
				const q = encodeURIComponent(query)
				return `${this.Root}?q=${q}`
			},
		},
		Users: {
			Root: '/u',
			ViewByUsername(username: string) {
				return `${this.Root}/${username}`
			},
		},
		Feed: '/feed',
	},
}

export const RouteDefs = {
	Protected: [
		Routes.Main.Events.Create,
		Routes.Main.Events.EditBySlug('[slug]'),
		Routes.Main.Events.ManageBySlug('[slug]'),
		Routes.Auth.Profile,
		Routes.Auth.EditProfile,
		Routes.Main.Feed as string,
	],
	Public: [
		Routes.Main.Events.Root,
		Routes.Main.Events.Home,
		Routes.Main.Events.Discover,
		Routes.Main.Events.ViewBySlug('[slug]'),
		Routes.Main.Events.ViewBySlugRegister('[slug]'),
		Routes.Main.Communities.Home,
		Routes.Main.Communities.ViewBySlug('[slug]'),
		Routes.Main.Communities.SubscribeTo('[slug]'),
		Routes.Main.Stir.Root,
		Routes.Main.Users.ViewByUsername('[username]'),
	],
}

export const getAvatarURL = (name: string) => {
	return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}&flip=true`
}

export type Route = (typeof Routes)[keyof typeof Routes]
