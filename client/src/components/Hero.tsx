import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Star, Shield, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { HomePageContent } from "@shared/schema";

export default function Hero() {
  // Fetch hero image from database
  const { data: allContent = [] } = useQuery<HomePageContent[]>({
    queryKey: ["/api/homepage-content"],
  });

  const heroImage = allContent.find((item) => item.type === "hero_image" && item.isActive);
  const defaultHeroImage = "https://images.unsplash.com/photo-1601116933440-a35bc48e6f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80";

  const handleBookTransfer = () => {
    // Scroll to transfer booking section
    const transferSection = document.getElementById("transfer-booking");
    if (transferSection) {
      transferSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExploreTours = () => {
    // Scroll to city tours section
    const toursSection = document.getElementById("city-tours");
    if (toursSection) {
      toursSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url(${heroImage?.imageUrl || defaultHeroImage})`
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Transferts Premium &{" "}
                <span className="text-primary">City Tours</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Découvrez nos services de transfert haut de gamme et nos visites guidées exclusives. 
                Confort, sécurité et expériences inoubliables garantis.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>100% Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span>4.9/5 Étoiles</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>24h/24 7j/7</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={handleBookTransfer}
                className="group"
                data-testid="button-book-transfer"
              >
                Réserver un Transfert
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleExploreTours}
                className="backdrop-blur-sm"
                data-testid="button-explore-tours"
              >
                Explorer nos Tours
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-6">
            <Card className="p-6 backdrop-blur-sm bg-card/90 border-card-border hover-elevate" data-testid="card-feature-1">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">Meilleur Prix Garanti</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nous remboursons la différence si vous trouvez moins cher ailleurs
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 backdrop-blur-sm bg-card/90 border-card-border hover-elevate" data-testid="card-feature-2">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">Temps d'Attente Gratuit</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    60 minutes gratuites aux aéroports, 15 minutes ailleurs
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 backdrop-blur-sm bg-card/90 border-card-border hover-elevate" data-testid="card-feature-3">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">Pas de Frais Cachés</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Taxes, péages et pourboires inclus dans le prix
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
