import { useRef } from 'react'
import { toast } from 'sonner'
import { ServerActionResponse } from '@/server/actions/types'

interface UseServerActionErrorHandlerParams<T extends ServerActionResponse> {
  state: T
  isPending: boolean
  errorCodeMap: T extends { error: infer E extends string }
    ? Record<E, string>
    : Record<string, string>
}
export const useServerActionErrorHandler = <T extends ServerActionResponse>({
  state,
  isPending,
  errorCodeMap,
}: UseServerActionErrorHandlerParams<T>) => {
  const toastId = useRef<number | string | null>(null)
  if (state.error && !isPending && !toastId.current) {
    toastId.current = toast.error(errorCodeMap[state.error], {
      duration: 2000,
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
}
