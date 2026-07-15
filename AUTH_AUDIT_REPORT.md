# Authentication Audit Report - AgroConnect GH

## Date: 2026-07-15

---

## 1. Architecture Summary

The application uses **custom authentication** built on direct PostgreSQL queries via `pg` Pool, bypassing Supabase GoTrue entirely. There is also a **separate Supabase SSR client** that some API routes use, creating a dual-auth-system conflict.

### Auth Files
| File | Role |
|------|------|
| `packages/shared/src/supabase/db.ts` | DB functions: registerUser, verifyPassword, updatePassword, getUserByEmail, etc. |
| `packages/shared/src/supabase/jwt.ts` | JWT creation + verification (HS256, jose library) |
| `packages/shared/src/supabase/session.ts` | Cookie get/set/delete for `agroconnect_session` |
| `packages/shared/src/supabase/server.ts` | Supabase SSR server client |
| `packages/shared/src/supabase/client.ts` | Supabase browser client (singleton) |
| `apps/website/src/middleware.ts` | Edge middleware: route protection, session validation |
| `apps/website/src/lib/auth.tsx` | React context: AuthProvider with user state, refresh, signOut |
| `apps/website/src/components/layout/header.tsx` | Header with role-based navigation, RoleSwitcher |

---

## 2. CRITICAL - Dual Auth System Conflict

### Problem
The app has TWO completely separate authentication systems:

**System A (Custom Auth):**
- Entry: `POST /api/auth/login`, `POST /api/auth/register`
- Cookie: `agroconnect_session` (HttpOnly, custom JWT)
- Verification: `verifySessionJWT()` → jose library
- Used by: auth routes, middleware

**System B (Supabase GoTrue SSR):**
- Entry: `createServerClient()` → `supabase.auth.getUser()`
- Cookie: `sb-*` cookies (Supabase's own)
- Verification: Supabase's built-in JWT verification
- Used by: cart, orders, wallet, profile, products, sellers, etc.

### Impact
When a user logs in via System A (custom auth), System B routes **all return 401** because no Supabase session exists. The entire marketplace, cart, checkout, orders, wallet, and seller flows are **completely broken** after login.

### Files affected (all use System B after user authenticated via System A):
```
cart/route.ts
orders/route.ts + orders/[id]/route.ts + orders/[id]/status/route.ts
wallet/route.ts
users/profile/route.ts + users/addresses/route.ts + users/addresses/[id]/route.ts
sellers/status/route.ts + sellers/register/route.ts + sellers/verification/route.ts
products/route.ts (POST) + products/[id]/route.ts (PUT/DELETE)
categories/route.ts (POST)
reviews/route.ts + reviews/[id]/route.ts
payments/route.ts + payments/verify/route.ts
escrow/release/route.ts, escrow/refund/route.ts, escrow/hold/route.ts
disputes/route.ts, disputes/[id]/route.ts
notifications/route.ts
chats/route.ts + chats/[id]/messages/route.ts
wishlist/route.ts
coupons/route.ts (auth required)
withdrawal-accounts/route.ts
admin/escrow/route.ts
```

### Root Cause
Login was designed without creating a Supabase session alongside the custom session. The project started with Supabase SSR but migrated to custom auth without making all routes consistent.

### Fix
After custom auth (login/register), create a Supabase session using the service role key and set the Supabase auth cookies. This ensures both auth systems work in parallel.

---

## 3. Security Issues

### 3.1 Shared JWT Secret
**Severity: HIGH**
The same `SUPABASE_JWT_SECRET` is used for:
- Session JWTs (`createSessionJWT`)
- Password reset tokens (`forgot-password/route.ts`)
- Token verification (`verifySessionJWT`, reset-password)

If breached, an attacker can forge both session tokens and password reset links.

**Fix:** Use a separate secret for password reset tokens.

### 3.2 No CSRF Protection
**Severity: HIGH**
All POST/PUT/DELETE API routes accept requests without CSRF tokens. An attacker could trick an authenticated user into performing actions.

**Fix:** Add CSRF token generation + validation for state-changing requests.

### 3.3 Sensitive Data in JWT Payload
**Severity: MEDIUM**
JWT payload includes email, role, user_metadata, and app_metadata. While JWTs are signed, they are not encrypted. Any XSS vulnerability would expose user data.

**Fix:** Avoid storing sensitive data in JWT payload; only store sub, roles, and minimal claims.

### 3.4 Insecure Cookie in Development
**Severity: MEDIUM**
Session cookie has `secure: process.env.NODE_ENV === 'production'`, which means `Secure` flag is absent in dev. In production it's `Secure` but the cookie name `agroconnect_session` lacks the `__Host-` prefix (which would enforce path=/ and Secure).

**Fix:** Use `__Host-agroconnect_session` cookie name.

### 3.5 Missing Rate Limiting on Most Routes
**Severity: MEDIUM**
Only login and password reset have rate limiting. All other auth-required routes are unprotected against brute-force attacks.

**Fix:** Add global rate limiting middleware.

### 3.6 SQL Injection Surface
**Severity: MEDIUM**
`registerUser`, `verifyPassword`, etc. use parameterized queries (good). But the `updatePassword` function in the SQL migration should be verified.

### 3.7 No Brute-Force Protection on Change Password
**Severity: MEDIUM**
`change-password/route.ts` has no rate limiting. An attacker with a session token could brute-force the current password.

### 3.8 In-memory rate limiters
**Severity: LOW** (in production)
`isRateLimited` functions use in-memory Maps that reset on server restart and don't work across multiple instances. Not suitable for production.

---

## 4. Session Management Issues

### 4.1 No Refresh Token
**Severity: HIGH**
`REFRESH_COOKIE` is defined but never set or used. Sessions use a single JWT with a fixed expiry (1d or 30d). Once expired, the user must log in again. No silent refresh mechanism exists.

### 4.2 No Session Table
**Severity: MEDIUM**
Session invalidation uses `token_valid_since` on profiles, which invalidates ALL sessions for a user. Cannot selectively invalidate one device/session.

### 4.3 Cookie Not Deleted on Server on Logout
**Severity: MEDIUM**
Logout calls `invalidateSessions` (sets `token_valid_since = NOW()`) and deletes the cookie. But the cookie is deleted via `response.cookies.delete()` - if that response isn't sent (e.g., network error), the cookie persists client-side.

### 4.4 No Session Timeout for "Remember Me"
**Severity: LOW**
"Remember Me" sets JWT to 30d with no absolute maximum. If a user's device is compromised, the session is valid for 30 days.

---

## 5. Authorization Issues

### 5.1 No Role Verification in Most API Routes
After an API route verifies authentication via `supabase.auth.getUser()`, it does NOT verify the user's role (buyer/seller/admin). For example:
- `wallet/route.ts` POST - creates withdrawal requests without checking seller role
- `orders/route.ts` POST - places orders without checking buyer role
- `products/route.ts` POST - checks seller role via user_roles (fixed in our refactor)

### 5.2 Admin Routes Use Supabase Auth Not Custom Auth
The admin routes (`admin/escrow/route.ts`) use `createServerClient()` → `supabase.auth.getUser()`. If an admin logged in via custom auth, they can't access admin routes.

---

## 6. Registration Issues

### 6.1 Direct auth.users Insert Bypasses Hooks
**Severity: MEDIUM**
`register_user()` SQL function generates a UUID client-side and inserts directly into `auth.users`. This bypasses Supabase's:
- Email confirmation hooks
- User creation webhooks
- Rate limiting on auth.users

### 6.2 No Email Verification Flow
After registration, `setEmailVerified()` is called immediately, marking the email as verified without sending a verification email. This means:
- Anyone can register with any email
- The "verification" is instant and fake
- Password reset emails go to unverified emails

### 6.3 Duplicate Email Check Race Condition
`register/route.ts` checks `getUserByEmail()` before calling `registerUser()`. If two requests race, both could pass the check and one would fail with a duplicate error (caught in catch block).

---

## 7. Role Switching Issues

### 7.1 No Server-side Role Persistence
Role selection is stored only in localStorage. If a user clears their cache or uses a different device, the active role defaults to the first role in their array.

### 7.2 Role Switcher Doesn't Navigate Correctly
The `RoleSwitcher` component saves the current path for the old role and navigates to the saved path for the new role. But if the saved path is a route the new role can't access (e.g., a buyer route when switching to seller), the middleware will bounce them.

### 7.3 Existing Users Missing Seller Business Types
The seed query in the migration grants 'seller' role to users with old roles (farmer/manufacturer/wholesaler) but doesn't migrate their existing businesses to `seller_profiles` or `seller_business_types`.

---

## 8. UI/UX Issues

### 8.1 Auth State Flickering
The `AuthProvider` re-fetches user state on every pathname change via `useEffect([pathname, refresh])`. This causes a flash of loading/unauthenticated state on every navigation.

### 8.2 No Optimistic Auth State
On page load, the auth state always starts as `loading: true`, then fetches `/api/auth/session`. This means every page shows a loading state before showing content, even if the user has a valid cookie.

### 8.3 Login Return Redirect Broken
While middleware no longer redirects to dashboard, the login page redirects to `/marketplace` by default. The `?redirect=` param works but is only set by the middleware for protected routes. Some flows (like clicking "Sign In" from a product page) don't preserve the current URL.

### 8.4 No Persistent "Return to Previous Page" After Login
The `redirect` query param only captures the URL at the time the middleware redirects. If a user types `/login` directly, the redirect param is lost and they go to `/marketplace`.

---

## 9. Code Quality Issues

### 9.1 Dead Code
- `packages/models/src/common.ts` - Some types unused
- `REFRESH_COOKIE` in session.ts - defined but never used
- `getBrowserClient()` in client.ts - exported but identical to `createBrowserClient()`

### 9.2 Inconsistent Error Handling
- Some routes return `{ success: false, error: '...' }` with appropriate status codes
- Some routes return generic 500 with no error details
- Some routes catch all errors with generic messages (leak of internal state: prevented, but confusing for debugging)

### 9.3 Missing Input Validation
- `register/route.ts` has password validation (good)
- `reset-password/route.ts` has basic length check (weak)
- Most other routes have minimal/no input validation

### 9.4 No Logging
No authentication events are logged. Failed login attempts, password changes, role changes, etc. have no audit trail.

---

## 10. Database Policy Issues

### 10.1 RLS Policies Reference `auth.uid()` 
The `user_roles`, `seller_profiles`, etc. use `auth.uid()` in RLS policies. The `auth.uid()` function returns the Supabase Auth UID, which only works when requests go through Supabase's API gateway (using the anon key + session). Our custom auth bypasses this entirely (direct pool with service role key). So RLS policies on these tables are **not enforced** for custom auth requests.

### 10.2 `is_admin()` Function
RLS policies reference `is_admin()` which is not defined in any migration. This would cause errors.

---

## 11. Recommended Fixes (Priority Order)

### P0 - CRITICAL
1. [P0] Fix dual-auth conflict: create Supabase session in login/register routes alongside custom session
2. [P0] Test cart, orders, wallet, profile flows end-to-end

### P1 - HIGH
3. [P1] Add refresh token mechanism or extend session validity with rotation
4. [P1] Add CSRF protection for state-changing API routes
5. [P1] Fix API route authorization (role checks on wallet, orders, etc.)
6. [P1] Use separate secret for password reset tokens
7. [P1] Add rate limiting to all auth routes (change-password, etc.)
8. [P1] Fix auth state flickering (remove pathname dependency from AuthProvider)
9. [P1] Add audit logging for auth events

### P2 - MEDIUM
10. [P2] Define `is_admin()` function or remove RLS references to it
11. [P2] Remove dead code (REFRESH_COOKIE, getBrowserClient)
12. [P2] Standardize error handling across all API routes
13. [P2] Add input validation middleware
14. [P2] Migrate all API routes to use a single auth pattern
15. [P2] Add absolute session timeout for "remember me"

### P3 - LOW
16. [P3] Add persistent rate limiting (Vercel KV / Redis)
17. [P3] Optimistic auth state from cookie without server round-trip
18. [P3] Add `__Host-` prefix to session cookie
19. [P3] Add comprehensive logging
20. [P3] Add proper forgot-password rate limiting

---

## 12. Files Modified Summary

See `packages/shared/src/supabase/`, `apps/website/src/middleware.ts`,
`apps/website/src/app/api/auth/*`, `apps/website/src/lib/auth.tsx`,
`apps/website/src/components/layout/*`, `apps/website/src/app/(public)/*`,
`supabase/migrations/`, etc.

---

## 13. Remaining Risks

1. Password reset still sends email via SendGrid API key stored in env - single point of failure
2. In-memory rate limiting resets on Vercel cold starts
3. No multi-factor authentication
4. No account recovery flow beyond password reset
5. Service role key (SUPABASE_SERVICE_ROLE_KEY) has full database access if leaked
6. No webhook notifications for suspicious auth activity
