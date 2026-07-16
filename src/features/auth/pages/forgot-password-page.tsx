import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Button, Input, Card, CardHeader, CardTitle } from '@/components/ui'
import { supabase } from '@/lib/supabase'

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotForm) => {
    setError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Check your email</CardTitle>
            <p className="mt-1 text-sm text-earth-600">
              If an account exists, we&apos;ve sent a password reset link.
            </p>
          </CardHeader>
          <div className="text-center">
            <Link to="/login" className="text-sm font-medium text-agro-600 hover:text-agro-700">
              Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Reset your password</CardTitle>
          <p className="mt-1 text-sm text-earth-600">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" loading={isSubmitting} className="w-full">
            Send Reset Link
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-earth-600">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-agro-600 hover:text-agro-700">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}
