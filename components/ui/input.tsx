import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const inputVariants = cva(
	'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-w-0 text-base transition-colors outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full',
	{
		variants: {
			variant: {
				filled:
					'h-9 rounded-md px-3 py-1 shadow-xs dark:bg-input/30 border-input border bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive file:h-7',
				outlined:
					'h-9 rounded-md px-3 py-1 border-2 border-border bg-transparent focus-visible:border-ring aria-invalid:border-destructive file:h-7',
				naked:
					'bg-transparent border-0 p-0 focus-visible:outline-none aria-invalid:text-destructive',
			},
		},
		defaultVariants: {
			variant: 'filled',
		},
	}
)

interface InputProps extends React.ComponentProps<'input'>, VariantProps<typeof inputVariants> {}

function Input({ className, type, variant, ...props }: InputProps) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(inputVariants({ variant }), className)}
			{...props}
		/>
	)
}

export { Input, inputVariants }
