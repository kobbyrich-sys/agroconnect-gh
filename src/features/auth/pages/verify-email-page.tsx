import { useEffect, useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setErrorMsg('No verification token found in the URL.')
      return
    }

    supabase.auth.verifyOtp({ token_hash: token, type: 'signup' }).then(({ error }) => {
      if (error) {
        setStatus('error')
        setErrorMsg(error.message)
      } else {
        setStatus('success')
      }
    })
  }, [searchParams])

  if (status === 'success') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {status === 'verifying' && (
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-agro-200 border-t-agro-600" />
          <p className="text-earth-600">Verifying your email...</p>
        </div>
      )}
      {status === 'error' && (
        <div>
          <h2 className="text-lg font-semibold text-red-700">Verification failed</h2>
          <p className="mt-2 text-sm text-earth-600">{errorMsg}</p>
          <a href="/login" className="mt-4 inline-block text-sm font-medium text-agro-600 hover:text-agro-700">
            Go to sign in
          </a>
        </div>
      )}
    </div>
  )
}
