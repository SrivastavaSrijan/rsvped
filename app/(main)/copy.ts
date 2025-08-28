export const copy = {
	nav: {
		logo: "RSVP'd",
		createEvent: 'Create Event',
		events: 'Events',
		communities: 'Communities',
		discover: 'Discover',
		signIn: 'Sign In',
		dashboard: 'Hey there',
		profile: 'Settings',
		signOut: 'Sign Out',
	},
	placeholders: {
		email: 'Email Address',
		password: 'Password',
		name: 'Name',
		ticket: 'Select Ticket',
		tier: 'Select Tier',
	},
	welcome: 'Welcome! To register for this event, please click below.',
	register: {
		description: 'Please enter your details to register.',
	},
	subscribe: {
		description: 'Choose a membership tier to join this community.',
	},
	home: {
		title: 'Events',
	},
	discover: {
		title: 'Discover Events',
		description:
			'Explore popular events near you, browse by category, or check out some of the great community calendars.',
		upcoming: 'Upcoming Events',
		viewAll: 'View All',
		changeLocation: 'Not here?',
		category: 'Browse by Category',
		communities: 'Featured Communities',
		location: 'Explore Local Events',
	},
	location: {
		view: {
			description(name: string, country: string, continent: string) {
				return `Explore events in ${name}, ${country}, ${continent}. Find your next adventure!`
			},
		},
	},
	community: {
		home: {
			title: 'Communities',
			member: 'Subscribed Communities',
			managed: 'My Communities',
			empty: "You haven't subscribed to any communities yet.",
			emptyManaged:
				"You haven't created any communities yet. Create one to get started!",
		},
	},
}
