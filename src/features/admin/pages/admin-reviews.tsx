import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, Button } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    ;(supabase.from('reviews') as any).select('*, profiles(full_name), products(name)').order('created_at', { ascending: false }).then((res: any) => {
      if (res.data) setReviews(res.data)
      setLoading(false)
    })
  }, [])

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return
    await (supabase.from('reviews') as any).delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Admin - Reviews" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Reviews</h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-earth-100" />)}</div>
      ) : reviews.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-earth-500">⭐ No reviews yet.</p></Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <Card key={r.id} className="flex items-start justify-between p-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-earth-900">{r.profiles?.full_name || 'Anonymous'}</span>
                  <span className="text-sm text-yellow-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p className="text-xs text-earth-500 mb-1">on {r.products?.name || 'Unknown product'}</p>
                {r.content && <p className="text-sm text-earth-600">{r.content}</p>}
              </div>
              <Button size="sm" variant="outline" onClick={() => deleteReview(r.id)} className="text-red-500 border-red-200 hover:bg-red-50">Delete</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
