export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: UserProfile;
  session?: SessionData;
}

export interface SessionData {
  access_token: string;
  expires_at: number;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  roles: string[];
  active_role: string;
  status: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
