import { VariantProps } from 'class-variance-authority'
import { Input, inputVariants } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface InputWithErrorProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | string[]
  ref?: React.Ref<HTMLInputElement>
  variant?: VariantProps<typeof inputVariants>['variant']
}

function InputWithError({ className, type, error, ref, variant, ...props }: InputWithErrorProps) {
  const errorMessage = Array.isArray(error) ? error[0] : error
  const hasError = !!errorMessage

  return (
    <div className="space-y-1">
      <Input
        type={type}
        className={cn(hasError && 'border-red-500 focus-visible:ring-red-500', className)}
        ref={ref}
        variant={variant}
        {...props}
      />
      {hasError && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  )
}

export { InputWithError }
