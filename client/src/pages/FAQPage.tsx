import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      category: "Réservations",
      questions: [
        {
          q: "Comment réserver un transfert ?",
          a: "Vous pouvez réserver directement sur notre site en indiquant vos points de départ et d'arrivée, la date et l'heure souhaitées. Vous recevrez une confirmation immédiate par email."
        },
        {
          q: "Puis-je modifier ma réservation ?",
          a: "Oui, vous pouvez modifier votre réservation jusqu'à 24h avant l'heure prévue. Contactez notre service client par téléphone ou email pour toute modification."
        },
        {
          q: "Quel est le délai minimum pour réserver ?",
          a: "Nous acceptons les réservations jusqu'à 2 heures avant le transfert souhaité, sous réserve de disponibilité des véhicules."
        },
      ]
    },
    {
      category: "Paiements",
      questions: [
        {
          q: "Quels sont les moyens de paiement acceptés ?",
          a: "Nous acceptons les paiements par carte bancaire (Visa, Mastercard), virement bancaire et paiement en espèces au chauffeur."
        },
        {
          q: "Quand dois-je payer ?",
          a: "Le paiement peut être effectué lors de la réservation en ligne ou directement au chauffeur. Pour les réservations d'entreprise, nous proposons également des factures mensuelles."
        },
        {
          q: "Les prix incluent-ils les péages et les parkings ?",
          a: "Oui, tous nos tarifs incluent les péages autoroutiers. Les frais de parking dans les aéroports sont également inclus."
        },
      ]
    },
    {
      category: "Véhicules",
      questions: [
        {
          q: "Quelle est votre flotte de véhicules ?",
          a: "Notre flotte comprend des berlines de luxe, des SUV premium, des vans pour les groupes, et des minibus. Tous nos véhicules sont récents, climatisés et entretenus régulièrement."
        },
        {
          q: "Les véhicules sont-ils équipés de Wi-Fi ?",
          a: "Oui, la plupart de nos véhicules premium disposent du Wi-Fi gratuit. N'hésitez pas à le demander lors de votre réservation."
        },
        {
          q: "Puis-je demander un siège bébé ?",
          a: "Oui, nous fournissons des sièges bébé et rehausseurs gratuitement. Merci de nous en faire la demande lors de la réservation."
        },
      ]
    },
    {
      category: "Service",
      questions: [
        {
          q: "Que se passe-t-il en cas de retard de vol ?",
          a: "Nous suivons les horaires de vol en temps réel. En cas de retard, votre chauffeur vous attendra sans frais supplémentaires."
        },
        {
          q: "Comment reconnaître mon chauffeur à l'aéroport ?",
          a: "Votre chauffeur vous attendra dans le hall des arrivées avec une pancarte portant votre nom ou celui indiqué lors de la réservation."
        },
        {
          q: "Puis-je faire des arrêts en route ?",
          a: "Oui, vous pouvez demander des arrêts courts (courses, restaurants). Pour des arrêts prolongés, merci de choisir notre service de mise à disposition."
        },
      ]
    },
    {
      category: "Annulations",
      questions: [
        {
          q: "Quelle est la politique d'annulation ?",
          a: "Les annulations sont gratuites jusqu'à 24h avant le transfert. Entre 24h et 6h avant, 50% du montant est retenu. Moins de 6h avant, le montant total est dû."
        },
        {
          q: "Comment annuler ma réservation ?",
          a: "Vous pouvez annuler par téléphone ou par email en indiquant votre numéro de réservation. Un email de confirmation vous sera envoyé."
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-faq">
              Questions Fréquentes
            </h1>
            <p className="text-xl text-muted-foreground">
              Trouvez rapidement des réponses à vos questions
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <Card className="mt-12 bg-primary/5">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-semibold mb-3">
                Vous ne trouvez pas la réponse à votre question ?
              </h3>
              <p className="text-muted-foreground mb-4">
                Notre équipe est disponible 24h/24 pour vous aider
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                  Contactez-nous
                </a>
                <a href="tel:+21694299800" className="inline-flex items-center justify-center px-6 py-3 border border-border text-base font-medium rounded-md bg-background hover-elevate transition-all">
                  Appelez-nous
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
