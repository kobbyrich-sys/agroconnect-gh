import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface NotificationPayload {
  type: string
  user_id: string
  title: string
  body: string
  reference_id?: string
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) return new Response('Unauthorized', { status: 401 })
  
  const { type, user_id, title, body, reference_id }: NotificationPayload = await req.json()
  
  if (!RESEND_API_KEY) {
    console.log('Email sending disabled - no RESEND_API_KEY configured')
    return new Response(JSON.stringify({ success: true, note: 'No email API key configured' }), { headers: { 'Content-Type': 'application/json' } })
  }
  
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
  
  const { data: profile } = await supabase.from('profiles').select('email, full_name, notify_new_order, notify_payout').eq('id', user_id).single()
  if (!profile?.email) return new Response(JSON.stringify({ error: 'No email found' }), { status: 404 })
  
  const shouldNotify = type.includes('order') ? profile.notify_new_order !== false : type.includes('payout') || type.includes('withdrawal') ? profile.notify_payout !== false : true
  if (!shouldNotify) return new Response(JSON.stringify({ skipped: true }), { status: 200 })
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'AgroConnect GH <notifications@agroconnectgh.com>',
      to: profile.email,
      subject: title,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><h2 style="color:#1a6b3c">${title}</h2><p>${body}</p><p style="color:#666;font-size:12px">AgroConnect GH - Ghana's Agricultural Marketplace</p></div>`,
    }),
  })
  
  const data = await res.json()
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
})
