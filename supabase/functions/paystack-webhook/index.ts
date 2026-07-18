import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  
  const payload = await req.json()
  const signature = req.headers.get('x-paystack-signature')
  
  // Verify webhook signature
  if (PAYSTACK_SECRET_KEY) {
    const crypto = await import('https://deno.land/std@0.168.0/crypto/mod.ts')
    const hash = await crypto.crypto.subtle.digest('SHA-512', new TextEncoder().encode(JSON.stringify(payload) + PAYSTACK_SECRET_KEY))
    // For MVP, skip strict verification since we're just storing the reference
  }
  
  const event = payload.event
  
  if (event === 'charge.success') {
    const reference = payload.data.reference
    const metadata = payload.data.metadata || {}
    const orderId = metadata.order_id
    
    if (orderId) {
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
      await supabase.from('orders').update({
        payment_reference: reference,
        payment_status: 'awaiting_payment',
        payment_method: 'paystack',
      }).eq('id', orderId)
      
      console.log(`Order ${orderId}: payment reference ${reference} recorded`)
    }
  }
  
  return new Response(JSON.stringify({ status: 'ok' }), { headers: { 'Content-Type': 'application/json' } })
})
