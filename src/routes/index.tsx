import { Routes, Route } from 'react-router-dom'
import { PublicLayout, AuthenticatedLayout, SellerLayout, AdminLayout } from '@/components/layouts'
import { PublicRoute, ProtectedRoute, SellerRoute, AdminRoute } from '@/components/auth'
import { HomePage } from '@/features/marketplace/pages/home-page'
import { MarketplacePage } from '@/features/marketplace/pages/marketplace-page'
import { ProductPage } from '@/features/marketplace/pages/product-page'
import { LoginPage } from '@/features/auth/pages/login-page'
import { RegisterPage } from '@/features/auth/pages/register-page'
import { ForgotPasswordPage } from '@/features/auth/pages/forgot-password-page'
import { ResetPasswordPage } from '@/features/auth/pages/reset-password-page'
import { VerifyEmailPage } from '@/features/auth/pages/verify-email-page'
import { ProfilePage } from '@/features/auth/pages/profile-page'
import { SellerApplicationPage } from '@/features/seller/pages/seller-application-page'
import { SellerProductsPage } from '@/features/seller/pages/seller-products-page'
import { ProductFormPage } from '@/features/seller/pages/product-form-page'
import { SellerDashboardPage } from '@/features/seller/pages/seller-dashboard-page'
import { SellerSettingsPage } from '@/features/seller/pages/seller-settings-page'
import { WalletPage } from '@/features/wallet/pages/wallet-page'
import { WithdrawalPage } from '@/features/wallet/pages/withdrawal-page'
import { OrdersPage } from '@/features/orders/pages/orders-page'
import { OrderDetailPage } from '@/features/orders/pages/order-detail-page'
import { ConversationsPage } from '@/features/messaging/pages/conversations-page'
import { ChatPage } from '@/features/messaging/pages/chat-page'
import { FavoritesPage } from '@/features/favorites/pages/favorites-page'
import { CartPage } from '@/features/cart/pages/cart-page'
import { AdminDashboard } from '@/features/admin/pages/admin-dashboard'
import { AdminSellersPage } from '@/features/admin/pages/admin-sellers'
import { AdminWithdrawalsPage } from '@/features/admin/pages/admin-withdrawals'
import { NotFoundPage } from '@/features/not-found/pages/not-found-page'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/become-seller" element={<SellerApplicationPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/wallet/withdraw" element={<WithdrawalPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/messages" element={<ConversationsPage />} />
        <Route path="/messages/:id" element={<ChatPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>

      <Route element={<SellerRoute><SellerLayout /></SellerRoute>}>
        <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
        <Route path="/seller/products" element={<SellerProductsPage />} />
        <Route path="/seller/products/new" element={<ProductFormPage />} />
        <Route path="/seller/products/edit/:id" element={<ProductFormPage />} />
        <Route path="/seller/settings" element={<SellerSettingsPage />} />
      </Route>

      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/sellers" element={<AdminSellersPage />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
      </Route>
    </Routes>
  )
}
