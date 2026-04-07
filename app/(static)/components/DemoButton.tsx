'use client'
import { Loader2, Play } from 'lucide-react'
import { useTransition } from 'react'
import { Button } from '@/components/ui'
import { signInAsDemo } from '@/server/actions/auth'

export const DemoButton = ({ label }: { label: string }) => {
	const [isPending, startTransition] = useTransition()

	return (
		<Button
			size="lg"
			variant="outline"
			className="cursor-pointer gap-2 lg:text-lg"
			disabled={isPending}
			onClick={() => startTransition(() => signInAsDemo())}
		>
			{isPending ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<Play className="size-4" />
			)}
			{label}
		</Button>
	)
}
