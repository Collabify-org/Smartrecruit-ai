import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import JDGenerator from "./pages/JDGenerator";
import TalentIntelligence from "./pages/TalentIntelligence";
import InterviewQuestions from "./pages/InterviewQuestions";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";

import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";

// ✅ NEW PAGES ADDED
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />

          {/* Legal Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/app" element={<Dashboard />} />
              <Route path="/app/dashboard" element={<Dashboard />} />
              <Route path="/app/jd-generator" element={<JDGenerator />} />
              <Route path="/app/talent-intelligence" element={<TalentIntelligence />} />
              <Route path="/app/interview-questions" element={<InterviewQuestions />} />
              <Route path="/app/billing" element={<Billing />} />
              <Route path="/app/settings" element={<Settings />} />
              <Route path="/app/history" element={<History />} />
            </Route>
          </Route>

          {/* Redirect shortcuts */}
          <Route path="/jd-generator" element={<Navigate to="/app/jd-generator" replace />} />
          <Route path="/talent-intelligence" element={<Navigate to="/app/talent-intelligence" replace />} />
          <Route path="/billing" element={<Navigate to="/app/billing" replace />} />
          <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
