import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { HomePage } from '@/features/marketplace/pages/home-page'
import { MarketplacePage } from '@/features/marketplace/pages/marketplace-page'
import { LoginPage } from '@/features/auth/pages/login-page'
import { RegisterPage } from '@/features/auth/pages/register-page'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/marketplace', element: <MarketplacePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
])
