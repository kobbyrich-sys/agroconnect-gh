import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const authSupabase = await createClient();
  const { data: { user }, error: authError } = await authSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: tickets, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, tickets: tickets || [] });
}

export async function POST(request: Request) {
  const authSupabase = await createClient();
  const { data: { user }, error: authError } = await authSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { subject, description, category, order_id, priority } = await request.json();
  if (!subject || !description || !category) {
    return NextResponse.json({ success: false, error: 'Subject, description, and category required' }, { status: 400 });
  }

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user.id, subject, description, category,
      order_id: order_id || null, priority: priority || 'medium',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, ticket }, { status: 201 });
}
