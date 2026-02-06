import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/common/Toast';
import { Layout } from '@/components/layout';
import { useAuthStore } from '@/stores/authStore';
import {
  BrowsePage,
  ListingDetailPage,
  LookupPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  NotFoundPage,
} from '@/pages';
import { SellPage } from '@/pages/sell';
import { ProfilePage, MyListingsPage, EditListingPage, FavoritesPage } from '@/pages/account';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  return <>{children}</>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/buy" replace />} />

            {/* Main app routes with layout */}
            <Route element={<Layout />}>
              <Route path="/buy" element={<BrowsePage />} />
              <Route path="/buy/:listingId" element={<ListingDetailPage />} />
              <Route path="/lookup" element={<LookupPage />} />
            </Route>

            {/* Auth routes (no main layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Sell wizard */}
            <Route
              path="/sell"
              element={
                <Layout hideFooter>
                  <SellPage />
                </Layout>
              }
            />

            {/* Account routes (protected) */}
            <Route
              path="/account/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/listings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyListingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/listings/:listingId/edit"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EditListingPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/favorites"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FavoritesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={<Navigate to="/account/profile" replace />}
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
