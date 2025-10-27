import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Luggage } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Vehicle } from "@shared/schema";

const getVehicleTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    economy: "Économie",
    comfort: "Confort",
    business: "Business",
    premium: "Premium",
    vip: "VIP",
    suv: "SUV",
    van: "Van",
    minibus: "Minibus",
  };
  return typeNames[type] || type;
};

export default function TransferBooking() {
  const [tripType, setTripType] = useState("one-way");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [passengers, setPassengers] = useState("1");

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles", { available: true }],
    queryFn: async () => {
      const res = await fetch("/api/vehicles?available=true");
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      return res.json();
    },
  });

  const handleSearch = () => {
    console.log('Search transfers clicked', { tripType, selectedVehicle, passengers });
  };

  return (
    <section id="transfers" className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Réservez Votre Transfert
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choisissez votre véhicule et réservez en quelques clics. Service premium garanti.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto" data-testid="card-booking-form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Réservation de Transfert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trip Type */}
            <Tabs value={tripType} onValueChange={setTripType} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="one-way" data-testid="tab-one-way">Aller Simple</TabsTrigger>
                <TabsTrigger value="round-trip" data-testid="tab-round-trip">Aller-Retour</TabsTrigger>
              </TabsList>

              <TabsContent value="one-way" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickup" className="text-sm font-medium">Lieu de prise en charge</Label>
                    <Input
                      id="pickup"
                      placeholder="Aéroport, hôtel, adresse..."
                      data-testid="input-pickup"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-sm font-medium">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="Aéroport, hôtel, adresse..."
                      data-testid="input-destination"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="round-trip" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickup-rt" className="text-sm font-medium">Lieu de prise en charge</Label>
                    <Input
                      id="pickup-rt"
                      placeholder="Aéroport, hôtel, adresse..."
                      data-testid="input-pickup-roundtrip"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination-rt" className="text-sm font-medium">Destination</Label>
                    <Input
                      id="destination-rt"
                      placeholder="Aéroport, hôtel, adresse..."
                      data-testid="input-destination-roundtrip"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="return-date" className="text-sm font-medium">Date de retour</Label>
                    <Input
                      id="return-date"
                      type="datetime-local"
                      data-testid="input-return-date"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Date and Passengers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup-date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date et heure
                </Label>
                <Input
                  id="pickup-date"
                  type="datetime-local"
                  data-testid="input-pickup-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passengers" className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Passagers
                </Label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger data-testid="select-passengers">
                    <SelectValue placeholder="Nombre de passagers" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} passager{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Luggage className="h-4 w-4" />
                  Service
                </Label>
                <Select>
                  <SelectTrigger data-testid="select-service">
                    <SelectValue placeholder="Type de service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transfert</SelectItem>
                    <SelectItem value="disposal">Mise à disposition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vehicle Types */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Type de véhicule</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {vehicles.map((vehicle) => (
                  <Card 
                    key={vehicle.id}
                    className={`cursor-pointer transition-all hover-elevate ${
                      selectedVehicle === vehicle.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    data-testid={`card-vehicle-${vehicle.id}`}
                  >
                    <CardContent className="p-3 text-center space-y-2">
                      {vehicle.imageUrl ? (
                        <div className="aspect-video bg-muted rounded-md overflow-hidden">
                          <img 
                            src={vehicle.imageUrl} 
                            alt={getVehicleTypeName(vehicle.type)} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">{getVehicleTypeName(vehicle.type)}</span>
                        </div>
                      )}
                      <h4 className="font-medium text-sm">{getVehicleTypeName(vehicle.type)}</h4>
                      <div className="flex justify-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {vehicle.capacity}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Luggage className="h-3 w-3 mr-1" />
                          {vehicle.luggage}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center pt-4">
              <Button 
                size="lg"
                onClick={handleSearch}
                className="w-full sm:w-auto px-8"
                data-testid="button-search-transfers"
              >
                Obtenir des Offres
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}