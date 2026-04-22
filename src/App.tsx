import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DriverLayout from "@/layouts/DriverLayout";
import DevicePreviewPage from "@/pages/DevicePreviewPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RideProvider } from "@/contexts/RideContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";

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
import ServicesPage from "./pages/rider/ServicesPage";
import CabyExpressPage from "./pages/rider/CabyExpressPage";
import CabyVanPage from "./pages/rider/CabyVanPage";
import VanInspirePage from "./pages/rider/VanInspirePage";
import VanDestinationPage from "./pages/rider/VanDestinationPage";
import VanLemanPage from "./pages/rider/VanLemanPage";
import VanSelectPage from "./pages/rider/VanSelectPage";
import VanPackPage from "./pages/rider/VanPackPage";
import VanPassengersPage from "./pages/rider/VanPassengersPage";
import VanTermsPage from "./pages/rider/VanTermsPage";
import VanSeatPage from "./pages/rider/VanSeatPage";
import VanLuggagePage from "./pages/rider/VanLuggagePage";
import VanOptionsPage from "./pages/rider/VanOptionsPage";
import VanPaymentPage from "./pages/rider/VanPaymentPage";
import VanDocumentsPage from "./pages/rider/van/VanDocumentsPage";
import VanBagagesPage from "./pages/rider/van/VanBagagesPage";
import VanFlexPassPage from "./pages/rider/van/VanFlexPassPage";
import VanAssistancePage from "./pages/rider/van/VanAssistancePage";
import VanPassPage from "./pages/rider/van/VanPassPage";
import VanCrossBorderPage from "./pages/rider/van/VanCrossBorderPage";
import VanSkiPage from "./pages/rider/van/VanSkiPage";
import CabyNightPage from "./pages/rider/CabyNightPage";
import CabyPassPage from "./pages/rider/CabyPassPage";
import CabyBusinessPage from "./pages/rider/CabyBusinessPage";
import ActivityPage from "./pages/rider/ActivityPage";
import OffersPage from "./pages/rider/OffersPage";
import PaymentPage from "./pages/rider/PaymentPage";
import AccountPage from "./pages/rider/AccountPage";
import AccountSettingsPage from "./pages/rider/AccountSettingsPage";
import HelpPage from "./pages/rider/HelpPage";
import SafetyPage from "./pages/rider/SafetyPage";
import SafetyPreferencesPage from "./pages/rider/safety/SafetyPreferencesPage";
import TrustedContactsPage from "./pages/rider/safety/TrustedContactsPage";
import VerifyTripPage from "./pages/rider/safety/VerifyTripPage";
import RideCheckPage from "./pages/rider/safety/RideCheckPage";
import SafetyTipsPage from "./pages/rider/safety/SafetyTipsPage";
import TeenSafetyPage from "./pages/rider/safety/TeenSafetyPage";
import SafetyAtCabyPage from "./pages/rider/safety/SafetyAtCabyPage";
import InboxPage from "./pages/rider/InboxPage";

// Caby Driver pages
import DriverRadarPage from "./pages/cabyDriver/DriverRadarPage";
import DriverHelpPage from "./pages/cabyDriver/DriverHelpPage";
import DriverLogisticsPage from "./pages/cabyDriver/DriverLogisticsPage";
import DriverColisFlowPage from "./pages/cabyDriver/DriverColisFlowPage";
import DriverClubPage from "./pages/cabyDriver/DriverClubPage";
import DriverMapPage from "./pages/cabyDriver/DriverMapPage";
import DriverDashboardPage from "./pages/cabyDriver/DriverDashboardPage";
import DriverProfilePage from "./pages/cabyDriver/DriverProfilePage";
import DriverEarningsPage from "./pages/cabyDriver/DriverEarningsPage";
import DriverCrossBorderPage from "./pages/cabyDriver/DriverCrossBorderPage";
import DriverFiscalPage from "./pages/cabyDriver/DriverFiscalPage";
import VanNotificationsPage from "@/pages/driver/VanNotificationsPage";
import VanPreDeparturePage from "@/pages/driver/VanPreDeparturePage";
import CabyCrossBorderPage from "./pages/rider/CabyCrossBorderPage";
import WalletPage from "./pages/rider/WalletPage";
import MyReservationsPage from "./pages/rider/MyReservationsPage";
import InvitePage from "./pages/InvitePage";
import EarlyAccessPage from "./pages/EarlyAccessPage";
import PartnerLoginPage from "./pages/partner/PartnerLoginPage";
import PartnerDashboardPage from "./pages/partner/PartnerDashboardPage";
import { PartnerProvider } from "@/contexts/PartnerContext";
import HowItWorksPage from "./pages/HowItWorksPage";
import CGUModal from "@/components/shared/CGUModal";
import CabyTestDashboard from "@/pages/admin/CabyTestDashboard";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GoogleMapsProvider>
      <AuthProvider>
        <RideProvider>
          <PartnerProvider>
          <CGUModal />
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
              <Route path="/caby/services" element={<ServicesPage />} />
              <Route path="/caby/express" element={<CabyExpressPage />} />
              <Route path="/caby/van" element={<CabyVanPage />} />
              <Route path="/caby/van/inspire" element={<VanInspirePage />} />
              <Route path="/caby/van/leman" element={<VanLemanPage />} />
              <Route path="/caby/van/destination/:city" element={<VanDestinationPage />} />
              <Route path="/caby/van/select" element={<VanSelectPage />} />
              <Route path="/caby/van/pack" element={<VanPackPage />} />
              <Route path="/caby/van/passengers" element={<VanPassengersPage />} />
              <Route path="/caby/van/terms" element={<VanTermsPage />} />
              <Route path="/caby/van/seat" element={<VanSeatPage />} />
              <Route path="/caby/van/luggage" element={<VanLuggagePage />} />
              <Route path="/caby/van/options" element={<VanOptionsPage />} />
              <Route path="/caby/van/payment" element={<VanPaymentPage />} />
              <Route path="/caby/van/documents" element={<VanDocumentsPage />} />
              <Route path="/caby/van/bagages" element={<VanBagagesPage />} />
              <Route path="/caby/van/flex-pass" element={<VanFlexPassPage />} />
              <Route path="/caby/van/assistance" element={<VanAssistancePage />} />
              <Route path="/caby/van/pass" element={<VanPassPage />} />
              <Route path="/caby/van/crossborder" element={<VanCrossBorderPage />} />
              <Route path="/caby/van/ski" element={<VanSkiPage />} />
              <Route path="/caby/crossborder" element={<CabyCrossBorderPage />} />
              <Route path="/caby/night" element={<CabyNightPage />} />
              <Route path="/caby/pass" element={<CabyPassPage />} />
              <Route path="/caby/activity" element={<ActivityPage />} />
              <Route path="/caby/offers" element={<OffersPage />} />
              <Route path="/caby/account" element={<AccountPage />} />
              <Route path="/caby/account/settings" element={<AccountSettingsPage />} />
              <Route path="/caby/account/help" element={<HelpPage />} />
              <Route path="/caby/account/wallet" element={<WalletPage />} />
              <Route path="/caby/account/reservations" element={<MyReservationsPage />} />
              <Route path="/caby/account/safety" element={<SafetyPage />} />
              <Route path="/caby/account/safety/preferences" element={<SafetyPreferencesPage />} />
              <Route path="/caby/account/safety/contacts" element={<TrustedContactsPage />} />
              <Route path="/caby/account/safety/verify" element={<VerifyTripPage />} />
              <Route path="/caby/account/safety/ridecheck" element={<RideCheckPage />} />
              <Route path="/caby/account/safety/tips" element={<SafetyTipsPage />} />
              <Route path="/caby/account/safety/teen" element={<TeenSafetyPage />} />
              <Route path="/caby/account/safety/about" element={<SafetyAtCabyPage />} />
              <Route path="/caby/account/inbox" element={<InboxPage />} />
              
              {/* Legacy rider routes - redirect to /caby */}
              <Route path="/rider" element={<Navigate to="/caby" replace />} />
              <Route path="/rider/*" element={<Navigate to="/caby" replace />} />

              {/* Legacy driver routes - redirect to /caby/driver */}
              <Route path="/driver" element={<Navigate to="/caby/driver" replace />} />
              <Route path="/driver/*" element={<Navigate to="/caby/driver" replace />} />
              <Route path="/tatfleet" element={<Navigate to="/caby/driver/dashboard" replace />} />
              <Route path="/tatfleet/*" element={<Navigate to="/caby/driver/dashboard" replace />} />

              {/* Caby Driver Interface */}
              <Route path="/caby/driver" element={<DriverLayout />}>
                <Route index element={<Navigate to="/caby/driver/dashboard" replace />} />
                <Route path="radar" element={<Navigate to="/caby/driver/dashboard" replace />} />
                <Route path="map" element={<Navigate to="/caby/driver/dashboard" replace />} />
                <Route path="dashboard" element={<DriverDashboardPage />} />
                <Route path="help" element={<DriverHelpPage />} />
                <Route path="logistics" element={<DriverLogisticsPage />} />
                <Route path="colis" element={<DriverColisFlowPage />} />
                <Route path="club" element={<DriverClubPage />} />
                <Route path="profile" element={<DriverProfilePage />} />
                <Route path="earnings" element={<DriverEarningsPage />} />
                <Route path="crossborder" element={<DriverCrossBorderPage />} />
                <Route path="fiscal" element={<DriverFiscalPage />} />
                <Route path="van-missions" element={<VanNotificationsPage />} />
                <Route path="van-checklist" element={<VanPreDeparturePage />} />
              </Route>

              {/* Invite */}
              <Route path="/invite/:code" element={<InvitePage />} />

              {/* Partner */}
              <Route path="/partner/login" element={<PartnerLoginPage />} />
              <Route path="/partner/dashboard" element={<PartnerDashboardPage />} />
              <Route path="/partner" element={<Navigate to="/partner/login" replace />} />

              {/* Business Pro */}
              <Route path="/business" element={<CabyBusinessPage />} />

              {/* Device Preview */}
              {/* How It Works */}
              <Route path="/how-it-works" element={<HowItWorksPage />} />

              {/* Early Access */}
              <Route path="/early-access" element={<EarlyAccessPage />} />

              {/* Admin Tests */}
              <Route path="/caby/admin/tests" element={<CabyTestDashboard />} />

              {/* Device Preview */}
              <Route path="/preview" element={<DevicePreviewPage />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </PartnerProvider>
        </RideProvider>
      </AuthProvider>
      </GoogleMapsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
