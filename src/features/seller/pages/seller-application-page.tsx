import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Card, CardHeader, CardTitle } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'

const sellerSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.string().min(2, 'Business type is required'),
  businessAddress: z.string().min(5, 'Business address is required'),
  businessPhone: z.string().min(5, 'Business phone is required'),
  businessEmail: z.string().email('Enter a valid email'),
  taxId: z.string().optional(),
})

type SellerForm = z.infer<typeof sellerSchema>

export function SellerApplicationPage() {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SellerForm>({
    resolver: zodResolver(sellerSchema),
  })

  const onSubmit = async (data: SellerForm) => {
    if (!user) return
    setError(null)
    const { error: err } = await supabase.from('seller_applications').insert({
      user_id: user.id,
      business_name: data.businessName,
      business_type: data.businessType,
      business_address: data.businessAddress,
      business_phone: data.businessPhone,
      business_email: data.businessEmail,
      tax_id: data.taxId || null,
    } as never)
    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Application submitted</CardTitle>
            <p className="mt-1 text-sm text-earth-600">
              Your seller application has been submitted for review. We&apos;ll notify you once it&apos;s approved.
            </p>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-earth-900 mb-2">Become a Seller</h1>
      <p className="text-sm text-earth-600 mb-8">
        Submit your business details to start selling on AgroConnect GH
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          <Input
            label="Business Name"
            error={errors.businessName?.message}
            {...register('businessName')}
          />
          <Input
            label="Business Type"
            placeholder="e.g., Farm, Processing, Trading"
            error={errors.businessType?.message}
            {...register('businessType')}
          />
          <Input
            label="Business Address"
            error={errors.businessAddress?.message}
            {...register('businessAddress')}
          />
          <Input
            label="Business Phone"
            type="tel"
            error={errors.businessPhone?.message}
            {...register('businessPhone')}
          />
          <Input
            label="Business Email"
            type="email"
            error={errors.businessEmail?.message}
            {...register('businessEmail')}
          />
          <Input
            label="Tax ID (optional)"
            error={errors.taxId?.message}
            {...register('taxId')}
          />
          <Button type="submit" loading={isSubmitting} className="w-full">
            Submit Application
          </Button>
        </form>
      </Card>
    </div>
  )
}
