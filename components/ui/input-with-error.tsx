import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface InputWithErrorProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | string[]
  ref?: React.Ref<HTMLInputElement>
}

function InputWithError({ className, type, error, ref, ...props }: InputWithErrorProps) {
  const errorMessage = Array.isArray(error) ? error[0] : error
  const hasError = !!errorMessage

  return (
    <div className="space-y-1">
      <Input
        type={type}
        className={cn(hasError && 'border-red-500 focus-visible:ring-red-500', className)}
        ref={ref}
        {...props}
      />
      {hasError && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  )
}

export { InputWithError }
