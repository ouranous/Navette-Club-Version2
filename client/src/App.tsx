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
      <Route path="/admin" component={AdminPage} />
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
