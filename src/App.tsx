import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RideProvider } from "@/contexts/RideContext";

// Pages
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Caby (Rider) pages
import RiderHome from "./pages/rider/RiderHome";
import RiderSearch from "./pages/rider/RiderSearch";
import ConfirmRide from "./pages/rider/ConfirmRide";
import SearchingDriver from "./pages/rider/SearchingDriver";
import TripTracking from "./pages/rider/TripTracking";
import ActivityPage from "./pages/rider/ActivityPage";
import PaymentPage from "./pages/rider/PaymentPage";
import AccountPage from "./pages/rider/AccountPage";
import AccountSettingsPage from "./pages/rider/AccountSettingsPage";
import HelpPage from "./pages/rider/HelpPage";

// TATFleet (Driver) pages
import DriverRadarPage from "./pages/tatfleet/DriverRadarPage";
import DriverHelpPage from "./pages/tatfleet/DriverHelpPage";

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
              <Route path="/" element={<LandingPage />} />

              {/* Auth */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />

              {/* Caby - Rider Interface */}
              <Route path="/caby" element={<RiderHome />} />
              <Route path="/caby/search" element={<RiderSearch />} />
              <Route path="/caby/confirm" element={<ConfirmRide />} />
              <Route path="/caby/searching" element={<SearchingDriver />} />
              <Route path="/caby/trip" element={<TripTracking />} />
              <Route path="/caby/activity" element={<ActivityPage />} />
              <Route path="/caby/payment" element={<PaymentPage />} />
              <Route path="/caby/account" element={<AccountPage />} />
              <Route path="/caby/account/settings" element={<AccountSettingsPage />} />
              <Route path="/caby/account/help" element={<HelpPage />} />
              
              {/* Legacy rider routes - redirect to /caby */}
              <Route path="/rider" element={<Navigate to="/caby" replace />} />
              <Route path="/rider/*" element={<Navigate to="/caby" replace />} />

              {/* TATFleet - Driver Interface */}
              <Route path="/tatfleet" element={<Navigate to="/tatfleet/radar" replace />} />
              <Route path="/tatfleet/radar" element={<DriverRadarPage />} />
              <Route path="/tatfleet/help" element={<DriverHelpPage />} />

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
