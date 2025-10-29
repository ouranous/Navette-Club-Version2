import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TransferSearchPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    date: "",
    time: "",
    passengers: "1",
    returnDate: "",
    returnTime: "",
  });
  const [tripType, setTripType] = useState<"oneway" | "return">("oneway");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    // Validation
    if (!formData.origin || !formData.destination || !formData.date || !formData.time) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (tripType === "return" && (!formData.returnDate || !formData.returnTime)) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir la date et l'heure de retour",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    // Naviguer vers la page de résultats avec les paramètres
    const params = new URLSearchParams({
      origin: formData.origin,
      destination: formData.destination,
      date: formData.date,
      time: formData.time,
      passengers: formData.passengers,
      tripType,
    });

    if (tripType === "return") {
      params.append("returnDate", formData.returnDate);
      params.append("returnTime", formData.returnTime);
    }

    setLocation(`/book/transfer/vehicles?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Réservez Votre Transfer
            </h1>
            <p className="text-lg text-muted-foreground">
              Service de transfer premium en Tunisie
            </p>
          </div>

          {/* Search Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Rechercher un Transfer
              </CardTitle>
              <CardDescription>
                Entrez vos informations de voyage pour voir les véhicules disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trip Type Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <Button
                  data-testid="button-oneway"
                  type="button"
                  variant={tripType === "oneway" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => setTripType("oneway")}
                >
                  Aller simple
                </Button>
                <Button
                  data-testid="button-return"
                  type="button"
                  variant={tripType === "return" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => setTripType("return")}
                >
                  Aller-retour
                </Button>
              </div>

              {/* Origin and Destination */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Point de départ *</Label>
                  <Input
                    id="origin"
                    data-testid="input-origin"
                    placeholder="Ex: Aéroport Tunis-Carthage"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <Input
                    id="destination"
                    data-testid="input-destination"
                    placeholder="Ex: Hôtel Gammarth"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  />
                </div>
              </div>

              {/* Outbound Date and Time */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Aller</Label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      data-testid="input-date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Heure *</Label>
                    <Input
                      id="time"
                      data-testid="input-time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passengers">Passagers</Label>
                    <Input
                      id="passengers"
                      data-testid="input-passengers"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.passengers}
                      onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Return Date and Time (if return trip) */}
              {tripType === "return" && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Retour</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="returnDate">Date de retour *</Label>
                      <Input
                        id="returnDate"
                        data-testid="input-return-date"
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                        min={formData.date || new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="returnTime">Heure de retour *</Label>
                      <Input
                        id="returnTime"
                        data-testid="input-return-time"
                        type="time"
                        value={formData.returnTime}
                        onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Search Button */}
              <Button
                data-testid="button-search"
                className="w-full"
                size="lg"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? "Recherche en cours..." : "Rechercher les véhicules"}
              </Button>
            </CardContent>
          </Card>

          {/* Popular Routes */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Trajets Populaires</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { from: "Aéroport Tunis-Carthage", to: "Hammamet", price: "30.95" },
                { from: "Aéroport Tunis-Carthage", to: "Tunis Centre", price: "16.53" },
                { from: "Aéroport Tunis-Carthage", to: "Sousse", price: "49.21" },
                { from: "Aéroport Enfidha", to: "Hammamet", price: "27.63" },
              ].map((route, index) => (
                <Card
                  key={index}
                  className="hover-elevate cursor-pointer"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      origin: route.from,
                      destination: route.to,
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  data-testid={`card-popular-route-${index}`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{route.from}</p>
                        <p className="text-sm text-muted-foreground">→ {route.to}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">À partir de</p>
                        <p className="text-xl font-bold text-primary">{route.price} €</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
