import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Award, Clock, Users, Heart, Star } from "lucide-react";
import type { ContactInfo } from "@shared/schema";

export default function AboutPage() {
  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  const values = [
    {
      icon: Shield,
      title: "Sécurité",
      description: "Véhicules entretenus et chauffeurs professionnels certifiés pour votre sécurité",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Service premium et attention aux détails dans chaque trajet",
    },
    {
      icon: Clock,
      title: "Ponctualité",
      description: "Respect des horaires et disponibilité 24h/24 7j/7",
    },
    {
      icon: Users,
      title: "Professionnalisme",
      description: "Chauffeurs expérimentés et courtois à votre service",
    },
    {
      icon: Heart,
      title: "Satisfaction Client",
      description: "Votre confort et satisfaction sont notre priorité absolue",
    },
    {
      icon: Star,
      title: "Qualité",
      description: "Flotte de véhicules haut de gamme régulièrement renouvelée",
    },
  ];

  const stats = [
    { value: "10+", label: "Années d'expérience" },
    { value: "50+", label: "Véhicules premium" },
    { value: "10k+", label: "Clients satisfaits" },
    { value: "7j/7", label: "Disponibilité" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-about">
              À Propos de NavetteClub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Votre partenaire de confiance pour tous vos déplacements premium en Tunisie
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* About Text */}
          {contactInfo?.aboutText && (
            <Card className="mb-16">
              <CardContent className="pt-6">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {contactInfo.aboutText.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Nos Valeurs</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="hover-elevate transition-all">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Services Section */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-3xl font-bold mb-8 text-center">Nos Services</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Transferts Aéroport</h3>
                  <p className="text-muted-foreground mb-4">
                    Service de transfert professionnel depuis et vers tous les aéroports tunisiens. 
                    Accueil personnalisé avec pancarte nominative.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">City Tours</h3>
                  <p className="text-muted-foreground mb-4">
                    Découvrez les merveilles de la Tunisie avec nos circuits guidés sur mesure. 
                    Guides expérimentés et itinéraires personnalisables.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Déplacements Professionnels</h3>
                  <p className="text-muted-foreground mb-4">
                    Solutions de transport pour vos événements professionnels, séminaires et 
                    déplacements d'affaires.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Mise à Disposition</h3>
                  <p className="text-muted-foreground mb-4">
                    Véhicule avec chauffeur à votre disposition pour vos besoins personnalisés, 
                    à l'heure ou à la journée.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
