import { createBrowserClient } from './client';
import type { AuthResponse, LoginInput, RegisterInput } from './types';

export async function signUp(input: RegisterInput): Promise<AuthResponse> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.full_name,
        phone: input.phone,
        role: input.role || 'buyer',
      },
    },
  });

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    message: 'Account created successfully. Please check your email to verify.',
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email!,
          full_name: input.full_name,
          role: input.role || 'buyer',
          status: 'active',
          is_email_verified: false,
          is_phone_verified: false,
          created_at: data.user.created_at,
        }
      : undefined,
    session: data.session
      ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at!,
        }
      : undefined,
  };
}

export async function signIn(input: LoginInput): Promise<AuthResponse> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) return { success: false, error: error.message };

  const profile = await getProfile(data.user.id);
  if (!profile.success) {
    return {
      success: true,
      message: 'Signed in successfully',
      user: {
        id: data.user.id,
        email: data.user.email!,
        role: 'buyer',
        status: 'active',
        is_email_verified: data.user.email_confirmed_at != null,
        is_phone_verified: false,
        created_at: data.user.created_at,
      },
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at!,
          }
        : undefined,
    };
  }

  return {
    success: true,
    user: profile.user,
    session: data.session
      ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at!,
        }
      : undefined,
  };
}

export async function signOut(): Promise<AuthResponse> {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };

  return { success: true, message: 'Signed out successfully' };
}

export async function getProfile(
  userId?: string,
): Promise<{ success: boolean; user?: AuthResponse['user']; error?: string }> {
  const supabase = createBrowserClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const id = userId || authUser?.id;
  if (!id) return { success: false, error: 'Not authenticated' };

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    user: {
      id: profile.id,
      email: profile.email,
      phone: profile.phone,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      role: profile.role,
      status: profile.status,
      is_email_verified: profile.is_email_verified,
      is_phone_verified: profile.is_phone_verified,
      created_at: profile.created_at,
    },
  };
}

export async function resetPassword(email: string): Promise<AuthResponse> {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/update-password`,
  });

  if (error) return { success: false, error: error.message };
  return { success: true, message: 'Password reset link sent to your email' };
}

export async function updatePassword(password: string): Promise<AuthResponse> {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { success: false, error: error.message };
  return { success: true, message: 'Password updated successfully' };
}

export async function sendOTP(phone: string): Promise<AuthResponse> {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) return { success: false, error: error.message };
  return { success: true, message: 'OTP sent to your phone' };
}

export async function verifyOTP(phone: string, token: string): Promise<AuthResponse> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });

  if (error) return { success: false, error: error.message };
  return { success: true, session: data.session ? { access_token: data.session.access_token, refresh_token: data.session.refresh_token, expires_at: data.session.expires_at! } : undefined };
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = createBrowserClient();

  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signInWithApple(): Promise<void> {
  const supabase = createBrowserClient();

  await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}
