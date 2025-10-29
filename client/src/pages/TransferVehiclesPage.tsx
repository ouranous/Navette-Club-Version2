import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Luggage, Check, MapPin, Clock, ArrowLeft } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres manquants</CardTitle>
            <CardDescription>
              Veuillez utiliser le formulaire de recherche pour trouver des véhicules
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/book/transfer")}>
              Retour à la recherche
            </Button>
          </CardFooter>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            data-testid="button-back"
            variant="ghost"
            onClick={() => setLocation("/book/transfer")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Modifier la recherche
          </Button>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Trajet</p>
                    <p className="font-semibold">{origin}</p>
                    <p className="text-sm">→ {destination}</p>
                  </div>
                </div>
                {searchResponse && (
                  <>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Distance & Durée</p>
                        <p className="font-semibold">{searchResponse.distance.distanceText}</p>
                        <p className="text-sm">{searchResponse.distance.durationText}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Passagers</p>
                        <p className="font-semibold">{passengers} personne(s)</p>
                        <p className="text-sm">
                          {tripType === "return" ? "Aller-retour" : "Aller simple"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Véhicules Disponibles {searchResponse && `(${searchResponse.vehicles.length})`}
          </h2>

          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-40 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchResponse && searchResponse.vehicles.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Aucun véhicule disponible</CardTitle>
                <CardDescription>
                  Aucun véhicule ne correspond à vos critères de recherche
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {searchResponse && searchResponse.vehicles.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResponse.vehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className="hover-elevate"
                  data-testid={`card-vehicle-${vehicle.id}`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {vehicle.brand} {vehicle.model}
                        </CardTitle>
                        <CardDescription>
                          {VEHICLE_TYPE_LABELS[vehicle.type] || vehicle.type}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {vehicle.calculatedPrice.toFixed(2)} TND
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Image */}
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      {vehicle.imageUrl ? (
                        <img
                          src={vehicle.imageUrl}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          Pas d'image
                        </div>
                      )}
                    </div>

                    {/* Capacity Info */}
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{vehicle.capacity} pers.</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Luggage className="w-4 h-4 text-muted-foreground" />
                        <span>{vehicle.luggage} bag.</span>
                      </div>
                    </div>

                    {/* Features */}
                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {vehicle.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Prix de base: {vehicle.priceBreakdown.basePrice.toFixed(2)} TND</p>
                      <p>
                        {vehicle.priceBreakdown.distance.toFixed(2)} km × {vehicle.priceBreakdown.pricePerKm.toFixed(2)} TND/km
                      </p>
                      {tripType === "return" && (
                        <p className="font-semibold text-primary">
                          × 2 (aller-retour) = {(vehicle.calculatedPrice * 2).toFixed(2)} TND
                        </p>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      data-testid={`button-select-${vehicle.id}`}
                      className="w-full"
                      onClick={() => handleSelectVehicle(vehicle)}
                    >
                      Réserver ce véhicule
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
