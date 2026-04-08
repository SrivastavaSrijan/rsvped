import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { MessageCircle } from 'lucide-react'
import { AvatarWithFallback } from '@/components/ui'
import type { RouterOutput } from '@/server/api/root'

dayjs.extend(relativeTime)

type MessageItem = RouterOutput['event']['get']['messages'][number]
type ReplyItem = MessageItem['replies'][number]

interface ManageMessagesProps {
	messages: MessageItem[]
}

const MessageBubble = ({
	user,
	content,
	createdAt,
	isReply,
}: {
	user: ReplyItem['user']
	content: string
	createdAt: Date
	isReply?: boolean
}) => (
	<div className={`flex gap-3 ${isReply ? 'ml-11' : ''}`}>
		<AvatarWithFallback
			className={isReply ? 'size-6' : 'size-8'}
			src={user?.image}
			name={user?.name ?? 'Unknown'}
		/>
		<div className="flex flex-1 flex-col gap-1">
			<div className="flex items-center gap-2">
				<p className={`font-medium ${isReply ? 'text-xs' : 'text-sm'}`}>
					{user?.name ?? 'Unknown'}
				</p>
				<span className="text-muted-foreground text-xs">
					{dayjs(createdAt).fromNow()}
				</span>
			</div>
			<p className={`text-muted-foreground ${isReply ? 'text-xs' : 'text-sm'}`}>
				{content}
			</p>
		</div>
	</div>
)

export const ManageMessages = ({ messages }: ManageMessagesProps) => {
	if (messages.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-faint-white p-12 text-center">
				<MessageCircle className="size-8 text-muted-foreground" />
				<div className="flex flex-col gap-1">
					<p className="font-medium">No messages yet</p>
					<p className="text-muted-foreground text-sm">
						Messages will appear here when discussion starts
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-3">
			{messages.map((message) => (
				<div
					key={message.id}
					className="flex flex-col gap-3 rounded-xl bg-faint-white p-3 lg:p-4"
				>
					<MessageBubble
						user={message.user}
						content={message.content}
						createdAt={message.createdAt}
					/>
					{message.replies.length > 0 ? (
						<div className="flex flex-col gap-2 border-l-2 border-border pl-2">
							{message.replies.map((reply) => (
								<MessageBubble
									key={reply.id}
									user={reply.user}
									content={reply.content}
									createdAt={reply.createdAt}
									isReply
								/>
							))}
						</div>
					) : null}
				</div>
			))}
		</div>
	)
}
