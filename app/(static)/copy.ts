export const copy = {
	hero: {
		headline1: 'Delightful events',
		headline2: 'start here',
		description:
			'Set up an event, invite your friends, and manage RSVPs effortlessly.',
		cta: 'Create your first event',
		ctaExplore: 'Explore Events',
		ctaDemo: 'Try the Demo',
		imagePlaceholder: 'Event illustration coming soon',
	},
	featured: {
		events: {
			title: 'Upcoming Events',
			description: "See what's happening soon",
			cta: 'Discover more events',
		},
		communities: {
			title: 'Popular Communities',
			description: 'Join groups that match your interests',
			cta: 'Browse all communities',
		},
	},
	nav: {
		logo: "RSVP'd",
		exploreEvents: 'Explore Events',
		signIn: 'Sign In',
	},
	footer: {
		logo: "RSVP'd",
		discover: 'Discover',
		terms: 'Terms',
		privacy: 'Privacy',
	},
}

export type CopyKey = keyof typeof copy
