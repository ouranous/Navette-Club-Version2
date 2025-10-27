import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Users, 
  MapPin, 
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Euro,
  TrendingUp,
  Map
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleMap from "@/components/GoogleMap";
import TourBookingForm from "@/components/TourBookingForm";
import type { CityTour, TourStop } from "@shared/schema";

export default function TourDetailPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const slug = params.slug as string;

  const { data: tour, isLoading: tourLoading } = useQuery<CityTour>({
    queryKey: ["/api/tours/slug", slug],
  });

  const { data: stops = [], isLoading: stopsLoading } = useQuery<TourStop[]>({
    queryKey: ["/api/tours", tour?.id, "stops"],
    enabled: !!tour?.id,
  });

  if (tourLoading || stopsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement du tour...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-lg mb-4">Tour non trouvé</p>
              <Button onClick={() => navigate("/")} data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const difficultyColors = {
    easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const difficultyLabels = {
    easy: "Facile",
    medium: "Modéré",
    hard: "Difficile",
  };

  const mapLocations = stops.length > 0 
    ? stops
        .filter(stop => stop.latitude && stop.longitude)
        .map((stop, index) => ({
          id: stop.id,
          position: {
            lat: parseFloat(stop.latitude || "0"),
            lng: parseFloat(stop.longitude || "0"),
          },
          title: stop.name,
          description: stop.description || undefined,
          type: "poi" as const,
        }))
    : tour.latitude && tour.longitude
    ? [{
        id: tour.id,
        position: {
          lat: parseFloat(tour.latitude),
          lng: parseFloat(tour.longitude),
        },
        title: tour.name,
        description: tour.description,
        type: "tour" as const,
      }]
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section with Image */}
        {tour.imageUrl && (
          <div className="relative h-64 md:h-96 w-full overflow-hidden">
            <img 
              src={tour.imageUrl} 
              alt={tour.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
              <div className="container mx-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/")}
                  className="mb-4 text-white hover:bg-white/20"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{tour.name}</h1>
                <div className="flex flex-wrap gap-2">
                  <Badge className={difficultyColors[tour.difficulty as keyof typeof difficultyColors]}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {difficultyLabels[tour.difficulty as keyof typeof difficultyLabels]}
                  </Badge>
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    {tour.duration}h
                  </Badge>
                  <Badge variant="secondary">
                    <Users className="w-3 h-3 mr-1" />
                    Max {tour.maxCapacity} pers.
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card data-testid="card-description">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{tour.description}</p>
                  {tour.fullDescription && (
                    <div className="pt-4 border-t">
                      <p className="leading-relaxed whitespace-pre-line">{tour.fullDescription}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Itinerary */}
              {stops.length > 0 && (
                <Card data-testid="card-itinerary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="w-5 h-5" />
                      Itinéraire Détaillé
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {stops.map((stop, index) => (
                        <div key={stop.id} className="flex gap-4" data-testid={`stop-${stop.id}`}>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                              {index + 1}
                            </div>
                            {index < stops.length - 1 && (
                              <div className="w-0.5 h-full bg-border mt-2 flex-1 min-h-[40px]" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <h3 className="font-semibold text-lg mb-1">{stop.name}</h3>
                            {stop.activity && (
                              <Badge variant="outline" className="mb-2">
                                {stop.activity}
                              </Badge>
                            )}
                            {stop.description && (
                              <p className="text-muted-foreground text-sm mb-2">{stop.description}</p>
                            )}
                            {stop.duration && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {stop.duration} minutes
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Included / Excluded */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tour.included && tour.included.length > 0 && (
                  <Card data-testid="card-included">
                    <CardHeader>
                      <CardTitle className="text-lg">Inclus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tour.included.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {tour.excluded && tour.excluded.length > 0 && (
                  <Card data-testid="card-excluded">
                    <CardHeader>
                      <CardTitle className="text-lg">Non inclus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tour.excluded.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Map */}
              {mapLocations.length > 0 && (
                <Card data-testid="card-tour-map">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Carte du parcours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GoogleMap locations={mapLocations} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* Price Card */}
                <Card data-testid="card-pricing">
                  <CardHeader>
                    <CardTitle>Tarifs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-muted-foreground">Adulte</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{tour.price}</span>
                        <Euro className="w-5 h-5" />
                      </div>
                    </div>
                    {tour.priceChild && (
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted-foreground">Enfant</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">{tour.priceChild}</span>
                          <Euro className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                    <Separator />
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{tour.meetingPoint}</span>
                      </div>
                      {tour.meetingTime && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Départ à {tour.meetingTime}</span>
                        </div>
                      )}
                      {tour.minParticipants && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Minimum {tour.minParticipants} participants</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Form */}
                <TourBookingForm tour={tour} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
