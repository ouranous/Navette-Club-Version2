import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, ArrowRight, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { CityTour } from "@shared/schema";

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

export default function TunisiaHighlights() {
  const [, navigate] = useLocation();

  const { data: featuredTours = [], isLoading } = useQuery<CityTour[]>({
    queryKey: ["/api/tours", { featured: true, active: true }],
    queryFn: async () => {
      const res = await fetch("/api/tours?featured=true&active=true");
      if (!res.ok) throw new Error("Failed to fetch featured tours");
      return res.json();
    },
  });

  const handleBookTour = (slug: string) => {
    navigate(`/tours/${slug}`);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des circuits...</p>
          </div>
        </div>
      </section>
    );
  }

  if (featuredTours.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30" id="tunisia-highlights">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-8 w-8 text-primary" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Circuits Incontournables de Tunisie
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Des expériences authentiques à travers les trésors cachés et les sites emblématiques de la Tunisie
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTours.map((tour) => (
            <Card 
              key={tour.id} 
              className="hover-elevate overflow-hidden flex flex-col"
              data-testid={`card-highlight-${tour.id}`}
            >
              <div className="relative h-48 overflow-hidden">
                {tour.imageUrl ? (
                  <img
                    src={tour.imageUrl}
                    alt={tour.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge className={getDifficultyColor(tour.difficulty)}>
                    {getDifficultyLabel(tour.difficulty)}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl">{tour.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{tour.duration}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{tour.maxCapacity} max</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">
                  {tour.description}
                </p>

                {tour.highlights && tour.highlights.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">Points forts:</p>
                      <div className="flex flex-wrap gap-1">
                        {tour.highlights.map((item, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {parseFloat(tour.price || "0").toFixed(0)}€
                  </span>
                  <span className="text-xs text-muted-foreground">
                    par personne
                  </span>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full group" 
                  variant="outline"
                  onClick={() => handleBookTour(tour.slug)}
                  data-testid={`button-details-${tour.id}`}
                >
                  Plus de détails
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Tous nos circuits sont personnalisables selon vos préférences
          </p>
          <Button size="lg" data-testid="button-contact-circuits">
            <MapPin className="mr-2 h-4 w-4" />
            Demander un devis personnalisé
          </Button>
        </div>
      </div>
    </section>
  );
}
