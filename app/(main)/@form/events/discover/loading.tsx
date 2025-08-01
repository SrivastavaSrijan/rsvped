import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

export default function ModalLoading() {
	return (
		<Dialog open>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Skeleton className="h-6 w-48" />
					</DialogTitle>
					<DialogDescription>
						<Skeleton className="h-4 w-full" />
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-3">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
