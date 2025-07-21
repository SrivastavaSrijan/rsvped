import { AlertCircle } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ServerActionResponse } from '@/server/actions/types'

interface UseServerActionErrorHandlerParams<T extends ServerActionResponse> {
  state: T
  isPending: boolean
  errorCodeMap: T extends { error: infer E extends string }
    ? Record<E, string>
    : Record<string, string>
  displayMode?: 'toast' | 'inline'
}
export const useServerActionErrorHandler = <T extends ServerActionResponse>({
  state,
  isPending,
  errorCodeMap,
  displayMode = 'toast',
}: UseServerActionErrorHandlerParams<T>): React.ReactNode | null => {
  const toastId = useRef<number | string | null>(null)

  if (!state?.error || isPending) {
    return null
  }

  const errorMessage = errorCodeMap[state.error] || 'An unexpected error occurred.'

  if (displayMode === 'inline') {
    return (
      <Alert className="border-0 bg-white/10">
        <AlertCircle className="size-4" />
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    )
  }

  // Default toast behavior
  if (!toastId.current) {
    toastId.current = toast.error(errorMessage, {
      duration: 4000,
      onAutoClose: () => {
        toastId.current = null
      },
      onDismiss: () => {
        toastId.current = null
      },
      action: {
        label: 'Dismiss',
        onClick: () => {
          toast.dismiss(toastId.current as number | string)
          toastId.current = null
        },
      },
    })
  }

  return null
}
