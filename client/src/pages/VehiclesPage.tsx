import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Package, Star, ChevronRight } from "lucide-react";
import type { Vehicle } from "@shared/schema";
import Header from "@/components/Header";

const VEHICLE_TYPE_OPTIONS = [
  { value: "economy", label: "Economy" },
  { value: "comfort", label: "Confort" },
  { value: "business", label: "Business" },
  { value: "premium", label: "Premium" },
  { value: "vip", label: "VIP" },
  { value: "suv", label: "SUV" },
  { value: "van", label: "Van" },
  { value: "minibus", label: "Minibus" },
] as const;

export default function VehiclesPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const filteredVehicles = selectedType
    ? vehicles?.filter((v) => v.type === selectedType)
    : vehicles;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-page-title">
              Notre Flotte de Véhicules
            </h1>
            <p className="text-lg text-muted-foreground" data-testid="text-page-description">
              Sélectionnez le véhicule idéal pour vos transferts et mises à disposition
            </p>
          </div>

          {/* Type Filters */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">
              Filtrer par type
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(null)}
                data-testid="button-filter-all"
                className="hover-elevate"
              >
                Tous les véhicules
              </Button>
              {VEHICLE_TYPE_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={selectedType === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(value)}
                  data-testid={`button-filter-${value}`}
                  className="hover-elevate"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Vehicles Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse" data-testid={`skeleton-vehicle-${i}`}>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-muted rounded mb-4" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredVehicles && filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className="overflow-hidden hover-elevate transition-all duration-300"
                  data-testid={`card-vehicle-${vehicle.id}`}
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl" data-testid={`text-vehicle-name-${vehicle.id}`}>
                        {vehicle.name || `${vehicle.brand} ${vehicle.model}`}
                      </CardTitle>
                      {vehicle.isAvailable && (
                        <Badge variant="default" className="shrink-0" data-testid={`badge-available-${vehicle.id}`}>
                          Disponible
                        </Badge>
                      )}
                    </div>
                    <CardDescription data-testid={`text-vehicle-type-${vehicle.id}`}>
                      {VEHICLE_TYPE_OPTIONS.find(opt => opt.value === vehicle.type)?.label || vehicle.type}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Vehicle Image */}
                    {vehicle.imageUrl ? (
                      <div className="aspect-video rounded-md overflow-hidden bg-muted">
                        <img
                          src={vehicle.imageUrl}
                          alt={vehicle.name || `${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                          data-testid={`img-vehicle-${vehicle.id}`}
                        />
                      </div>
                    ) : (
                      <div
                        className="aspect-video rounded-md bg-muted flex items-center justify-center"
                        data-testid={`placeholder-vehicle-${vehicle.id}`}
                      >
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}

                    {/* Vehicle Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span data-testid={`text-capacity-${vehicle.id}`}>
                          Capacité: {vehicle.capacity} passagers
                        </span>
                      </div>

                      {vehicle.features && vehicle.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {vehicle.features.slice(0, 3).map((feature: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                              data-testid={`badge-feature-${vehicle.id}-${idx}`}
                            >
                              {feature}
                            </Badge>
                          ))}
                          {vehicle.features.length > 3 && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              data-testid={`badge-more-features-${vehicle.id}`}
                            >
                              +{vehicle.features.length - 3} plus
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Link href={`/vehicles/${vehicle.id}`}>
                      <Button
                        variant="default"
                        className="w-full group"
                        data-testid={`button-view-vehicle-${vehicle.id}`}
                      >
                        Voir les détails
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center" data-testid="card-no-vehicles">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucun véhicule trouvé
              </h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos filtres pour voir plus de véhicules.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
