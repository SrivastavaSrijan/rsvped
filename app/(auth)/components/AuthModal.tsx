'use client'
import { AlertCircle, Loader2, LogInIcon, Mail } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Background, Form } from '@/components/shared'
import { Alert, AlertDescription, AlertTitle, InputWithError } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useActionStateWithError } from '@/lib/hooks'
import {
  AuthActionErrorCodeMap,
  AuthActionResponse,
  AuthFormData,
  authAction,
  signInWithGoogle,
} from '@/server/actions'
import { AuthErrorCodes } from '@/server/actions/types'
import { copy } from '../copy'

const initalState: AuthActionResponse = {
  success: false,
  fieldErrors: {},
}

interface AuthModalProps {
  mode: 'login' | 'register'
  prefill?: Partial<AuthFormData>
}

export const AuthModal = ({ mode, prefill }: AuthModalProps) => {
  const {
    state,
    formAction,
    isPending: isFormPending,
    errorComponent: loginError,
  } = useActionStateWithError({
    action: authAction,
    initialState: initalState,
    errorCodeMap: AuthActionErrorCodeMap,
    displayMode: 'inline',
  })
  const searchParams = useSearchParams()

  const queryError = searchParams.get('error')

  const QueryError = () => {
    if (!queryError) return null
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Something went wrong!</AlertTitle>
        {queryError in AuthActionErrorCodeMap && (
          <AlertDescription>
            {AuthActionErrorCodeMap[queryError as AuthErrorCodes]}
          </AlertDescription>
        )}
      </Alert>
    )
  }

  return (
    <Dialog open>
      <DialogContent
        overlay={<Background />}
        showCloseButton={false}
        className="h-auto max-w-screen bg-white/5 backdrop-blur-2xl lg:min-h-96 lg:max-w-80!"
      >
        <DialogHeader className="text-left">
          <div className="mb-3 flex aspect-square h-10 w-10 items-center justify-center rounded-full bg-white/50 p-2">
            <LogInIcon />
          </div>
          <DialogTitle>{copy.welcome}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
          {loginError || <QueryError />}
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Form action={formAction} className="flex flex-col gap-3 lg:gap-3">
            <input type="hidden" name="next" value={searchParams.get('next') || ''} />
            {mode === 'register' && (
              <InputWithError
                error={state.fieldErrors?.name}
                name="name"
                type="text"
                placeholder={copy.placeholders.name}
                required
              />
            )}
            <InputWithError
              error={state.fieldErrors?.email}
              name="email"
              type="email"
              placeholder={copy.placeholders.email}
              defaultValue={prefill?.email}
              required
            />
            <InputWithError
              error={state.fieldErrors?.password}
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={copy.placeholders.password}
              defaultValue={prefill?.password}
              required
            />

            <Button
              type="submit"
              disabled={isFormPending}
              className="flex items-center justify-center gap-1.5"
            >
              {isFormPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Mail className="size-3" />
              )}
              {mode === 'login' ? copy.buttonText.signIn : copy.buttonText.register}
            </Button>
          </Form>
          <hr />

          <Button
            type="button"
            className="flex w-full items-center justify-center gap-1.5"
            onClick={() => signInWithGoogle(searchParams.get('next') || null)}
          >
            <Image src="/google.svg" alt="Google Icon" width={12} height={12} />
            {copy.buttonText.google}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
