import { Hero } from './components'

export const dynamic = 'force-static'
export const revalidate = 3600

export default function Home() {
	return <Hero />
}
