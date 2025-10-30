import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { ContactInfo, SocialMediaLink } from "@shared/schema";

export default function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription submitted');
  };

  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  const { data: socialLinks } = useQuery<SocialMediaLink[]>({
    queryKey: ["/api/social-media-links"],
  });

  const currentYear = new Date().getFullYear();

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return Facebook;
      case 'twitter':
        return Twitter;
      case 'instagram':
        return Instagram;
      case 'linkedin':
        return Linkedin;
      default:
        return Facebook;
    }
  };

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
              {socialLinks?.filter(link => link.isActive).map((link) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`social-${link.platform}`}>
                      <Icon className="h-4 w-4" />
                    </Button>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Liens Rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/book/transfer" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-transfers">
                  Transferts Aéroport
                </Link>
              </li>
              <li>
                <Link href="/city-tours" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-city-tours">
                  City Tours
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-about">
                  À Propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-help">
                  Centre d'Aide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-faq">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-terms">
                  Conditions d'Utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-privacy">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-cancellation">
                  Annulation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <div className="space-y-3 text-sm">
              {contactInfo && (
                <>
                  <a href={`tel:${contactInfo.phone1}`} className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="h-4 w-4" />
                    <span>{contactInfo.phone1}</span>
                  </a>
                  <a href={`mailto:${contactInfo.email}`} className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="h-4 w-4" />
                    <span>{contactInfo.email}</span>
                  </a>
                  <div className="flex items-start space-x-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{contactInfo.address}<br />{contactInfo.postalCode} {contactInfo.city}, {contactInfo.country}</span>
                  </div>
                </>
              )}
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