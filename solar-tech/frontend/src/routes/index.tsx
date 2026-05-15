import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AdminLayout from '@/layouts/AdminLayout'
import ProtectedRoute from './ProtectedRoute'
import PageLoader from '@/components/ui/PageLoader'

const wrap = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

const HomePage          = lazy(() => import('@/pages/HomePage'))
const CatalogPage       = lazy(() => import('@/features/catalog/pages/CatalogPage'))
const ProductPage       = lazy(() => import('@/features/product/pages/ProductPage'))
const CartPage          = lazy(() => import('@/features/cart/pages/CartPage'))
const CheckoutPage      = lazy(() => import('@/features/checkout/pages/CheckoutPage'))
const QuotePage         = lazy(() => import('@/features/quotes/pages/QuotePage'))
const LoginPage             = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage          = lazy(() => import('@/features/auth/pages/RegisterPage'))
const ForgotPasswordPage    = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage     = lazy(() => import('@/features/auth/pages/ResetPasswordPage'))
const AccountPage       = lazy(() => import('@/features/account/pages/AccountPage'))
const AdminDashboard    = lazy(() => import('@/features/admin/pages/AdminDashboardPage'))
const AdminProducts     = lazy(() => import('@/features/admin/pages/AdminProductsPage'))
const AdminOrders       = lazy(() => import('@/features/admin/pages/AdminOrdersPage'))
const AdminQuotes       = lazy(() => import('@/features/admin/pages/AdminQuotesPage'))
const SimulateurPage    = lazy(() => import('@/features/simulator/pages/SimulateurPage'))
const NotFoundPage      = lazy(() => import('@/pages/NotFoundPage'))

export const router = createBrowserRouter([
  /* Auth pages — no header/footer */
  {
    element: <Outlet />,
    children: [
      { path: '/connexion',                    element: wrap(LoginPage) },
      { path: '/inscription',                  element: wrap(RegisterPage) },
      { path: '/mot-de-passe-oublie',          element: wrap(ForgotPasswordPage) },
      { path: '/reinitialiser-mot-de-passe',   element: wrap(ResetPasswordPage) },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      { path: '/',                     element: wrap(HomePage) },
      { path: '/fr/:categorySlug',     element: wrap(CatalogPage) },
      { path: '/fr/produit/:slug',     element: wrap(ProductPage) },
      { path: '/fr/devis',             element: wrap(QuotePage) },
      { path: '/fr/simulateur',        element: wrap(SimulateurPage) },
      { path: '/panier',               element: wrap(CartPage) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/checkout',         element: wrap(CheckoutPage) },
          { path: '/compte/*',         element: wrap(AccountPage) },
        ],
      },
      { path: '*',                     element: wrap(NotFoundPage) },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute requiredRole="ROLE_ADMIN"><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true,                   element: wrap(AdminDashboard) },
      { path: 'produits',              element: wrap(AdminProducts) },
      { path: 'commandes',             element: wrap(AdminOrders) },
      { path: 'devis',                 element: wrap(AdminQuotes) },
    ],
  },
])
