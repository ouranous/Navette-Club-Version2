import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Users, Clock } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import GooglePlacesInput from "@/components/GooglePlacesInput";

export default function TransferBooking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [serviceType, setServiceType] = useState("transfer");
  const [tripType, setTripType] = useState("oneway");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [passengers, setPassengers] = useState("2");

  const handleSearch = () => {
    // Vérifier le type de service
    if (serviceType === "disposal") {
      toast({
        title: "Bientôt disponible",
        description: "Le service de mise à disposition sera bientôt disponible avec un système de tarification dédié.",
        variant: "default",
      });
      return;
    }

    // Validation
    if (!origin || !destination || !date || !time) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir l'origine, la destination, la date et l'heure",
        variant: "destructive",
      });
      return;
    }

    if (tripType === "return" && (!returnDate || !returnTime)) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir la date et l'heure de retour",
        variant: "destructive",
      });
      return;
    }

    // Navigation vers la page de recherche avec paramètres
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      time,
      passengers,
      tripType,
    });

    if (tripType === "return") {
      params.append("returnDate", returnDate);
      params.append("returnTime", returnTime);
    }

    setLocation(`/book/transfer/vehicles?${params.toString()}`);
  };

  return (
    <section id="transfers" className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Réservez Votre Transfert
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Service de transfert premium avec calcul automatique du prix. Réservez en quelques clics.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto" data-testid="card-booking-form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Recherche de Transfert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="service-type" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Type de service
              </Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger data-testid="select-service-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transfert</SelectItem>
                  <SelectItem value="disposal">Mise à disposition (Bientôt disponible)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trip Type Tabs */}
            <Tabs value={tripType} onValueChange={setTripType} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="oneway" data-testid="tab-oneway">
                  Aller Simple
                </TabsTrigger>
                <TabsTrigger value="return" data-testid="tab-return">
                  Aller-Retour
                </TabsTrigger>
              </TabsList>

              {/* Aller Simple */}
              <TabsContent value="oneway" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origine *</Label>
                    <GooglePlacesInput
                      id="origin"
                      placeholder="Ex: Aéroport Tunis Carthage"
                      value={origin}
                      onChange={setOrigin}
                      data-testid="input-origin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination *</Label>
                    <GooglePlacesInput
                      id="destination"
                      placeholder="Ex: Hammamet"
                      value={destination}
                      onChange={setDestination}
                      data-testid="input-destination"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      data-testid="input-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Heure *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      data-testid="input-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passengers" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Passagers
                    </Label>
                    <Select value={passengers} onValueChange={setPassengers}>
                      <SelectTrigger data-testid="select-passengers">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} passager{num > 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Aller-Retour */}
              <TabsContent value="return" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin-return">Origine *</Label>
                    <GooglePlacesInput
                      id="origin-return"
                      placeholder="Ex: Aéroport Tunis Carthage"
                      value={origin}
                      onChange={setOrigin}
                      data-testid="input-origin-return"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination-return">Destination *</Label>
                    <GooglePlacesInput
                      id="destination-return"
                      placeholder="Ex: Hammamet"
                      value={destination}
                      onChange={setDestination}
                      data-testid="input-destination-return"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-return">Date aller *</Label>
                    <Input
                      id="date-return"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      data-testid="input-date-return"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-return">Heure aller *</Label>
                    <Input
                      id="time-return"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      data-testid="input-time-return"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="return-date">Date retour *</Label>
                    <Input
                      id="return-date"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      data-testid="input-return-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="return-time">Heure retour *</Label>
                    <Input
                      id="return-time"
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      data-testid="input-return-time"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengers-return" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Passagers
                  </Label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger data-testid="select-passengers-return">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} passager{num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            {/* Search Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={handleSearch}
                className="w-full sm:w-auto px-12"
                data-testid="button-search-transfers"
              >
                Rechercher les véhicules disponibles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
