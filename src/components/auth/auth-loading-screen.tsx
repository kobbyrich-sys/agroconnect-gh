import { Logo } from '@/components/ui'

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Logo className="h-10 w-auto" compact showTagline={false} />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-agro-200 border-t-agro-600" />
        <p className="text-sm text-earth-500">Loading your account...</p>
      </div>
    </div>
  )
}
