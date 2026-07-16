import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Button, Input, Card, CardHeader, CardTitle } from '@/components/ui'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (_data: RegisterForm) => {
    // Phase 2: implement registration
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Create your account</CardTitle>
          <p className="mt-1 text-sm text-earth-600">Join Ghana&apos;s agricultural marketplace</p>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
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
            Create Account
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-earth-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-agro-600 hover:text-agro-700">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}
