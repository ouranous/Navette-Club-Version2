import { Bell, Menu, MapPin, Car, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Header() {
  const [notificationCount, setNotificationCount] = useState(3); //todo: remove mock functionality
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNotificationClick = () => {
    console.log('Notifications opened');
    setNotificationCount(0);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">NavetteClub</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/book/transfer" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors" data-testid="link-transfers">
              <Car className="h-4 w-4" />
              <span>Réserver un Transfer</span>
            </a>
            <a href="#city-tours" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors" data-testid="link-city-tours">
              <Globe className="h-4 w-4" />
              <span>City Tours</span>
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">
              À propos
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">
              Contact
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs" data-testid="badge-notification-count">
                  {notificationCount}
                </Badge>
              )}
            </Button>

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" size="sm" data-testid="button-login">
                Se connecter
              </Button>
              <Button size="sm" data-testid="button-register">
                S'inscrire
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="/book/transfer" className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="mobile-link-transfers">
                Réserver un Transfer
              </a>
              <a href="#city-tours" className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="mobile-link-city-tours">
                City Tours
              </a>
              <a href="#about" className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="mobile-link-about">
                À propos
              </a>
              <a href="#contact" className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="mobile-link-contact">
                Contact
              </a>
              <div className="flex space-x-2 px-3 py-2">
                <Button variant="ghost" size="sm" className="flex-1" data-testid="mobile-button-login">
                  Se connecter
                </Button>
                <Button size="sm" className="flex-1" data-testid="mobile-button-register">
                  S'inscrire
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}