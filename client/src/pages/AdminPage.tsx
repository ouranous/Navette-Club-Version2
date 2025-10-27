import { useState } from "react";
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
import { Building2, Car, MapIcon, Route, List } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ProvidersManagement from "@/components/admin/ProvidersManagement";
import VehiclesManagement from "@/components/admin/VehiclesManagement";
import ToursManagement from "@/components/admin/ToursManagement";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("providers");

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
                      onClick={() => setActiveTab("providers")}
                      isActive={activeTab === "providers"}
                      data-testid="button-nav-providers"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Fournisseurs</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveTab("vehicles")}
                      isActive={activeTab === "vehicles"}
                      data-testid="button-nav-vehicles"
                    >
                      <Car className="w-4 h-4" />
                      <span>Véhicules</span>
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
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="providers" className="mt-0">
                <ProvidersManagement />
              </TabsContent>

              <TabsContent value="vehicles" className="mt-0">
                <VehiclesManagement />
              </TabsContent>

              <TabsContent value="tours" className="mt-0">
                <ToursManagement />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
