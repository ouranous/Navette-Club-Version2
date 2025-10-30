import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptation des Conditions",
      content: "En utilisant les services de NavetteClub, vous acceptez les présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services."
    },
    {
      title: "2. Services Proposés",
      content: "NavetteClub propose des services de transport premium incluant les transferts aéroport, les city tours, les déplacements professionnels et la mise à disposition de véhicules avec chauffeur. Tous nos services sont soumis à disponibilité."
    },
    {
      title: "3. Réservations",
      subsections: [
        {
          subtitle: "3.1 Procédure de Réservation",
          text: "Les réservations peuvent être effectuées en ligne via notre site web, par téléphone ou par email. Toute réservation est confirmée par email."
        },
        {
          subtitle: "3.2 Modification de Réservation",
          text: "Les modifications de réservation doivent être effectuées au moins 24 heures avant l'heure prévue du service. Des frais peuvent s'appliquer selon les modifications demandées."
        },
        {
          subtitle: "3.3 Annulation",
          text: "Les annulations sont gratuites jusqu'à 24h avant le service. Entre 24h et 6h avant, 50% du montant est retenu. Moins de 6h avant, le montant total est dû."
        }
      ]
    },
    {
      title: "4. Tarifs et Paiement",
      subsections: [
        {
          subtitle: "4.1 Tarification",
          text: "Nos tarifs sont affichés en euros (EUR) et incluent tous les frais de péage et de parking. Les prix peuvent varier selon la saison et la demande."
        },
        {
          subtitle: "4.2 Modes de Paiement",
          text: "Nous acceptons les paiements par carte bancaire, virement bancaire et espèces. Le paiement est requis lors de la réservation ou peut être effectué directement au chauffeur."
        },
        {
          subtitle: "4.3 Facturation",
          text: "Une facture est automatiquement envoyée par email après chaque prestation. Les factures mensuelles sont disponibles pour les clients professionnels."
        }
      ]
    },
    {
      title: "5. Responsabilités du Client",
      content: "Le client s'engage à fournir des informations exactes lors de la réservation, à être ponctuel au lieu de rendez-vous convenu, et à respecter le véhicule et le chauffeur. Tout dommage causé au véhicule par le client sera facturé."
    },
    {
      title: "6. Responsabilités de NavetteClub",
      content: "NavetteClub s'engage à fournir un service de qualité avec des véhicules entretenus et des chauffeurs professionnels. En cas de retard ou d'incident, nous nous efforcerons de trouver une solution alternative dans les meilleurs délais."
    },
    {
      title: "7. Bagages et Objets Personnels",
      content: "NavetteClub n'est pas responsable des objets personnels laissés dans les véhicules. Nous vous encourageons à vérifier que vous n'oubliez rien avant de quitter le véhicule. Les objets trouvés sont conservés pendant 30 jours."
    },
    {
      title: "8. Force Majeure",
      content: "NavetteClub ne peut être tenu responsable en cas de force majeure, incluant mais non limité aux conditions météorologiques extrêmes, grèves, manifestations, ou toute autre circonstance indépendante de notre volonté."
    },
    {
      title: "9. Protection des Données",
      content: "Vos données personnelles sont collectées et traitées conformément à notre Politique de Confidentialité. Elles sont utilisées uniquement pour la gestion de vos réservations et l'amélioration de nos services."
    },
    {
      title: "10. Réclamations",
      content: "Toute réclamation doit être adressée par écrit à contact@navetteclub.com dans les 48 heures suivant la prestation. Nous nous engageons à répondre dans un délai de 7 jours ouvrés."
    },
    {
      title: "11. Modification des Conditions",
      content: "NavetteClub se réserve le droit de modifier ces conditions générales à tout moment. Les modifications entrent en vigueur dès leur publication sur le site web."
    },
    {
      title: "12. Droit Applicable",
      content: "Ces conditions générales sont régies par le droit tunisien. En cas de litige, les tribunaux de Tunis seront seuls compétents."
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
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-terms">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-lg text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Terms Content */}
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
              <p className="text-sm text-muted-foreground">
                Pour toute question concernant ces conditions générales, veuillez nous contacter à{" "}
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
