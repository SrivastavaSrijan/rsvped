import { useActionState } from 'react'
import { ServerActionResponse } from '@/server/actions/types'
import { useServerActionErrorHandler } from './useServerActionErrorHandler'

type UseServerActionErrorHandlerParams<T extends ServerActionResponse> = Omit<
  Parameters<typeof useServerActionErrorHandler<T>>[0],
  'state' | 'isPending'
>

type UseActionStateParams<TState> = Parameters<typeof useActionState<TState, FormData>>

interface UseActionStateWithErrorParams<TState extends ServerActionResponse>
  extends UseServerActionErrorHandlerParams<TState> {
  action: UseActionStateParams<TState>[0]
  initialState: UseActionStateParams<TState>[1]
}

export const useActionStateWithError = <TState extends ServerActionResponse>({
  action,
  initialState,
  errorCodeMap,
  displayMode = 'inline',
}: UseActionStateWithErrorParams<TState>) => {
  const [state, formAction, isPending] = useActionState(action, initialState)

  const errorComponent = useServerActionErrorHandler({
    state,
    isPending,
    errorCodeMap,
    displayMode,
  })

  return { state, formAction, isPending, errorComponent }
}
