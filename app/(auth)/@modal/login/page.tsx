import { Suspense } from 'react'
import { AuthModal } from '../../components'

export default function LoginModal() {
  return (
    <Suspense fallback={null}>
      <AuthModal mode="login" />
    </Suspense>
  )
}
