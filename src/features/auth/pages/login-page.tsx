import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Button, Input, Card, CardHeader, CardTitle } from '@/components/ui'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (_data: LoginForm) => {
    // Phase 2: implement authentication
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <p className="mt-1 text-sm text-earth-600">Sign in to your account</p>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
