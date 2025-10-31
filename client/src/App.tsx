import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APIProvider } from "@vis.gl/react-google-maps";
import HomePage from "@/pages/HomePage";
import CityToursPage from "@/pages/CityToursPage";
import TourDetailPage from "@/pages/TourDetailPage";
import VehicleDetailPage from "@/pages/VehicleDetailPage";
import TransferSearchPage from "@/pages/TransferSearchPage";
import TransferVehiclesPage from "@/pages/TransferVehiclesPage";
import TransferConfirmPage from "@/pages/TransferConfirmPage";
import AdminPage from "@/pages/AdminPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import RegisterPage from "@/pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import FAQPage from "@/pages/FAQPage";
import HelpPage from "@/pages/HelpPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import CancellationPage from "@/pages/CancellationPage";
import ClientDashboardPage from "@/pages/ClientDashboardPage";
import ProviderDashboardPage from "@/pages/ProviderDashboardPage";
import ProviderRegisterPage from "@/pages/ProviderRegisterPage";
import ProviderVehiclesPage from "@/pages/ProviderVehiclesPage";
import ProviderAddVehiclePage from "@/pages/ProviderAddVehiclePage";
import ProviderRequestsPage from "@/pages/ProviderRequestsPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentFailurePage from "@/pages/PaymentFailurePage";
import NotFound from "@/pages/not-found";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/city-tours" component={CityToursPage} />
      <Route path="/tours/:slug" component={TourDetailPage} />
      <Route path="/vehicles/:id" component={VehicleDetailPage} />
      <Route path="/book/transfer" component={TransferSearchPage} />
      <Route path="/book/transfer/vehicles" component={TransferVehiclesPage} />
      <Route path="/book/transfer/confirm" component={TransferConfirmPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/client/dashboard" component={ClientDashboardPage} />
      <Route path="/provider/dashboard" component={ProviderDashboardPage} />
      <Route path="/provider/register" component={ProviderRegisterPage} />
      <Route path="/provider/vehicles" component={ProviderVehiclesPage} />
      <Route path="/provider/vehicles/add" component={ProviderAddVehiclePage} />
      <Route path="/provider/requests" component={ProviderRequestsPage} />
      <Route path="/payment/success" component={PaymentSuccessPage} />
      <Route path="/payment/failure" component={PaymentFailurePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/help" component={HelpPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/cancellation" component={CancellationPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </APIProvider>
    </QueryClientProvider>
  );
}

export default App;
