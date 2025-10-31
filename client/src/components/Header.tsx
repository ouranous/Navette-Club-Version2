import { Bell, Menu, MapPin, Car, Globe, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [notificationCount, setNotificationCount] = useState(3); //todo: remove mock functionality
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleNotificationClick = () => {
    console.log('Notifications opened');
    setNotificationCount(0);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - responsive sizing */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover-elevate transition-all min-w-0" data-testid="link-home-logo">
            <Car className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <span className="text-base sm:text-xl font-bold text-foreground truncate">NavetteClub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/book/transfer" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors" data-testid="link-transfers">
              <Car className="h-4 w-4" />
              <span>Réserver un Transfer</span>
            </Link>
            <Link href="/city-tours" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors" data-testid="link-city-tours">
              <Globe className="h-4 w-4" />
              <span>City Tours</span>
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">
              À propos
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            {/* Notifications - hidden on very small screens */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className="relative hidden min-[400px]:flex"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs" data-testid="badge-notification-count">
                  {notificationCount}
                </Badge>
              )}
            </Button>

            {/* Auth Buttons / User Menu - ALWAYS VISIBLE */}
            <div className="flex items-center gap-1 sm:gap-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs sm:text-sm"
                      data-testid="button-user-menu"
                    >
                      <UserIcon className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">{user?.firstName || user?.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {user?.firstName} {user?.lastName}
                    </DropdownMenuLabel>
                    <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                      {user?.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" data-testid="menu-admin">
                          <span>Administration</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === "provider" && (
                      <DropdownMenuItem asChild>
                        <Link href="/provider/dashboard" data-testid="menu-provider">
                          <span>Espace Transporteur</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === "user" && (
                      <DropdownMenuItem asChild>
                        <Link href="/client/dashboard" data-testid="menu-client">
                          <span>Mes Réservations</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  {/* Login button - compact on mobile */}
                  <Link href="/login">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs sm:text-sm px-2 sm:px-3"
                      data-testid="button-login"
                    >
                      <span className="hidden sm:inline">Se connecter</span>
                      <span className="sm:hidden">Connexion</span>
                    </Button>
                  </Link>
                  {/* Register button - compact on mobile */}
                  <Link href="/register">
                    <Button 
                      size="sm" 
                      className="text-xs sm:text-sm px-2 sm:px-3"
                      data-testid="button-register"
                    >
                      <span className="hidden sm:inline">S'inscrire</span>
                      <span className="sm:hidden">Inscription</span>
                    </Button>
                  </Link>
                </>
              )}
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

        {/* Mobile Navigation - Reorganized with priorities */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Primary Actions First - Booking CTAs */}
              <div className="pb-2 border-b">
                <Link 
                  href="/book/transfer" 
                  className="block px-3 py-2.5 text-foreground font-medium hover:bg-accent rounded-md transition-colors" 
                  data-testid="mobile-link-transfers"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Car className="h-4 w-4 inline mr-2" />
                  Réserver un Transfer
                </Link>
                <Link 
                  href="/city-tours" 
                  className="block px-3 py-2.5 text-foreground font-medium hover:bg-accent rounded-md transition-colors" 
                  data-testid="mobile-link-city-tours"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Globe className="h-4 w-4 inline mr-2" />
                  City Tours
                </Link>
              </div>

              {/* User-specific actions if authenticated */}
              {isAuthenticated && (
                <div className="py-2 border-b">
                  <div className="px-3 mb-2">
                    <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  {user?.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start mb-1" data-testid="mobile-menu-admin">
                        Administration
                      </Button>
                    </Link>
                  )}
                  {user?.role === "provider" && (
                    <Link href="/provider/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start mb-1" data-testid="mobile-menu-provider">
                        Espace Transporteur
                      </Button>
                    </Link>
                  )}
                  {user?.role === "user" && (
                    <Link href="/client/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start mb-1" data-testid="mobile-menu-client">
                        Mes Réservations
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2" 
                    onClick={handleLogout}
                    data-testid="mobile-button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </div>
              )}

              {/* Secondary Links */}
              <div className="pt-2">
                <Link 
                  href="/about" 
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors" 
                  data-testid="mobile-link-about"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  À propos
                </Link>
                <Link 
                  href="/contact" 
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors" 
                  data-testid="mobile-link-contact"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}