'use client'

import { type FormHTMLAttributes, type RefObject, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  preventReset?: boolean
  ref?: RefObject<HTMLFormElement>
}

function Form({ className, preventReset = true, ref, ...props }: FormProps) {
  const internalRef = useRef<HTMLFormElement>(null)
  const formRef = ref || internalRef

  // Prevent React 19's automatic form reset
  useEffect(() => {
    if (!preventReset) return

    function handleReset(e: Event) {
      e.preventDefault()
    }

    const form = formRef.current
    form?.addEventListener('reset', handleReset)

    return () => {
      form?.removeEventListener('reset', handleReset)
    }
  }, [preventReset, formRef])

  return <form ref={formRef} className={cn(className)} {...props} />
}

export { Form }
