import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Car, Users, MessageSquare, User, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Provider } from "@shared/schema";

export default function ProviderDashboardPage() {
  const { data: provider } = useQuery<Provider>({
    queryKey: ["/api/my-provider"],
  });

  const { data: user } = useQuery<{ firstName?: string; lastName?: string }>({
    queryKey: ["/api/auth/user"],
  });

  const dashboardCards = [
    {
      title: "MES DEMANDES",
      description: "Voir mes offres",
      icon: FileText,
      link: "/provider/requests",
      testId: "card-requests",
    },
    {
      title: "MES VÉHICULES",
      description: "Gérer mes véhicules",
      icon: Car,
      link: "/provider/vehicles",
      testId: "card-vehicles",
    },
    {
      title: "MES CHAUFFEURS",
      description: "Mes conducteurs",
      icon: Users,
      link: "/provider/drivers",
      testId: "card-drivers",
    },
    {
      title: "MESSAGES",
      description: "Conversations",
      icon: MessageSquare,
      link: "/provider/messages",
      testId: "card-messages",
    },
    {
      title: "MON PROFIL",
      description: "Mes informations",
      icon: User,
      link: "/provider/profile",
      testId: "card-profile",
    },
    {
      title: "MOT DE PASSE",
      description: "Changer mot de passe",
      icon: Lock,
      link: "/provider/password",
      testId: "card-password",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="outline"
          size="sm"
          onClick={() => (window.location.href = "/api/auth/logout")}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>

      <main className="container mx-auto px-4 py-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Espace Transporteur</h1>
          <p className="text-lg text-muted-foreground">
            Bienvenue {provider?.contactName || user?.firstName || ""}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card) => (
            <Link key={card.testId} href={card.link}>
              <Card
                className="hover-elevate active-elevate-2 cursor-pointer transition-all h-full"
                data-testid={card.testId}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <card.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {provider && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Informations de la société</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom de la société</p>
                <p className="font-medium">{provider.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{provider.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{provider.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{provider.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ville</p>
                <p className="font-medium">{provider.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zones desservies</p>
                <p className="font-medium">
                  {provider.serviceZones?.join(", ") || "Non spécifié"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
