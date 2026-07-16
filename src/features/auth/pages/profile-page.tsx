import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/use-auth'
import { Button, Input, Card, CardHeader, CardTitle } from '@/components/ui'
import { supabase } from '@/lib/supabase'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { fullName: profile?.full_name ?? '', phone: profile?.phone ?? '' },
  })

  const onSubmit = async (data: ProfileForm) => {
    if (!profile) return
    setError(null)
    setSaved(false)
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: data.fullName, phone: data.phone || null } as never)
      .eq('id', profile.id)
    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      refreshProfile()
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-earth-900 mb-8">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          {saved && (
            <div className="rounded-lg bg-agro-50 p-3 text-sm text-agro-700" role="status">
              Profile updated successfully.
            </div>
          )}
          <Input
            label="Full Name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Phone"
            type="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <div>
            <label className="block text-sm font-medium text-earth-700">Email</label>
            <p className="mt-1 text-sm text-earth-600">{profile?.id ? 'Email cannot be changed' : ''}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-earth-700">Role</label>
            <p className="mt-1 text-sm text-earth-600 capitalize">{profile?.role ?? 'Buyer'}</p>
          </div>
          <Button type="submit" loading={isSubmitting}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  )
}
