import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/common/Toast';
import { Layout } from '@/components/layout';
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

            {/* Account routes placeholder */}
            <Route
              path="/account/*"
              element={
                <Layout>
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Account
                      </h1>
                      <p className="text-gray-500">
                        Account pages are coming soon!
                      </p>
                    </div>
                  </div>
                </Layout>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
