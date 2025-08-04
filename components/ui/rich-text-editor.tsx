'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface RichTextEditorProps {
	name: string
	defaultValue?: string
	className?: string
}

export function RichTextEditor({
	name,
	defaultValue = '',
	className,
}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [StarterKit],
		content: defaultValue,
	})

	// Ensure editor cleans up on unmount
	useEffect(() => {
		return () => editor?.destroy()
	}, [editor])

	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<div className="flex items-center gap-1 rounded-md border bg-white/10 p-1">
				<Button
					type="button"
					size="sm"
					variant="ghost"
					onClick={() => editor?.chain().focus().toggleBold().run()}
					className={cn(editor?.isActive('bold') && 'bg-white/20')}
				>
					<Bold className="size-4" />
				</Button>
				<Button
					type="button"
					size="sm"
					variant="ghost"
					onClick={() => editor?.chain().focus().toggleItalic().run()}
					className={cn(editor?.isActive('italic') && 'bg-white/20')}
				>
					<Italic className="size-4" />
				</Button>
			</div>
			<EditorContent
				editor={editor}
				className="min-h-[150px] rounded-md border bg-transparent p-2"
			/>
			<input type="hidden" name={name} value={editor?.getHTML() ?? ''} />
		</div>
	)
}
