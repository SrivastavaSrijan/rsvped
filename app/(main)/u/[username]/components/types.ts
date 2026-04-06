import type { RouterOutput } from '@/server/api'

export type PublicProfileUser = NonNullable<
	RouterOutput['user']['profile']['byUsername']
>
