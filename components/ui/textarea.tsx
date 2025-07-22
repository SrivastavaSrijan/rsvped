import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const textareaVariants = cva(
  'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-16 w-full field-sizing-content text-base transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      variant: {
        filled:
          'rounded-md border border-input bg-transparent px-3 py-2 shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
        outlined:
          'rounded-md border-2 border-border bg-transparent px-3 py-2 focus-visible:border-ring aria-invalid:border-destructive',
        naked:
          'bg-transparent border-0 p-0 focus-visible:outline-none aria-invalid:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'filled',
    },
  }
)

interface TextareaProps
  extends React.ComponentProps<'textarea'>,
    VariantProps<typeof textareaVariants> {}

function Textarea({ className, variant, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Textarea }
