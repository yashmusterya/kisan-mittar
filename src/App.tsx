import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense, lazy } from "react";

// Eager loaded pages (frequently accessed)
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Lazy loaded pages
const Chat = lazy(() => import("./pages/Chat"));
const Weather = lazy(() => import("./pages/Weather"));
const FAQ = lazy(() => import("./pages/FAQ"));
const MyQuestions = lazy(() => import("./pages/MyQuestions"));
const Profile = lazy(() => import("./pages/Profile"));
const ExpertDashboard = lazy(() => import("./pages/ExpertDashboard"));
const Shop = lazy(() => import("./pages/Shop"));
const Cart = lazy(() => import("./pages/Cart"));
const Alerts = lazy(() => import("./pages/Alerts"));

// Layout
import AppLayout from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
    <div className="w-full max-w-sm space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={
                  <Suspense fallback={<PageLoader />}>
                    <Chat />
                  </Suspense>
                } />
                <Route path="/weather" element={
                  <Suspense fallback={<PageLoader />}>
                    <Weather />
                  </Suspense>
                } />
                <Route path="/faq" element={
                  <Suspense fallback={<PageLoader />}>
                    <FAQ />
                  </Suspense>
                } />
                <Route path="/questions" element={
                  <Suspense fallback={<PageLoader />}>
                    <MyQuestions />
                  </Suspense>
                } />
                <Route path="/profile" element={
                  <Suspense fallback={<PageLoader />}>
                    <Profile />
                  </Suspense>
                } />
                <Route path="/expert" element={
                  <Suspense fallback={<PageLoader />}>
                    <ExpertDashboard />
                  </Suspense>
                } />
                <Route path="/shop" element={
                  <Suspense fallback={<PageLoader />}>
                    <Shop />
                  </Suspense>
                } />
                <Route path="/cart" element={
                  <Suspense fallback={<PageLoader />}>
                    <Cart />
                  </Suspense>
                } />
                <Route path="/alerts" element={
                  <Suspense fallback={<PageLoader />}>
                    <Alerts />
                  </Suspense>
                } />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
