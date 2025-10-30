import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, Clock, Euro, Phone } from "lucide-react";

export default function CancellationPage() {
  const cancellationRules = [
    {
      timeframe: "Plus de 24 heures avant",
      fee: "0%",
      description: "Annulation gratuite sans frais",
      color: "text-green-600 dark:text-green-400"
    },
    {
      timeframe: "Entre 24h et 6h avant",
      fee: "50%",
      description: "50% du montant total sera retenu",
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      timeframe: "Moins de 6 heures avant",
      fee: "100%",
      description: "Montant total non remboursable",
      color: "text-red-600 dark:text-red-400"
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Contactez-nous",
      description: "Appelez-nous ou envoyez un email avec votre numéro de réservation"
    },
    {
      number: 2,
      title: "Confirmation",
      description: "Nous traiterons votre demande et vous enverrons une confirmation"
    },
    {
      number: 3,
      title: "Remboursement",
      description: "Le remboursement sera effectué sous 5-7 jours ouvrés"
    },
  ];

  const exceptions = [
    "Conditions météorologiques extrêmes rendant le voyage dangereux",
    "Urgence médicale documentée",
    "Annulation de vol par la compagnie aérienne (avec justificatif)",
    "Force majeure (catastrophes naturelles, troubles politiques, etc.)"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <XCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-cancellation">
              Politique d'Annulation
            </h1>
            <p className="text-xl text-muted-foreground">
              Conditions et procédures d'annulation de réservation
            </p>
          </div>

          {/* Cancellation Rules */}
          <Card className="mb-12">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Frais d'Annulation</h2>
              <div className="space-y-4">
                {cancellationRules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{rule.timeframe}</h3>
                        <span className={`text-2xl font-bold ${rule.color}`}>{rule.fee}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Process */}
          <Card className="mb-12">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Procédure d'Annulation</h2>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exceptions */}
          <Card className="mb-12">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Exceptions et Cas Particuliers</h2>
              <p className="text-muted-foreground mb-4">
                Des annulations sans frais peuvent être accordées dans les cas suivants :
              </p>
              <ul className="space-y-2">
                {exceptions.map((exception, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{exception}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Des justificatifs appropriés peuvent être demandés pour bénéficier de ces exceptions.
              </p>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="mb-12">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Informations Importantes</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Modification vs Annulation :</strong> Si vous souhaitez modifier votre réservation plutôt que l'annuler, 
                  contactez-nous. Des frais de modification peuvent s'appliquer mais sont généralement inférieurs aux frais d'annulation.
                </p>
                <p>
                  <strong className="text-foreground">Remboursement :</strong> Les remboursements sont effectués sur le mode de paiement original 
                  dans un délai de 5 à 7 jours ouvrés après confirmation de l'annulation.
                </p>
                <p>
                  <strong className="text-foreground">No-Show :</strong> En cas de non-présentation sans annulation préalable, 
                  le montant total de la réservation sera retenu sans possibilité de remboursement.
                </p>
                <p>
                  <strong className="text-foreground">Retard de Vol :</strong> En cas de retard de vol, nous suivons votre vol en temps réel. 
                  Aucuns frais supplémentaires ne seront facturés et votre chauffeur vous attendra.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card className="bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-3">Besoin d'annuler votre réservation ?</h3>
                <p className="text-muted-foreground mb-6">
                  Notre équipe est disponible 24h/24 pour traiter votre demande
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" asChild>
                    <a href="mailto:contact@navetteclub.com">
                      <Euro className="w-4 h-4 mr-2" />
                      Envoyer un Email
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="tel:+21694299800">
                      <Phone className="w-4 h-4 mr-2" />
                      +216 94 299 800
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Pensez à avoir votre numéro de réservation à portée de main
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
