import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  SidebarProvider, 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Car, MapIcon, Route, List, Home, Phone, Share2, Navigation, LogOut, Plane } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ProvidersManagement from "@/components/admin/ProvidersManagement";
import VehiclesManagement from "@/components/admin/VehiclesManagement";
import ToursManagement from "@/components/admin/ToursManagement";
import HomePageManagement from "@/components/admin/HomePageManagement";
import ContactInfoManagement from "@/components/admin/ContactInfoManagement";
import SocialMediaManagement from "@/components/admin/SocialMediaManagement";
import TransferBookingsManagement from "@/components/admin/TransferBookingsManagement";
import TourBookingsManagement from "@/components/admin/TourBookingsManagement";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Provider, Vehicle, TransferBooking, TourBooking, AdminView } from "@shared/schema";

export default function AdminPage() {
  const { isAdmin, isLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("homepage");

  const { data: providers = [] } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
    enabled: isAdmin,
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    enabled: isAdmin,
  });

  const { data: transferBookings = [] } = useQuery<TransferBooking[]>({
    queryKey: ["/api/transfer-bookings"],
    enabled: isAdmin,
  });

  const { data: tourBookings = [] } = useQuery<TourBooking[]>({
    queryKey: ["/api/tour-bookings"],
    enabled: isAdmin,
  });

  const { data: adminViews = [] } = useQuery<AdminView[]>({
    queryKey: ["/api/admin/views"],
    enabled: isAdmin,
  });

  const updateViewMutation = useMutation({
    mutationFn: async (section: string) => {
      await apiRequest("POST", "/api/admin/views", { section });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/views"] });
    },
  });

  // Calculate new items count for each section
  const getLastViewedAt = (section: string): Date | null => {
    const view = adminViews.find(v => v.section === section);
    return view ? new Date(view.lastViewedAt) : null;
  };

  const countNewItems = <T extends { createdAt: Date | string }>(items: T[], section: string): number => {
    const lastViewed = getLastViewedAt(section);
    if (!lastViewed) return items.length; // If never viewed, all are new
    return items.filter(item => new Date(item.createdAt) > lastViewed).length;
  };

  const newProviders = countNewItems(providers, "providers");
  const newVehicles = countNewItems(vehicles, "vehicles");
  const newTransfers = countNewItems(transferBookings.filter(b => b.status === "pending"), "transfers");
  const newTours = countNewItems(tourBookings.filter(b => b.status === "pending"), "tours");

  // Update view timestamp when clicking on a section
  const handleSectionClick = (section: string) => {
    updateViewMutation.mutate(section);
  };

  const pendingTransfers = transferBookings.filter(b => b.status === "pending").length;
  const pendingTours = tourBookings.filter(b => b.status === "pending").length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect to /admin/login
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>NavetteClub Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveTab("homepage")}
                      isActive={activeTab === "homepage"}
                      data-testid="button-nav-homepage"
                    >
                      <Home className="w-4 h-4" />
                      <span>Page d'Accueil</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        setActiveTab("providers");
                        handleSectionClick("providers");
                      }}
                      isActive={activeTab === "providers"}
                      data-testid="button-nav-providers"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Fournisseurs</span>
                      {newProviders > 0 && (
                        <Badge variant="secondary" className="ml-auto" data-testid="badge-providers-count">
                          {newProviders}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        setActiveTab("vehicles");
                        handleSectionClick("vehicles");
                      }}
                      isActive={activeTab === "vehicles"}
                      data-testid="button-nav-vehicles"
                    >
                      <Car className="w-4 h-4" />
                      <span>Véhicules</span>
                      {newVehicles > 0 && (
                        <Badge variant="secondary" className="ml-auto" data-testid="badge-vehicles-count">
                          {newVehicles}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveTab("tours")}
                      isActive={activeTab === "tours"}
                      data-testid="button-nav-tours"
                    >
                      <MapIcon className="w-4 h-4" />
                      <span>City Tours</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        setActiveTab("transfers");
                        handleSectionClick("transfers");
                      }}
                      isActive={activeTab === "transfers"}
                      data-testid="button-nav-transfers"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Demandes Transfert</span>
                      {newTransfers > 0 && (
                        <Badge variant="destructive" className="ml-auto" data-testid="badge-transfers-pending">
                          {newTransfers}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        setActiveTab("tour-bookings");
                        handleSectionClick("tours");
                      }}
                      isActive={activeTab === "tour-bookings"}
                      data-testid="button-nav-tour-bookings"
                    >
                      <Plane className="w-4 h-4" />
                      <span>Demandes City Tours</span>
                      {newTours > 0 && (
                        <Badge variant="destructive" className="ml-auto" data-testid="badge-tours-pending">
                          {newTours}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveTab("contact")}
                      isActive={activeTab === "contact"}
                      data-testid="button-nav-contact"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Contact</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveTab("social")}
                      isActive={activeTab === "social"}
                      data-testid="button-nav-social"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Réseaux Sociaux</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold">
                Administration NavetteClub
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/';
                }}
                data-testid="button-admin-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="homepage" className="mt-0">
                <HomePageManagement />
              </TabsContent>

              <TabsContent value="providers" className="mt-0">
                <ProvidersManagement />
              </TabsContent>

              <TabsContent value="vehicles" className="mt-0">
                <VehiclesManagement />
              </TabsContent>

              <TabsContent value="tours" className="mt-0">
                <ToursManagement />
              </TabsContent>

              <TabsContent value="transfers" className="mt-0">
                <TransferBookingsManagement />
              </TabsContent>

              <TabsContent value="tour-bookings" className="mt-0">
                <TourBookingsManagement />
              </TabsContent>

              <TabsContent value="contact" className="mt-0">
                <ContactInfoManagement />
              </TabsContent>

              <TabsContent value="social" className="mt-0">
                <SocialMediaManagement />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
