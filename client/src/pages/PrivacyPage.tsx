import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Introduction",
      content: "NavetteClub respecte votre vie privée et s'engage à protéger vos données personnelles. Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos informations personnelles."
    },
    {
      title: "2. Données Collectées",
      subsections: [
        {
          subtitle: "2.1 Informations que Vous Nous Fournissez",
          text: "Nous collectons les informations que vous nous fournissez directement lors de vos réservations : nom, prénom, adresse email, numéro de téléphone, adresse de prise en charge et de destination, détails de paiement."
        },
        {
          subtitle: "2.2 Informations Collectées Automatiquement",
          text: "Lors de votre visite sur notre site, nous collectons automatiquement certaines informations : adresse IP, type de navigateur, pages visitées, durée de visite, référent."
        },
        {
          subtitle: "2.3 Cookies",
          text: "Nous utilisons des cookies pour améliorer votre expérience utilisateur, analyser le trafic de notre site et personnaliser le contenu. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur."
        }
      ]
    },
    {
      title: "3. Utilisation des Données",
      content: "Nous utilisons vos données personnelles pour : traiter vos réservations et fournir nos services, communiquer avec vous concernant vos réservations, améliorer nos services et notre site web, vous envoyer des offres promotionnelles (avec votre consentement), respecter nos obligations légales et réglementaires."
    },
    {
      title: "4. Partage des Données",
      subsections: [
        {
          subtitle: "4.1 Avec Nos Partenaires",
          text: "Nous pouvons partager vos données avec nos partenaires transporteurs et prestataires de services nécessaires à l'exécution de votre réservation."
        },
        {
          subtitle: "4.2 Avec Les Autorités",
          text: "Nous pouvons divulguer vos informations si la loi l'exige ou si nous pensons de bonne foi qu'une telle action est nécessaire."
        },
        {
          subtitle: "4.3 Pas de Vente",
          text: "Nous ne vendons jamais vos données personnelles à des tiers à des fins marketing."
        }
      ]
    },
    {
      title: "5. Protection des Données",
      content: "Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction. Cela inclut le chiffrement SSL, des serveurs sécurisés et des contrôles d'accès stricts."
    },
    {
      title: "6. Conservation des Données",
      content: "Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales. Les données de réservation sont conservées pendant 3 ans à des fins comptables et légales."
    },
    {
      title: "7. Vos Droits",
      subsections: [
        {
          subtitle: "7.1 Droit d'Accès",
          text: "Vous avez le droit d'accéder à vos données personnelles et d'en obtenir une copie."
        },
        {
          subtitle: "7.2 Droit de Rectification",
          text: "Vous pouvez demander la correction de vos données personnelles si elles sont inexactes ou incomplètes."
        },
        {
          subtitle: "7.3 Droit à l'Effacement",
          text: "Vous pouvez demander la suppression de vos données personnelles dans certaines circonstances."
        },
        {
          subtitle: "7.4 Droit d'Opposition",
          text: "Vous pouvez vous opposer au traitement de vos données personnelles à des fins de marketing direct."
        },
        {
          subtitle: "7.5 Droit à la Portabilité",
          text: "Vous avez le droit de recevoir vos données personnelles dans un format structuré et couramment utilisé."
        }
      ]
    },
    {
      title: "8. Données des Mineurs",
      content: "Nos services ne sont pas destinés aux personnes de moins de 18 ans. Nous ne collectons pas sciemment de données personnelles auprès de mineurs."
    },
    {
      title: "9. Transferts Internationaux",
      content: "Vos données peuvent être transférées et traitées dans des pays en dehors de la Tunisie. Nous veillons à ce que des garanties appropriées soient en place pour protéger vos données conformément à cette politique."
    },
    {
      title: "10. Modifications de Cette Politique",
      content: "Nous pouvons mettre à jour cette politique de confidentialité de temps en temps. Nous vous informerons de tout changement significatif en publiant la nouvelle politique sur notre site web."
    },
    {
      title: "11. Nous Contacter",
      content: "Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, veuillez nous contacter à : contact@navetteclub.com ou +216 94 299 800."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-privacy">
              Politique de Confidentialité
            </h1>
            <p className="text-lg text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Privacy Content */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <div key={index}>
                    <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                    {section.content && (
                      <p className="text-muted-foreground mb-4 leading-relaxed">{section.content}</p>
                    )}
                    {section.subsections && (
                      <div className="space-y-4 ml-4">
                        {section.subsections.map((sub, subIndex) => (
                          <div key={subIndex}>
                            <h3 className="text-lg font-semibold mb-2">{sub.subtitle}</h3>
                            <p className="text-muted-foreground leading-relaxed">{sub.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="mt-8 bg-primary/5">
            <CardContent className="pt-6 text-center">
              <h3 className="font-semibold mb-2">Questions sur Vos Données ?</h3>
              <p className="text-sm text-muted-foreground">
                Pour toute question concernant vos données personnelles, contactez-nous à{" "}
                <a href="mailto:contact@navetteclub.com" className="text-primary hover:underline">
                  contact@navetteclub.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
