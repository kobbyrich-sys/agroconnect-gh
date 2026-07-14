export { createBrowserClient } from './client';
export { createServerClient, createAdminClient } from './server';
export { createSessionJWT, verifySessionJWT } from './jwt';
export { setSessionCookies, clearSessionCookies, getSessionToken } from './session';
export { registerUser, verifyPassword, updatePassword, getUserByEmail, getProfileById, setEmailVerified } from './db';
export type { AuthResponse, SessionData, UserProfile, RegisterInput, LoginInput } from './types';
