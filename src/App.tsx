import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import SearchResults from "./pages/SearchResults.tsx";
import SeatSelection from "./pages/SeatSelection.tsx";
import Checkout from "./pages/Checkout.tsx";
import TicketConfirmation from "./pages/TicketConfirmation.tsx";
import ManageBooking from "./pages/ManageBooking.tsx";
import LiveTracking from "./pages/LiveTracking.tsx";
import RoutesFleet from "./pages/RoutesFleet.tsx";
import Support from "./pages/Support.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/seat-selection" element={<SeatSelection />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/ticket" element={<TicketConfirmation />} />
          <Route path="/manage-booking" element={<ManageBooking />} />
          <Route path="/live-tracking" element={<LiveTracking />} />
          <Route path="/routes" element={<RoutesFleet />} />
          <Route path="/support" element={<Support />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
