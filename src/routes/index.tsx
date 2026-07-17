import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { HomePage } from '@/features/marketplace/pages/home-page'
import { MarketplacePage } from '@/features/marketplace/pages/marketplace-page'
import { ProductPage } from '@/features/marketplace/pages/product-page'
import { LoginPage } from '@/features/auth/pages/login-page'
import { RegisterPage } from '@/features/auth/pages/register-page'
import { ForgotPasswordPage } from '@/features/auth/pages/forgot-password-page'
import { ResetPasswordPage } from '@/features/auth/pages/reset-password-page'
import { ProfilePage } from '@/features/auth/pages/profile-page'
import { SellerApplicationPage } from '@/features/seller/pages/seller-application-page'
import { SellerProductsPage } from '@/features/seller/pages/seller-products-page'
import { ProductFormPage } from '@/features/seller/pages/product-form-page'
import { WalletPage } from '@/features/wallet/pages/wallet-page'
import { WithdrawalPage } from '@/features/wallet/pages/withdrawal-page'
import { OrdersPage } from '@/features/orders/pages/orders-page'
import { OrderDetailPage } from '@/features/orders/pages/order-detail-page'
import { ConversationsPage } from '@/features/messaging/pages/conversations-page'
import { ChatPage } from '@/features/messaging/pages/chat-page'
import { FavoritesPage } from '@/features/favorites/pages/favorites-page'
import { AdminDashboard } from '@/features/admin/pages/admin-dashboard'
import { AdminSellersPage } from '@/features/admin/pages/admin-sellers'
import { AdminWithdrawalsPage } from '@/features/admin/pages/admin-withdrawals'
import { VerifyEmailPage } from '@/features/auth/pages/verify-email-page'
import { AuthGuard } from '@/features/auth/components/auth-guard'
import { GuestGuard } from '@/features/auth/components/guest-guard'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
        <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
        <Route path="/become-seller" element={<AuthGuard><SellerApplicationPage /></AuthGuard>} />
        <Route path="/seller/products" element={<AuthGuard><SellerProductsPage /></AuthGuard>} />
        <Route path="/seller/products/new" element={<AuthGuard><ProductFormPage /></AuthGuard>} />
        <Route path="/seller/products/edit/:id" element={<AuthGuard><ProductFormPage /></AuthGuard>} />
        <Route path="/wallet" element={<AuthGuard><WalletPage /></AuthGuard>} />
        <Route path="/wallet/withdraw" element={<AuthGuard><WithdrawalPage /></AuthGuard>} />
        <Route path="/orders" element={<AuthGuard><OrdersPage /></AuthGuard>} />
        <Route path="/orders/:id" element={<AuthGuard><OrderDetailPage /></AuthGuard>} />
        <Route path="/messages" element={<AuthGuard><ConversationsPage /></AuthGuard>} />
        <Route path="/messages/:id" element={<AuthGuard><ChatPage /></AuthGuard>} />
        <Route path="/favorites" element={<AuthGuard><FavoritesPage /></AuthGuard>} />
        <Route path="/admin" element={<AuthGuard requiredRole="admin"><AdminDashboard /></AuthGuard>} />
        <Route path="/admin/sellers" element={<AuthGuard requiredRole="admin"><AdminSellersPage /></AuthGuard>} />
        <Route path="/admin/withdrawals" element={<AuthGuard requiredRole="admin"><AdminWithdrawalsPage /></AuthGuard>} />
      </Route>
    </Routes>
  )
}
