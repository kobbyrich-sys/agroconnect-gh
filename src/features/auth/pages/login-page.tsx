import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button, Input, Card, CardHeader, CardTitle } from '@/components/ui'
import { useAuth } from '../hooks/use-auth'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    const { error: err } = await signIn(data.email, data.password)
    if (err) {
      setError(err.message)
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <p className="mt-1 text-sm text-earth-600">Sign in to your account</p>
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
          <div>
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="mt-1 text-right">
              <Link to="/forgot-password" className="text-xs text-agro-600 hover:text-agro-700">
                Forgot password?
              </Link>
            </div>
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full">
            Sign In
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-earth-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-agro-600 hover:text-agro-700">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  )
}
