import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Phone, Mail, MessageCircle, FileText, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export default function HelpPage() {
  const helpCategories = [
    {
      icon: BookOpen,
      title: "Guide de Réservation",
      description: "Apprenez comment réserver facilement un transfert ou un city tour",
      link: "/faq",
    },
    {
      icon: Phone,
      title: "Support Téléphonique",
      description: "Contactez-nous directement pour une assistance immédiate",
      action: "Appeler",
      href: "tel:+21694299800",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Envoyez-nous un email, nous répondons sous 24h",
      action: "Écrire",
      href: "mailto:contact@navetteclub.com",
    },
    {
      icon: MessageCircle,
      title: "Chat en Direct",
      description: "Discutez avec notre équipe en temps réel",
      action: "Démarrer",
      comingSoon: true,
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Consultez nos guides et tutoriels détaillés",
      link: "/faq",
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      description: "Réponses aux questions les plus fréquentes",
      link: "/faq",
    },
  ];

  const quickGuides = [
    {
      title: "Comment réserver un transfert aéroport",
      steps: [
        "Indiquez votre point de départ et d'arrivée",
        "Choisissez la date et l'heure",
        "Sélectionnez votre véhicule",
        "Remplissez vos informations",
        "Confirmez et payez"
      ]
    },
    {
      title: "Comment réserver un city tour",
      steps: [
        "Parcourez nos tours disponibles",
        "Sélectionnez le tour qui vous intéresse",
        "Choisissez votre date",
        "Indiquez le nombre de participants",
        "Confirmez votre réservation"
      ]
    },
    {
      title: "Comment modifier une réservation",
      steps: [
        "Contactez-nous par téléphone ou email",
        "Fournissez votre numéro de réservation",
        "Indiquez les modifications souhaitées",
        "Recevez une confirmation par email"
      ]
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-help">
              Centre d'Aide
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nous sommes là pour vous aider. Trouvez des réponses ou contactez notre équipe
            </p>
          </div>

          {/* Help Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="hover-elevate transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col h-full">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                      <p className="text-muted-foreground mb-4 flex-1">{category.description}</p>
                      {category.comingSoon ? (
                        <Button variant="outline" disabled className="w-full">
                          Bientôt disponible
                        </Button>
                      ) : category.link ? (
                        <Link href={category.link}>
                          <Button variant="outline" className="w-full">
                            En savoir plus
                          </Button>
                        </Link>
                      ) : category.href ? (
                        <a href={category.href}>
                          <Button variant="outline" className="w-full">
                            {category.action}
                          </Button>
                        </a>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Guides */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Guides Rapides</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {quickGuides.map((guide, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">{guide.title}</h3>
                    <ol className="space-y-2">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold mr-3 flex-shrink-0">
                            {stepIndex + 1}
                          </span>
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <Card className="bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-3">Besoin d'une aide personnalisée ?</h3>
                <p className="text-muted-foreground mb-6">
                  Notre équipe d'experts est disponible 24h/24, 7j/7 pour répondre à toutes vos questions
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" data-testid="button-contact">
                    <Link href="/contact" className="flex items-center">
                      Contactez-nous
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="tel:+21694299800">
                      <Phone className="w-4 h-4 mr-2" />
                      +216 94 299 800
                    </a>
                  </Button>
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
