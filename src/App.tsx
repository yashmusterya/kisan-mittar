import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { LanguageProvider } from "@/contexts/LanguageContext";
 import { AuthProvider } from "@/contexts/AuthContext";
 
 // Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
 import Welcome from "./pages/Welcome";
 import Auth from "./pages/Auth";
 import Dashboard from "./pages/Dashboard";
 import Chat from "./pages/Chat";
 import Weather from "./pages/Weather";
 import FAQ from "./pages/FAQ";
 import MyQuestions from "./pages/MyQuestions";
 import Profile from "./pages/Profile";
 import ExpertDashboard from "./pages/ExpertDashboard";
 
 // Layout
 import AppLayout from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

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
                <Route path="/chat" element={<Chat />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/questions" element={<MyQuestions />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/expert" element={<ExpertDashboard />} />
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
