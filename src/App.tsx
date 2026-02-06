import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RideProvider } from "@/contexts/RideContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Rider pages
import RiderHome from "./pages/rider/RiderHome";
import RiderSearch from "./pages/rider/RiderSearch";
import ConfirmRide from "./pages/rider/ConfirmRide";
import SearchingDriver from "./pages/rider/SearchingDriver";
import TripTracking from "./pages/rider/TripTracking";
import ActivityPage from "./pages/rider/ActivityPage";
import PaymentPage from "./pages/rider/PaymentPage";
import AccountPage from "./pages/rider/AccountPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <RideProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Landing */}
              <Route path="/" element={<Index />} />

              {/* Auth */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />

              {/* Rider */}
              <Route path="/rider" element={<RiderHome />} />
              <Route path="/rider/search" element={<RiderSearch />} />
              <Route path="/rider/confirm" element={<ConfirmRide />} />
              <Route path="/rider/searching" element={<SearchingDriver />} />
              <Route path="/rider/trip" element={<TripTracking />} />
              <Route path="/rider/activity" element={<ActivityPage />} />
              <Route path="/rider/payment" element={<PaymentPage />} />
              <Route path="/rider/account" element={<AccountPage />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RideProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
