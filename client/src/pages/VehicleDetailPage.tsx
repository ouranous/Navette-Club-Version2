import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, Package, MapPin, Clock, ArrowRight, ChevronLeft, Calculator, Calendar 
} from "lucide-react";
import type { Vehicle } from "@shared/schema";
import Header from "@/components/Header";

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  economy: "Economy",
  comfort: "Confort",
  business: "Business",
  premium: "Premium",
  vip: "VIP",
  suv: "SUV",
  van: "Van",
  minibus: "Minibus",
};

interface PriceEstimate {
  basePrice: number;
  distance?: number;
  duration?: number;
  totalPrice: number;
  season?: string;
  validFrom?: string;
  validTo?: string;
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  // Transfer calculator state
  const [transferOrigin, setTransferOrigin] = useState("");
  const [transferDestination, setTransferDestination] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [transferDistance, setTransferDistance] = useState("");
  const [transferPrice, setTransferPrice] = useState<PriceEstimate | null>(null);

  // Disposal calculator state
  const [disposalDate, setDisposalDate] = useState("");
  const [disposalDuration, setDisposalDuration] = useState("");
  const [disposalPrice, setDisposalPrice] = useState<PriceEstimate | null>(null);

  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", id],
    queryFn: async () => {
      const response = await fetch(`/api/vehicles/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle");
      }
      return response.json();
    },
    enabled: !!id,
  });

  const handleCalculateTransfer = async () => {
    if (!vehicle || !transferDistance || !transferDate) return;

    try {
      const response = await fetch(
        `/api/pricing/transfer?vehicleId=${vehicle.id}&distance=${transferDistance}&date=${transferDate}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Transfer pricing error:", errorData);
        alert(`Erreur: ${errorData.error || "Impossible de calculer le prix"}`);
        return;
      }
      
      const data = await response.json();
      setTransferPrice(data);
    } catch (error) {
      console.error("Error calculating transfer price:", error);
      alert("Une erreur s'est produite lors du calcul du prix");
    }
  };

  const handleCalculateDisposal = async () => {
    if (!vehicle || !disposalDuration || !disposalDate) return;

    try {
      const response = await fetch(
        `/api/pricing/disposal?vehicleId=${vehicle.id}&hours=${disposalDuration}&date=${disposalDate}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Disposal pricing error:", errorData);
        alert(`Erreur: ${errorData.error || "Impossible de calculer le prix"}`);
        return;
      }
      
      const data = await response.json();
      setDisposalPrice(data);
    } catch (error) {
      console.error("Error calculating disposal price:", error);
      alert("Une erreur s'est produite lors du calcul du prix");
    }
  };

  const handleBookTransfer = () => {
    // Navigate to transfer booking form with pre-filled data
    setLocation(`/book/transfer?vehicleId=${vehicle?.id}&origin=${transferOrigin}&destination=${transferDestination}&date=${transferDate}&distance=${transferDistance}`);
  };

  const handleBookDisposal = () => {
    // Navigate to disposal booking form with pre-filled data
    setLocation(`/book/disposal?vehicleId=${vehicle?.id}&date=${disposalDate}&hours=${disposalDuration}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-96 bg-muted rounded" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64 bg-muted rounded" />
                <div className="h-64 bg-muted rounded" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-12 text-center" data-testid="card-vehicle-not-found">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Véhicule introuvable
              </h3>
              <p className="text-muted-foreground mb-6">
                Le véhicule que vous recherchez n'existe pas ou a été supprimé.
              </p>
              <Button onClick={() => setLocation("/vehicles")} data-testid="button-back-to-vehicles">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Retour aux véhicules
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setLocation("/vehicles")}
            className="mb-6 hover-elevate"
            data-testid="button-back"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour aux véhicules
          </Button>

          {/* Vehicle Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="text-vehicle-name">
                  {vehicle.name || `${vehicle.brand} ${vehicle.model}`}
                </h1>
                <p className="text-lg text-muted-foreground" data-testid="text-vehicle-type">
                  {VEHICLE_TYPE_LABELS[vehicle.type] || vehicle.type}
                </p>
              </div>
              {vehicle.isAvailable && (
                <Badge variant="default" className="text-base px-4 py-2" data-testid="badge-available">
                  Disponible
                </Badge>
              )}
            </div>
          </div>

          {/* Vehicle Image */}
          {vehicle.imageUrl ? (
            <div className="aspect-video rounded-lg overflow-hidden mb-8 bg-muted">
              <img
                src={vehicle.imageUrl}
                alt={vehicle.name || `${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
                data-testid="img-vehicle"
              />
            </div>
          ) : (
            <div
              className="aspect-video rounded-lg bg-muted flex items-center justify-center mb-8"
              data-testid="placeholder-vehicle"
            >
              <Package className="h-24 w-24 text-muted-foreground" />
            </div>
          )}

          {/* Vehicle Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card data-testid="card-capacity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Capacité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="text-capacity">
                  {vehicle.capacity} passagers
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-luggage">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Bagages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="text-luggage">
                  {vehicle.luggage} bagages
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-vehicle-info">
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm" data-testid="text-brand">
                  <span className="font-medium">Marque:</span> {vehicle.brand}
                </p>
                <p className="text-sm" data-testid="text-model">
                  <span className="font-medium">Modèle:</span> {vehicle.model}
                </p>
                {vehicle.licensePlate && (
                  <p className="text-sm" data-testid="text-license">
                    <span className="font-medium">Immatriculation:</span> {vehicle.licensePlate}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {vehicle.description && (
            <Card className="mb-12" data-testid="card-description">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground" data-testid="text-description">
                  {vehicle.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <Card className="mb-12" data-testid="card-features">
              <CardHeader>
                <CardTitle>Équipements et Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      data-testid={`badge-feature-${idx}`}
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price Calculators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Transfer Calculator */}
            <Card data-testid="card-transfer-calculator">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Calculateur Transfer
                </CardTitle>
                <CardDescription>
                  Estimez le coût d'un transfert point-à-point
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transfer-origin">Point de départ</Label>
                  <Input
                    id="transfer-origin"
                    placeholder="Ex: Aéroport Tunis-Carthage"
                    value={transferOrigin}
                    onChange={(e) => setTransferOrigin(e.target.value)}
                    data-testid="input-transfer-origin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-destination">Destination</Label>
                  <Input
                    id="transfer-destination"
                    placeholder="Ex: Centre-ville Tunis"
                    value={transferDestination}
                    onChange={(e) => setTransferDestination(e.target.value)}
                    data-testid="input-transfer-destination"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-distance">Distance (km)</Label>
                  <Input
                    id="transfer-distance"
                    type="number"
                    placeholder="Ex: 15"
                    value={transferDistance}
                    onChange={(e) => setTransferDistance(e.target.value)}
                    data-testid="input-transfer-distance"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-date">Date</Label>
                  <Input
                    id="transfer-date"
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    data-testid="input-transfer-date"
                  />
                </div>

                <Button
                  onClick={handleCalculateTransfer}
                  className="w-full"
                  data-testid="button-calculate-transfer"
                  disabled={!transferDistance || !transferDate}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculer le prix
                </Button>

                {transferPrice && (
                  <Card className="bg-primary/5 border-primary/20" data-testid="card-transfer-result">
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Distance:</span>
                        <span className="font-medium" data-testid="text-transfer-distance">
                          {transferPrice.distance} km
                        </span>
                      </div>
                      {transferPrice.season && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Saison:</span>
                          <span className="font-medium" data-testid="text-transfer-season">
                            {transferPrice.season}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-lg font-semibold">Prix total:</span>
                        <span className="text-2xl font-bold text-primary" data-testid="text-transfer-price">
                          {transferPrice.totalPrice.toFixed(2)} TND
                        </span>
                      </div>
                      <Button
                        onClick={handleBookTransfer}
                        variant="default"
                        className="w-full mt-4"
                        data-testid="button-book-transfer"
                      >
                        Réserver ce transfer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Disposal (Mise à Disposition) Calculator */}
            <Card data-testid="card-disposal-calculator">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Calculateur Mise à Disposition
                </CardTitle>
                <CardDescription>
                  Estimez le coût d'une location horaire
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="disposal-date">Date</Label>
                  <Input
                    id="disposal-date"
                    type="date"
                    value={disposalDate}
                    onChange={(e) => setDisposalDate(e.target.value)}
                    data-testid="input-disposal-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disposal-duration">Durée (heures)</Label>
                  <Input
                    id="disposal-duration"
                    type="number"
                    placeholder="Ex: 4"
                    min="1"
                    value={disposalDuration}
                    onChange={(e) => setDisposalDuration(e.target.value)}
                    data-testid="input-disposal-duration"
                  />
                </div>

                <Button
                  onClick={handleCalculateDisposal}
                  className="w-full"
                  data-testid="button-calculate-disposal"
                  disabled={!disposalDuration || !disposalDate}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculer le prix
                </Button>

                {disposalPrice && (
                  <Card className="bg-primary/5 border-primary/20" data-testid="card-disposal-result">
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Durée:</span>
                        <span className="font-medium" data-testid="text-disposal-duration">
                          {disposalPrice.duration} heures
                        </span>
                      </div>
                      {disposalPrice.season && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Saison:</span>
                          <span className="font-medium" data-testid="text-disposal-season">
                            {disposalPrice.season}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-lg font-semibold">Prix total:</span>
                        <span className="text-2xl font-bold text-primary" data-testid="text-disposal-price">
                          {disposalPrice.totalPrice.toFixed(2)} TND
                        </span>
                      </div>
                      <Button
                        onClick={handleBookDisposal}
                        variant="default"
                        className="w-full mt-4"
                        data-testid="button-book-disposal"
                      >
                        Réserver cette mise à disposition
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
