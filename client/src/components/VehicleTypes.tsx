import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Luggage, Star, Coffee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Vehicle } from "@shared/schema";

// Map vehicle types to localized labels
export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  economy: "Économie",
  comfort: "Confort",
  business: "Business",
  premium: "Premium",
  vip: "VIP",
  suv: "SUV",
  van: "Van",
  minibus: "Minibus",
};

// Get vehicle type slug from name (for backward compatibility with mock data)
const getVehicleTypeSlug = (name: string): string => {
  const normalized = name.toLowerCase().trim();
  // Direct match
  if (normalized in VEHICLE_TYPE_LABELS) return normalized;
  // Match by label
  for (const [slug, label] of Object.entries(VEHICLE_TYPE_LABELS)) {
    if (label.toLowerCase() === normalized) return slug;
  }
  // Fallback: try to normalize the name
  return normalized.replace(/[éè]/g, 'e').replace(/\s+/g, '');
};

export default function VehicleTypes() {
  const [, setLocation] = useLocation();
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles?homepage=true"],
  });

  // Fallback mock data if database is empty
  const mockVehicles: any[] = isLoading || vehicles.length > 0 ? [] : [
    {
      id: "economy",
      type: "economy",
      name: "Économie",
      description: "Parfait pour les trajets courts et économiques",
      passengers: 4,
      luggage: 2,
      features: ["Climatisation", "Chauffeur professionnel"],
      image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      priceFrom: 25
    },
    {
      id: "comfort",
      type: "comfort",
      name: "Confort",
      description: "L'équilibre parfait entre confort et prix",
      passengers: 4,
      luggage: 3,
      features: ["Climatisation", "Sièges cuir", "Eau gratuite"],
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      priceFrom: 35,
      popular: true
    },
    {
      id: "business",
      type: "business",
      name: "Business",
      description: "Voyagez avec style et professionnalisme",
      passengers: 4,
      luggage: 3,
      features: ["Sièges cuir", "WiFi gratuit", "Journaux", "Eau & collations"],
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      priceFrom: 55
    },
    {
      id: "premium",
      type: "premium",
      name: "Premium",
      description: "L'expérience haut de gamme pour vos déplacements",
      passengers: 4,
      luggage: 4,
      features: ["Véhicule premium", "Chauffeur en costume", "WiFi", "Refreshments", "Service personnalisé"],
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      priceFrom: 75
    },
    {
      id: "vip",
      type: "vip",
      name: "VIP",
      description: "Le summum du luxe et du service",
      passengers: 4,
      luggage: 4,
      features: ["Véhicule de luxe", "Service concierge", "Champagne", "WiFi premium", "Assistant personnel"],
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      priceFrom: 120
    },
    {
      id: "suv",
      type: "suv",
      name: "SUV",
      description: "Spacieux et confortable pour tous vos bagages",
      passengers: 7,
      luggage: 6,
      features: ["Véhicule spacieux", "Climatisation zones", "Chargeurs USB", "Espace bagages XL"],
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      priceFrom: 65
    },
    {
      id: "van",
      type: "van",
      name: "Van",
      description: "Idéal pour les groupes et familles nombreuses",
      passengers: 8,
      luggage: 8,
      features: ["Véhicule familial", "Sièges modulables", "Climatisation", "Espace optimisé"],
      image: "https://images.unsplash.com/photo-1506893374086-01b72e9e4e9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      priceFrom: 85
    },
    {
      id: "minibus",
      type: "minibus",
      name: "Minibus",
      description: "Transport de groupe confortable et sécurisé",
      passengers: 16,
      luggage: 20,
      features: ["Confort groupe", "Guide microphone", "Climatisation", "Sièges inclinables"],
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      priceFrom: 150
    }
  ];

  const handleSelectVehicle = (vehicle: any) => {
    // Get standardized vehicle type slug
    const typeSlug = vehicle.type || getVehicleTypeSlug(vehicle.name || "");
    // Rediriger vers le formulaire de réservation avec le type de véhicule pré-sélectionné
    setLocation(`/book/transfer?vehicleType=${encodeURIComponent(typeSlug)}`);
  };

  // Use real data or fallback to mock
  const displayVehicles = vehicles.length > 0 ? vehicles : mockVehicles;

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">Chargement des véhicules...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Nos Types de Véhicules
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Choisissez le véhicule parfait pour votre trajet. Du plus économique au plus luxueux, 
            tous nos véhicules sont entretenus et conduits par des chauffeurs professionnels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayVehicles.map((vehicle) => (
            <Card 
              key={vehicle.id}
              className="overflow-hidden hover-elevate transition-all duration-300 relative"
              data-testid={`card-vehicle-${vehicle.id}`}
            >
              <div className="relative">
                <img 
                  src={vehicle.imageUrl || (vehicle as any).image || "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80"} 
                  alt={vehicle.name || "Véhicule"}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{vehicle.name || "Véhicule"}</h3>
                  <p className="text-sm opacity-90">
                    À partir de {vehicle.basePrice || (vehicle as any).priceFrom || "0"}€
                  </p>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="sr-only">{vehicle.name || "Véhicule"}</CardTitle>
                <p className="text-sm text-muted-foreground">{vehicle.description || ""}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{vehicle.capacity || (vehicle as any).passengers || 0} passagers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Luggage className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{(vehicle as any).luggage || 0} bagages</span>
                  </div>
                </div>

                {vehicle.features && vehicle.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Équipements inclus</h4>
                    <div className="flex flex-wrap gap-1">
                      {vehicle.features.map((feature, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs"
                          data-testid={`badge-feature-${vehicle.id}-${index}`}
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full"
                  onClick={() => handleSelectVehicle(vehicle)}
                  data-testid={`button-select-${vehicle.id}`}
                >
                  Choisir ce véhicule
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6" data-testid="card-info-guarantee">
            <CardContent className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Qualité Garantie</h3>
              <p className="text-sm text-muted-foreground">
                Tous nos véhicules sont régulièrement entretenus et inspectés
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6" data-testid="card-info-drivers">
            <CardContent className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Chauffeurs Experts</h3>
              <p className="text-sm text-muted-foreground">
                Chauffeurs professionnels, formés et expérimentés
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6" data-testid="card-info-service">
            <CardContent className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                <Coffee className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Service Premium</h3>
              <p className="text-sm text-muted-foreground">
                Attention aux détails et service client exceptionnel
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}