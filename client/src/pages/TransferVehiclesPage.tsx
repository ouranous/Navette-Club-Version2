import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Users, Luggage, MapPin, Calendar, Clock, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PriceBreakdown {
  basePrice: number;
  pricePerKm: number;
  distance: number;
  total: number;
}

interface VehicleWithPrice {
  id: string;
  brand: string;
  model: string;
  type: string;
  capacity: number;
  luggage: number;
  description: string;
  features: string[];
  imageUrl: string | null;
  calculatedPrice: number;
  priceBreakdown: PriceBreakdown;
}

interface DistanceData {
  distanceKm: number;
  distanceText: string;
  durationMinutes: number;
  durationText: string;
}

interface SearchResponse {
  distance: DistanceData;
  vehicles: VehicleWithPrice[];
  searchCriteria: {
    origin: string;
    destination: string;
    passengers: number;
  };
}

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  economy: "Économique",
  comfort: "Confort",
  business: "Business",
  premium: "Premium",
  vip: "VIP",
  suv: "SUV",
  van: "Van",
  minibus: "Minibus",
};

export default function TransferVehiclesPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
  }, [location]);

  const origin = searchParams?.get("origin") || "";
  const destination = searchParams?.get("destination") || "";
  const passengers = searchParams?.get("passengers") || "1";
  const date = searchParams?.get("date") || "";
  const time = searchParams?.get("time") || "";
  const tripType = searchParams?.get("tripType") || "oneway";
  const returnDate = searchParams?.get("returnDate") || "";
  const returnTime = searchParams?.get("returnTime") || "";

  const { data: searchResponse, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ["/api/pricing/auto-transfer", origin, destination, passengers],
    queryFn: async () => {
      const params = new URLSearchParams({
        origin,
        destination,
        passengers,
      });
      const response = await fetch(`/api/pricing/auto-transfer?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to calculate prices");
      }
      return response.json();
    },
    enabled: !!origin && !!destination,
    retry: 1,
  });

  const handleSelectVehicle = (vehicle: VehicleWithPrice) => {
    const bookingParams = new URLSearchParams({
      vehicleId: vehicle.id,
      origin,
      destination,
      date,
      time,
      passengers,
      tripType,
      distance: searchResponse!.distance.distanceKm.toString(),
      duration: searchResponse!.distance.durationMinutes.toString(),
      price: vehicle.calculatedPrice.toString(),
    });

    if (tripType === "return") {
      bookingParams.append("returnDate", returnDate);
      bookingParams.append("returnTime", returnTime);
    }

    setLocation(`/book/transfer/confirm?${bookingParams.toString()}`);
  };

  if (!origin || !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Paramètres manquants</CardTitle>
            <CardDescription>
              Veuillez utiliser le formulaire de recherche pour trouver des véhicules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/book/transfer")} className="w-full">
              Retour à la recherche
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Erreur",
      description: "Impossible de calculer les prix. Vérifiez les adresses saisies.",
      variant: "destructive",
    });
  }

  const totalPrice = tripType === "return" 
    ? (searchResponse?.vehicles[0]?.calculatedPrice || 0) * 2
    : (searchResponse?.vehicles[0]?.calculatedPrice || 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* COLONNE GAUCHE - Récapitulatif de la réservation */}
          <div className="lg:col-span-4">
            <Card className="sticky top-4 z-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Récapitulatif de la Réservation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trajet */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Trajet</p>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">{origin}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">{destination}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Type de trajet */}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Type</p>
                  <Badge variant={tripType === "return" ? "default" : "secondary"}>
                    {tripType === "return" ? "Aller-Retour" : "Aller Simple"}
                  </Badge>
                </div>

                <Separator />

                {/* Date et heure */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground">Date & Heure</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{date ? new Date(date).toLocaleDateString("fr-FR") : "-"}</span>
                    <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                    <span>{time}</span>
                  </div>
                  {tripType === "return" && returnDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Retour: {new Date(returnDate).toLocaleDateString("fr-FR")}</span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{returnTime}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Passagers */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-muted-foreground">Passagers</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{passengers}</span>
                  </div>
                </div>

                {/* Distance & Durée */}
                {searchResponse && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Distance</span>
                        <span className="font-semibold">{searchResponse.distance.distanceText}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Durée estimée</span>
                        <span className="font-semibold">{searchResponse.distance.durationText}</span>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Bouton modifier */}
                <Button
                  data-testid="button-back"
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/book/transfer")}
                >
                  Modifier la recherche
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* COLONNE DROITE - Liste des véhicules */}
          <div className="lg:col-span-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Véhicules Disponibles</h1>
              <p className="text-muted-foreground">
                {searchResponse ? `${searchResponse.vehicles.length} véhicule(s) trouvé(s)` : "Recherche en cours..."}
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Skeleton className="h-24 w-24 rounded-md" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchResponse && searchResponse.vehicles.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun véhicule disponible</h3>
                  <p className="text-muted-foreground mb-4">
                    Aucun véhicule ne correspond à vos critères de recherche
                  </p>
                  <Button onClick={() => setLocation("/book/transfer")}>
                    Modifier la recherche
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Vehicle List */}
            {searchResponse && searchResponse.vehicles.length > 0 && (
              <div className="space-y-4">
                {searchResponse.vehicles.map((vehicle) => {
                  const finalPrice = tripType === "return" 
                    ? vehicle.calculatedPrice * 2 
                    : vehicle.calculatedPrice;

                  return (
                    <Card
                      key={vehicle.id}
                      className="hover-elevate transition-all"
                      data-testid={`card-vehicle-${vehicle.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Image du véhicule */}
                          <div className="md:w-48 h-32 bg-muted rounded-md overflow-hidden flex-shrink-0">
                            {vehicle.imageUrl ? (
                              <img
                                src={vehicle.imageUrl}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Car className="w-12 h-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Informations du véhicule */}
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="text-xl font-semibold">
                                {vehicle.brand} {vehicle.model}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {VEHICLE_TYPE_LABELS[vehicle.type] || vehicle.type}
                              </p>
                            </div>

                            {/* Capacités */}
                            <div className="flex gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{vehicle.capacity} passagers</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Luggage className="w-4 h-4 text-muted-foreground" />
                                <span>{vehicle.luggage} bagages</span>
                              </div>
                            </div>

                            {/* Description courte */}
                            {vehicle.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {vehicle.description}
                              </p>
                            )}
                          </div>

                          {/* Prix et bouton */}
                          <div className="flex flex-col items-end justify-between md:w-48 gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground mb-1">À partir de</p>
                              <p className="text-3xl font-bold text-primary">
                                {finalPrice.toFixed(2)} <span className="text-lg">€</span>
                              </p>
                              {tripType === "return" && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  (Aller-retour)
                                </p>
                              )}
                            </div>
                            <Button
                              data-testid={`button-select-${vehicle.id}`}
                              className="w-full"
                              onClick={() => handleSelectVehicle(vehicle)}
                            >
                              Choisir ce véhicule
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
