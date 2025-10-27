import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, MapPin, Globe } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import GoogleMap from "./GoogleMap";
import type { CityTour } from "@shared/schema";

export default function CityTours() {
  const [selectedTour, setSelectedTour] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const { data: tours = [], isLoading } = useQuery<CityTour[]>({
    queryKey: ["/api/tours", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/tours?active=true");
      if (!res.ok) throw new Error("Failed to fetch tours");
      return res.json();
    },
  });

  const handleBookTour = (slug: string) => {
    navigate(`/tours/${slug}`);
  };

  // Convert tours to map locations
  const tourLocations = tours
    .filter(tour => tour.latitude && tour.longitude)
    .map(tour => ({
      id: tour.id,
      position: { lat: parseFloat(tour.latitude!), lng: parseFloat(tour.longitude!) },
      title: tour.name,
      description: tour.description,
      type: "tour" as const,
      price: parseFloat(tour.price || "0"),
    }));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Facile";
      case "medium": return "Modéré";
      case "hard": return "Difficile";
      default: return difficulty;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "cultural": return "Culturel";
      case "gastronomic": return "Gastronomique";
      case "adventure": return "Aventure";
      case "historical": return "Historique";
      case "nature": return "Nature";
      default: return category;
    }
  };

  if (isLoading) {
    return (
      <section id="city-tours" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">Chargement des tours...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="city-tours" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="h-8 w-8 text-primary" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              City Tours Exclusifs
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Découvrez la Tunisie autrement avec nos guides experts. Expériences authentiques et inoubliables garanties.
          </p>
        </div>

        {tourLocations.length > 0 && (
          <div className="mb-12">
            <Card className="overflow-hidden" data-testid="card-tours-map">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Localisation de nos Tours
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur un marqueur pour voir les détails du tour
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <GoogleMap 
                  center={{ lat: 36.8065, lng: 10.1815 }}
                  zoom={8}
                  locations={tourLocations}
                  height="400px"
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {tours.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Aucun tour disponible pour le moment. Utilisez l'interface admin pour en ajouter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <Card 
                key={tour.id} 
                className="overflow-hidden hover-elevate transition-all duration-300"
                data-testid={`card-tour-${tour.id}`}
              >
                <div className="relative">
                  <img 
                    src={tour.imageUrl || "https://images.unsplash.com/photo-1502602898536-47ad22581b52?auto=format&fit=crop&w=800&q=80"} 
                    alt={tour.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge 
                    className={`absolute top-3 left-3 ${getDifficultyColor(tour.difficulty)}`}
                    data-testid={`badge-difficulty-${tour.id}`}
                  >
                    {getDifficultyLabel(tour.difficulty)}
                  </Badge>
                  <Badge 
                    className="absolute top-3 right-3 bg-background/90 text-foreground"
                    data-testid={`badge-price-${tour.id}`}
                  >
                    {tour.price}€
                  </Badge>
                  {tour.featured && (
                    <Badge className="absolute top-3 right-20 bg-primary">
                      <Star className="h-3 w-3 mr-1" />
                      À la une
                    </Badge>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl mb-2">{tour.name}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {getCategoryLabel(tour.category)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{tour.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{tour.duration}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Max {tour.maxCapacity}</span>
                    </div>
                  </div>

                  {tour.included && tour.included.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Inclus</div>
                      <div className="flex flex-wrap gap-1">
                        {tour.included.slice(0, 3).map((item, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs"
                            data-testid={`badge-included-${tour.id}-${index}`}
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => handleBookTour(tour.slug)}
                    data-testid={`button-book-${tour.id}`}
                  >
                    Voir les détails
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
