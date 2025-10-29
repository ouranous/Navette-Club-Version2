import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Filter,
  Globe,
  Sparkles,
  Mountain,
  UtensilsCrossed,
  Landmark
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleMap from "@/components/GoogleMap";
import type { CityTour } from "@shared/schema";

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "moderate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "difficult": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "easy": return "Facile";
    case "moderate": return "Modéré";
    case "difficult": return "Difficile";
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

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "cultural": return Landmark;
    case "gastronomic": return UtensilsCrossed;
    case "adventure": return Mountain;
    case "historical": return Clock;
    case "nature": return Sparkles;
    default: return Globe;
  }
};

const formatDuration = (hours: number) => {
  if (hours === 4) return "Demi journée";
  if (hours >= 24 && hours % 24 === 0) {
    const days = hours / 24;
    return `${days} jour${days > 1 ? 's' : ''}`;
  }
  return `${hours}h`;
};

const parseHighlight = (highlight: string) => {
  if (highlight.includes("::")) {
    const [, text] = highlight.split("::");
    return text;
  }
  return highlight;
};

export default function CityToursPage() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const { data: tours = [], isLoading } = useQuery<CityTour[]>({
    queryKey: ["/api/tours?active=true"],
  });

  const filteredTours = tours.filter(tour => {
    if (selectedCategory !== "all" && tour.category !== selectedCategory) return false;
    if (selectedDifficulty !== "all" && tour.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const tourLocations = filteredTours
    .filter(tour => tour.latitude && tour.longitude)
    .map(tour => ({
      id: tour.id,
      position: { lat: parseFloat(tour.latitude!), lng: parseFloat(tour.longitude!) },
      title: tour.name,
      description: tour.description,
      type: "tour" as const,
      price: parseFloat(tour.price || "0"),
    }));

  const categories = [
    { value: "all", label: "Tous", icon: Globe },
    { value: "cultural", label: "Culturel", icon: Landmark },
    { value: "gastronomic", label: "Gastronomique", icon: UtensilsCrossed },
    { value: "adventure", label: "Aventure", icon: Mountain },
    { value: "historical", label: "Historique", icon: Clock },
    { value: "nature", label: "Nature", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Globe className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Découvrez la Tunisie Autrement</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
              City Tours d'Exception
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explorez les trésors cachés et les sites emblématiques de la Tunisie avec nos guides experts. 
              Des expériences authentiques et inoubliables vous attendent.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border">
                <Star className="w-5 h-5 text-yellow-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold">4.9/5</p>
                  <p className="text-xs text-muted-foreground">+500 avis</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border">
                <Users className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-semibold">+2,000</p>
                  <p className="text-xs text-muted-foreground">Voyageurs satisfaits</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border">
                <MapPin className="w-5 h-5 text-green-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold">{tours.length}+</p>
                  <p className="text-xs text-muted-foreground">Destinations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Filtrer par catégorie</h2>
          </div>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <TabsTrigger
                    key={category.value}
                    value={category.value}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    data-testid={`filter-category-${category.value}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 mt-6 mb-4">
            <h2 className="text-lg font-semibold">Difficulté</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {["all", "easy", "moderate", "difficult"].map(difficulty => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(difficulty)}
                data-testid={`filter-difficulty-${difficulty}`}
              >
                {difficulty === "all" ? "Tous" : getDifficultyLabel(difficulty)}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      {tourLocations.length > 0 && (
        <section className="py-8 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  zoom={7}
                  locations={tourLocations}
                  height="500px"
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Tours Grid Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                {filteredTours.length} Tour{filteredTours.length > 1 ? 's' : ''} Disponible{filteredTours.length > 1 ? 's' : ''}
              </h2>
              <p className="text-muted-foreground mt-2">
                Trouvez l'expérience parfaite pour votre aventure tunisienne
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement des tours...</p>
            </div>
          ) : filteredTours.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  Aucun tour disponible pour ces critères de recherche.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedDifficulty("all");
                  }}
                  data-testid="button-reset-filters"
                >
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map((tour) => {
                const CategoryIcon = getCategoryIcon(tour.category);
                
                return (
                  <Card 
                    key={tour.id} 
                    className="overflow-hidden hover-elevate transition-all duration-300 flex flex-col"
                    data-testid={`card-tour-${tour.id}`}
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      {tour.imageUrl ? (
                        <img 
                          src={tour.imageUrl} 
                          alt={tour.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <MapPin className="w-16 h-16 text-muted-foreground opacity-30" />
                        </div>
                      )}
                      
                      {/* Badges overlay */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2">
                        <Badge className={getDifficultyColor(tour.difficulty)}>
                          {getDifficultyLabel(tour.difficulty)}
                        </Badge>
                        {tour.featured && (
                          <Badge className="bg-primary">
                            <Star className="h-3 w-3 mr-1" />
                            À la une
                          </Badge>
                        )}
                      </div>

                      {/* Price overlay */}
                      <div className="absolute bottom-3 right-3">
                        <Badge className="bg-background/95 text-foreground backdrop-blur-sm text-lg px-3 py-2">
                          {parseFloat(tour.price || "0").toFixed(0)}€
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardHeader className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon className="w-4 h-4 text-primary" />
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(tour.category)}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-xl line-clamp-2">
                        {tour.name}
                      </CardTitle>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {tour.description}
                      </p>

                      {/* Tour Info */}
                      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDuration(tour.duration)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>Max {tour.maxCapacity}</span>
                        </div>
                      </div>

                      {/* Highlights */}
                      {tour.highlights && tour.highlights.length > 0 && (
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-1">
                            {tour.highlights.slice(0, 2).map((item, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs"
                              >
                                {parseHighlight(item)}
                              </Badge>
                            ))}
                            {tour.highlights.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{tour.highlights.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardHeader>

                    {/* Footer */}
                    <CardFooter className="pt-0">
                      <Button 
                        className="w-full group"
                        onClick={() => navigate(`/tours/${tour.slug}`)}
                        data-testid={`button-details-${tour.id}`}
                      >
                        Voir les détails
                        <MapPin className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'un Tour Personnalisé ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Nos experts sont à votre disposition pour créer un itinéraire sur mesure 
            qui correspond parfaitement à vos envies et votre budget.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" data-testid="button-custom-tour">
              <MapPin className="mr-2 h-5 w-5" />
              Demander un Devis Personnalisé
            </Button>
            <Button size="lg" variant="outline" data-testid="button-contact">
              Contactez-nous
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
