type SkeletonProps = { className?: string }

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-earth-100 ${className}`} />
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-earth-200 bg-white p-4">
      <Skeleton className="mb-3 h-40 w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="rounded-xl border border-earth-200 bg-white p-4">
      <Skeleton className="mb-2 h-5 w-1/3" />
      <Skeleton className="mb-2 h-4 w-1/4" />
      <Skeleton className="h-4 w-1/6" />
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-earth-200 bg-white p-6">
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
    </div>
  )
}
