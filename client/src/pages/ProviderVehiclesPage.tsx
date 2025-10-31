import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Plus, ChevronLeft } from "lucide-react";
import type { Vehicle } from "@shared/schema";

export default function ProviderVehiclesPage() {
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/my-vehicles"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="container mx-auto px-4 py-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/provider/dashboard">
              <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Mes Véhicules</h1>
            <p className="text-muted-foreground">
              Vos véhicules: {vehicles?.length || 0}
            </p>
          </div>
          <Link href="/provider/vehicles/add">
            <Button data-testid="button-add-vehicle">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un véhicule
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : !vehicles?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore de véhicules enregistrés
              </p>
              <Link href="/provider/vehicles/add">
                <Button data-testid="button-add-first">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter votre premier véhicule
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} data-testid={`vehicle-${vehicle.id}`}>
                {vehicle.imageUrl && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={vehicle.imageUrl}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{vehicle.brand} {vehicle.model}</CardTitle>
                      <CardDescription>{vehicle.type}</CardDescription>
                    </div>
                    <Badge variant={vehicle.isAvailable ? "default" : "secondary"}>
                      {vehicle.isAvailable ? "Disponible" : "Indisponible"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacité</span>
                    <span className="font-medium">{vehicle.capacity} passagers</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bagages</span>
                    <span className="font-medium">{vehicle.luggage} valises</span>
                  </div>
                  {vehicle.licensePlate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Matricule</span>
                      <span className="font-medium">{vehicle.licensePlate}</span>
                    </div>
                  )}
                  {vehicle.driver && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Chauffeur</span>
                      <span className="font-medium">{vehicle.driver}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <div className="text-2xl font-bold text-primary">
                      {vehicle.basePrice} TND
                    </div>
                    <p className="text-xs text-muted-foreground">Prix de base</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
