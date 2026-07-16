import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { HomePage } from '@/features/marketplace/pages/home-page'
import { MarketplacePage } from '@/features/marketplace/pages/marketplace-page'
import { LoginPage } from '@/features/auth/pages/login-page'
import { RegisterPage } from '@/features/auth/pages/register-page'
import { ForgotPasswordPage } from '@/features/auth/pages/forgot-password-page'
import { ResetPasswordPage } from '@/features/auth/pages/reset-password-page'
import { ProfilePage } from '@/features/auth/pages/profile-page'
import { SellerApplicationPage } from '@/features/seller/pages/seller-application-page'
import { VerifyEmailPage } from '@/features/auth/pages/verify-email-page'
import { AuthGuard } from '@/features/auth/components/auth-guard'
import { GuestGuard } from '@/features/auth/components/guest-guard'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
        <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
        <Route path="/become-seller" element={<AuthGuard><SellerApplicationPage /></AuthGuard>} />
      </Route>
    </Routes>
  )
}
