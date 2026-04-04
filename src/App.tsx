import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

// Critical routes — eager loaded
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import SearchResults from "./pages/SearchResults.tsx";

// Non-critical routes — lazy loaded
const SeatSelection = lazy(() => import("./pages/SeatSelection.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const TicketConfirmation = lazy(() => import("./pages/TicketConfirmation.tsx"));
const ManageBooking = lazy(() => import("./pages/ManageBooking.tsx"));
const LiveTracking = lazy(() => import("./pages/LiveTracking.tsx"));
const RoutesFleet = lazy(() => import("./pages/RoutesFleet.tsx"));
const Counters = lazy(() => import("./pages/Counters.tsx"));
const Support = lazy(() => import("./pages/Support.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const AdminProfile = lazy(() => import("./pages/AdminProfile.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const PassengerDashboard = lazy(() => import("./pages/PassengerDashboard.tsx"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess.tsx"));
const PaymentFail = lazy(() => import("./pages/PaymentFail.tsx"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel.tsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const MyComplaints = lazy(() => import("./pages/MyComplaints.tsx"));
import AIChatWidget from "./components/support/AIChatWidget";

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes — eager */}
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/signin" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/register" element={<Register />} />

                {/* Public routes — lazy */}
                <Route path="/seat-selection" element={<SeatSelection />} />
                <Route path="/routes" element={<RoutesFleet />} />
                <Route path="/counters" element={<Counters />} />
                <Route path="/support" element={<Support />} />
                <Route path="/live-tracking" element={<LiveTracking />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                {/* Payment return pages */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/fail" element={<PaymentFail />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />

                {/* Protected routes — require login */}
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/ticket" element={<ProtectedRoute><TicketConfirmation /></ProtectedRoute>} />
                <Route path="/manage-booking" element={<ProtectedRoute><ManageBooking /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><PassengerDashboard /></ProtectedRoute>} />
                <Route path="/my-complaints" element={<ProtectedRoute><MyComplaints /></ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute requireAdmin><AdminProfile /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <AIChatWidget />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
