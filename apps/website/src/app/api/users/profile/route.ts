import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET() {
  
  const supabase = createAdminClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, profile });
}

export async function PUT(request: Request) {
  
  const supabase = createAdminClient();

  const body = await request.json();
  const allowedFields = ['full_name', 'phone', 'avatar_url', 'preferred_language'];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  // Persist preferences from the settings page into metadata
  if (body.preferences) {
    const prefs = body.preferences;
    const { data: current } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
      .single();

    updates.metadata = {
      ...(current?.metadata as Record<string, unknown> || {}),
      preferences: {
        email_notifications: prefs.email_notifications ?? true,
        sms_notifications: prefs.sms_notifications ?? true,
        marketing_emails: prefs.marketing_emails ?? false,
        language: prefs.language || 'English',
        currency: prefs.currency || 'GHS',
      },
    };

    if (prefs.language) {
      updates.preferred_language = prefs.language;
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, profile: data });
}
