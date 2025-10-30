import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import type { ContactInfo } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const { data: contactInfo, isLoading } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les plus brefs délais.",
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-contact">
              Contactez-nous
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {contactInfo?.description || "Notre équipe est à votre disposition pour répondre à toutes vos questions"}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Informations de Contact</h2>
                  
                  {isLoading ? (
                    <div className="text-muted-foreground">Chargement...</div>
                  ) : contactInfo ? (
                    <div className="space-y-6">
                      {/* Address */}
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Adresse</h3>
                          <p className="text-muted-foreground">
                            {contactInfo.address}<br />
                            {contactInfo.postalCode} {contactInfo.city}<br />
                            {contactInfo.country}
                          </p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Téléphone</h3>
                          <p className="text-muted-foreground">
                            <a href={`tel:${contactInfo.phone1}`} className="hover:text-primary transition-colors" data-testid="link-phone1">
                              {contactInfo.phone1}
                            </a>
                            {contactInfo.phone2 && (
                              <>
                                <br />
                                <a href={`tel:${contactInfo.phone2}`} className="hover:text-primary transition-colors" data-testid="link-phone2">
                                  {contactInfo.phone2}
                                </a>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Email</h3>
                          <p className="text-muted-foreground">
                            <a href={`mailto:${contactInfo.email}`} className="hover:text-primary transition-colors" data-testid="link-email">
                              {contactInfo.email}
                            </a>
                          </p>
                        </div>
                      </div>

                      {/* Hours */}
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Horaires</h3>
                          <p className="text-muted-foreground">
                            Disponible 24h/24, 7j/7<br />
                            Service client : 8h - 20h
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Informations non disponibles</div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Besoin d'une réponse rapide ?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pour une réservation urgente ou une question immédiate, n'hésitez pas à nous appeler directement.
                  </p>
                  <Button className="w-full" data-testid="button-call-now">
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler maintenant
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Nom complet *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      required
                      data-testid="input-name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre.email@exemple.com"
                      required
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Téléphone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+216 XX XXX XXX"
                      data-testid="input-phone"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Sujet *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Objet de votre message"
                      required
                      data-testid="input-subject"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Votre message..."
                      rows={6}
                      required
                      data-testid="textarea-message"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" data-testid="button-submit">
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
