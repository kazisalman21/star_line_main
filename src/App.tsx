import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import SearchResults from "./pages/SearchResults.tsx";
import SeatSelection from "./pages/SeatSelection.tsx";
import Checkout from "./pages/Checkout.tsx";
import TicketConfirmation from "./pages/TicketConfirmation.tsx";
import ManageBooking from "./pages/ManageBooking.tsx";
import LiveTracking from "./pages/LiveTracking.tsx";
import RoutesFleet from "./pages/RoutesFleet.tsx";
import Counters from "./pages/Counters.tsx";
import Support from "./pages/Support.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Profile from "./pages/Profile.tsx";
import PassengerDashboard from "./pages/PassengerDashboard.tsx";
import PaymentSuccess from "./pages/PaymentSuccess.tsx";
import PaymentFail from "./pages/PaymentFail.tsx";
import PaymentCancel from "./pages/PaymentCancel.tsx";
import TermsOfService from "./pages/TermsOfService.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import NotFound from "./pages/NotFound.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/seat-selection" element={<SeatSelection />} />
              <Route path="/routes" element={<RoutesFleet />} />
              <Route path="/counters" element={<Counters />} />
              <Route path="/support" element={<Support />} />
              <Route path="/live-tracking" element={<LiveTracking />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/signin" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/register" element={<Register />} />

              {/* Payment return pages — public (session may not persist after SSLCommerz redirect) */}
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/fail" element={<PaymentFail />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />

              {/* Protected routes — require login */}
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/ticket" element={<ProtectedRoute><TicketConfirmation /></ProtectedRoute>} />
              <Route path="/manage-booking" element={<ProtectedRoute><ManageBooking /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><PassengerDashboard /></ProtectedRoute>} />

              {/* Admin routes — require admin role */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
