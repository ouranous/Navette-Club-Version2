import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, MapPin, Camera, Globe } from "lucide-react";
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

  // Fallback mock data if no tours in database
  const mockTours: CityTour[] = isLoading || tours.length > 0 ? [] : [
    {
      id: "paris-classic",
      title: "Paris Classique",
      description: "Découvrez les monuments emblématiques de Paris avec un guide expert",
      duration: "4h",
      maxPeople: 8,
      price: 89,
      rating: 4.9,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Tour Eiffel", "Arc de Triomphe", "Champs-Élysées", "Notre-Dame"],
      difficulty: "Facile"
    },
    {
      id: "paris-gourmet",
      title: "Paris Gourmand",
      description: "Savourez la gastronomie parisienne dans les meilleurs établissements",
      duration: "6h",
      maxPeople: 6,
      price: 149,
      rating: 4.8,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1541833406-872de9cb59e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Dégustations", "Marchés locaux", "Fromages", "Vins français"],
      difficulty: "Facile"
    },
    {
      id: "paris-secret",
      title: "Paris Insolite",
      description: "Explorez les quartiers cachés et les secrets de la capitale",
      duration: "5h",
      maxPeople: 10,
      price: 119,
      rating: 4.7,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1549144511-f099e773c147?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Passages couverts", "Street art", "Cours cachées", "Anecdotes"],
      difficulty: "Modéré"
    },
    {
      id: "versailles-day",
      title: "Château de Versailles",
      description: "Visite guidée complète du château et de ses jardins magnifiques",
      duration: "8h",
      maxPeople: 12,
      price: 179,
      rating: 4.9,
      reviews: 312,
      image: "https://images.unsplash.com/photo-1568651086153-b2b8f9b8e9f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Château", "Jardins", "Galerie des Glaces", "Trianon"],
      difficulty: "Modéré"
    },
    {
      id: "montmartre-night",
      title: "Montmartre by Night",
      description: "Découvrez la bohème parisienne sous les lumières nocturnes",
      duration: "3h",
      maxPeople: 8,
      price: 69,
      rating: 4.6,
      reviews: 98,
      image: "https://images.unsplash.com/photo-1571211905393-bb4b2cdd8f60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Sacré-Cœur", "Place du Tertre", "Moulin Rouge", "Cabarets"],
      difficulty: "Facile"
    },
    {
      id: "loire-castles",
      title: "Châteaux de la Loire",
      description: "Excursion d'une journée à travers les plus beaux châteaux",
      duration: "12h",
      maxPeople: 15,
      price: 249,
      rating: 4.8,
      reviews: 167,
      image: "https://images.unsplash.com/photo-1548627509-159ad0b0eb33?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Chambord", "Chenonceau", "Déjeuner inclus", "Transport"],
      difficulty: "Facile"
    }
  ];

  const handleBookTour = (tourId: string) => {
    console.log('Book tour clicked:', tourId);
    setSelectedTour(tourId);
    // todo: remove mock functionality
  };

  // Emplacements des tours pour la carte // todo: remove mock functionality
  const tourLocations = [
    {
      id: "paris-classic",
      position: { lat: 48.8584, lng: 2.2945 },
      title: "Paris Classique",
      description: "Monuments emblématiques de Paris",
      type: "tour" as const,
      rating: 4.9,
      price: 89
    },
    {
      id: "paris-gourmet",
      position: { lat: 48.8566, lng: 2.3522 },
      title: "Paris Gourmand",
      description: "Gastronomie parisienne",
      type: "tour" as const,
      rating: 4.8,
      price: 149
    },
    {
      id: "paris-secret",
      position: { lat: 48.8534, lng: 2.3488 },
      title: "Paris Insolite",
      description: "Quartiers cachés et secrets",
      type: "tour" as const,
      rating: 4.7,
      price: 119
    },
    {
      id: "versailles-day",
      position: { lat: 48.8049, lng: 2.1204 },
      title: "Château de Versailles",
      description: "Visite complète du château",
      type: "tour" as const,
      rating: 4.9,
      price: 179
    },
    {
      id: "montmartre-night",
      position: { lat: 48.8867, lng: 2.3431 },
      title: "Montmartre by Night",
      description: "Bohème parisienne nocturne",
      type: "tour" as const,
      rating: 4.6,
      price: 69
    },
    {
      id: "loire-castles",
      position: { lat: 47.4034, lng: 1.0727 },
      title: "Châteaux de la Loire",
      description: "Excursion châteaux",
      type: "tour" as const,
      rating: 4.8,
      price: 249
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Facile": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Modéré": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Difficile": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

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
            Découvrez la France autrement avec nos guides experts. Expériences authentiques et inoubliables garanties.
          </p>
        </div>

        {/* Carte interactive des tours */}
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
                center={{ lat: 48.8566, lng: 2.3522 }}
                zoom={10}
                locations={tourLocations}
                height="400px"
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <Card 
              key={tour.id} 
              className="overflow-hidden hover-elevate transition-all duration-300"
              data-testid={`card-tour-${tour.id}`}
            >
              <div className="relative">
                <img 
                  src={tour.image} 
                  alt={tour.title}
                  className="w-full h-48 object-cover"
                />
                <Badge 
                  className={`absolute top-3 left-3 ${getDifficultyColor(tour.difficulty)}`}
                  data-testid={`badge-difficulty-${tour.id}`}
                >
                  {tour.difficulty}
                </Badge>
                <Badge 
                  className="absolute top-3 right-3 bg-background/90 text-foreground"
                  data-testid={`badge-price-${tour.id}`}
                >
                  {tour.price}€
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl mb-2">{tour.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{tour.rating}</span>
                    <span className="text-xs text-muted-foreground">({tour.reviews})</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{tour.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Tour Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Max {tour.maxPeople}</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Camera className="h-4 w-4 text-primary" />
                    <span>Points forts</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tour.highlights.map((highlight, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs"
                        data-testid={`badge-highlight-${tour.id}-${index}`}
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleBookTour(tour.id)}
                  variant={selectedTour === tour.id ? "secondary" : "default"}
                  data-testid={`button-book-tour-${tour.id}`}
                >
                  {selectedTour === tour.id ? "Tour sélectionné" : "Réserver ce Tour"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Custom Tours CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-primary/5 to-accent/5" data-testid="card-custom-tours">
            <CardContent className="space-y-4">
              <MapPin className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Tour Personnalisé</h3>
              <p className="text-muted-foreground">
                Vous avez une demande spécifique ? Créons ensemble un itinéraire sur-mesure 
                adapté à vos envies et votre budget.
              </p>
              <Button size="lg" variant="outline" data-testid="button-custom-tour">
                Demander un Devis Personnalisé
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}