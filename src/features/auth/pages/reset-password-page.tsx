import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Card, CardHeader, CardTitle } from '@/components/ui'
import { supabase } from '@/lib/supabase'

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ResetForm = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetForm) => {
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password: data.password })
    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Password updated</CardTitle>
            <p className="mt-1 text-sm text-earth-600">
              Your password has been reset successfully. Redirecting to sign in...
            </p>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Set new password</CardTitle>
          <p className="mt-1 text-sm text-earth-600">
            Enter your new password below
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          <Input
            label="New Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" loading={isSubmitting} className="w-full">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  )
}
