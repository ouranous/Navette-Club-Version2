import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, ArrowRight } from "lucide-react";

interface TunisiaHighlight {
  id: string;
  title: string;
  description: string;
  duration: string;
  rating: number;
  image: string;
  locations: string[];
  highlights: string[];
}

const tunisiaHighlights: TunisiaHighlight[] = [
  {
    id: "grand-sud",
    title: "Le Grand Sud Tunisien",
    description: "Explorez les paysages désertiques spectaculaires du Sahara, les ksour fortifiés et les villages berbères authentiques.",
    duration: "7 jours",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1617685126783-40e1d71b3a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    locations: ["Douz", "Matmata", "Tataouine", "Ksar Ghilane"],
    highlights: ["Nuit dans le désert", "Villages troglodytes", "Ksour traditionnels"]
  },
  {
    id: "carthage-sidi-bou",
    title: "Carthage & Sidi Bou Saïd",
    description: "Découvrez l'histoire millénaire de Carthage et le charme pittoresque du village bleu et blanc de Sidi Bou Saïd.",
    duration: "1 jour",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1591949676030-69a53857a4ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    locations: ["Carthage", "Sidi Bou Saïd", "La Marsa"],
    highlights: ["Ruines romaines", "Village blanc et bleu", "Vue sur la mer"]
  },
  {
    id: "kairouan-el-jem",
    title: "Kairouan & El Jem",
    description: "Visitez la quatrième ville sainte de l'Islam et l'amphithéâtre romain le mieux conservé d'Afrique.",
    duration: "1 jour",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    locations: ["Kairouan", "El Jem"],
    highlights: ["Grande Mosquée", "Amphithéâtre romain", "Médina historique"]
  },
  {
    id: "oasis-sud",
    title: "Circuit des Oasis",
    description: "Parcourez les oasis luxuriantes de Tozeur, Nefta et Chebika, entre palmeraies et cascades de montagne.",
    duration: "3 jours",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    locations: ["Tozeur", "Nefta", "Chebika", "Tamerza"],
    highlights: ["Palmeraies", "Cascades de montagne", "Villages de montagne"]
  },
  {
    id: "djerba",
    title: "Île de Djerba",
    description: "Explorez l'île paradisiaque de Djerba avec ses plages de sable blanc, ses marchés colorés et son patrimoine unique.",
    duration: "2 jours",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    locations: ["Houmt Souk", "Guellala", "La Ghriba"],
    highlights: ["Plages paradisiaques", "Synagogue La Ghriba", "Poterie artisanale"]
  },
  {
    id: "nord-montagne",
    title: "Nord & Montagnes",
    description: "Découvrez la Tunisie verte : Ain Draham, Tabarka et les montagnes de Kroumirie avec leurs forêts de chênes-lièges.",
    duration: "2 jours",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    locations: ["Tabarka", "Ain Draham", "Bulla Regia"],
    highlights: ["Forêts de Kroumirie", "Coraux de Tabarka", "Sites archéologiques"]
  }
];

export default function TunisiaHighlights() {
  return (
    <section className="py-16 bg-muted/30">
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
          {tunisiaHighlights.map((highlight) => (
            <Card 
              key={highlight.id} 
              className="hover-elevate overflow-hidden flex flex-col"
              data-testid={`card-highlight-${highlight.id}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={highlight.image}
                  alt={highlight.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-background/90 backdrop-blur-sm">
                    <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                    {highlight.rating}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl">{highlight.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{highlight.duration}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">
                  {highlight.description}
                </p>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1">Points forts:</p>
                    <div className="flex flex-wrap gap-1">
                      {highlight.highlights.map((item, idx) => (
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

                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1">Destinations:</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span>{highlight.locations.join(" • ")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full group" 
                  variant="outline"
                  data-testid={`button-details-${highlight.id}`}
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
