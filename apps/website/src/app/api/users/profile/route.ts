import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@agroconnect/shared';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, profile });
}

export async function PUT(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
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
      .eq('id', user.id)
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
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, profile: data });
}
