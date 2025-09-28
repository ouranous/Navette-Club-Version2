import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription submitted');
    // todo: remove mock functionality
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">NavetteClub</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Votre partenaire de confiance pour tous vos déplacements premium. 
              Transferts et city tours d'exception depuis 2015.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="social-facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="social-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="social-instagram">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="social-linkedin">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Nos Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#transfers" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-transfers">
                  Transferts Aéroport
                </a>
              </li>
              <li>
                <a href="#city-tours" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-city-tours">
                  City Tours
                </a>
              </li>
              <li>
                <a href="#business" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-business">
                  Transport Business
                </a>
              </li>
              <li>
                <a href="#events" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-events">
                  Événements
                </a>
              </li>
              <li>
                <a href="#long-distance" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-long-distance">
                  Longue Distance
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#help" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-help">
                  Centre d'Aide
                </a>
              </li>
              <li>
                <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-faq">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#terms" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-terms">
                  Conditions d'Utilisation
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-privacy">
                  Politique de Confidentialité
                </a>
              </li>
              <li>
                <a href="#cancellation" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-cancellation">
                  Annulation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+33 1 42 86 15 20</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@navetteclub.com</span>
              </div>
              <div className="flex items-start space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>12 Rue de Rivoli<br />75001 Paris, France</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Newsletter</h4>
              <p className="text-xs text-muted-foreground">
                Recevez nos offres exclusives
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 h-8 text-xs"
                  data-testid="input-newsletter"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="h-8 px-3 text-xs"
                  data-testid="button-newsletter"
                >
                  S'abonner
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <p>© {currentYear} NavetteClub. Tous droits réservés.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs">Disponible 24h/24 7j/7</span>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-xs">Service actif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}