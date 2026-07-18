const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sakfrqjqpwyubyhushva.supabase.co'

export function getImageUrl(bucket: string, path: string | null | undefined): string | null {
  if (!path) return null
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}
