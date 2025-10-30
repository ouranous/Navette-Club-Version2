import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { MapPin, Calendar, Users, Car, CreditCard, ArrowLeft, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  type: string;
  imageUrl: string | null;
}

const customerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  flightNumber: z.string().optional(),
  nameOnPlacard: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  economy: "Économique",
  comfort: "Confort",
  business: "Business",
  premium: "Premium",
  vip: "VIP",
  suv: "SUV",
  van: "Van",
  minibus: "Minibus",
};

export default function TransferConfirmPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
  }, [location]);

  const vehicleId = searchParams?.get("vehicleId") || "";
  const origin = searchParams?.get("origin") || "";
  const destination = searchParams?.get("destination") || "";
  const date = searchParams?.get("date") || "";
  const time = searchParams?.get("time") || "";
  const passengers = searchParams?.get("passengers") || "1";
  const tripType = searchParams?.get("tripType") || "oneway";
  const returnDate = searchParams?.get("returnDate") || "";
  const returnTime = searchParams?.get("returnTime") || "";
  const distance = parseFloat(searchParams?.get("distance") || "0");
  const duration = parseInt(searchParams?.get("duration") || "0", 10);
  const price = parseFloat(searchParams?.get("price") || "0");

  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", vehicleId],
    queryFn: async () => {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (!response.ok) throw new Error("Failed to fetch vehicle");
      return response.json();
    },
    enabled: !!vehicleId,
  });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      flightNumber: "",
      nameOnPlacard: "",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);

    try {
      toast({
        title: "Création de la réservation...",
        description: "Veuillez patienter",
      });

      // Step 1: Create or get customer
      let customerId: string;
      try {
        const customerResponse = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
          }),
        });

        if (!customerResponse.ok) {
          throw new Error("Failed to create customer");
        }

        const customer = await customerResponse.json();
        customerId = customer.id;
      } catch (error) {
        throw new Error("Erreur lors de la création du client");
      }

      // Step 2: Create booking
      let bookingId: string;
      try {
        const bookingResponse = await fetch("/api/transfer-bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            vehicleId,
            transferType: tripType === "return" ? "round-trip" : "one-way",
            pickupLocation: origin,
            dropoffLocation: destination,
            pickupDate: new Date(date).toISOString(),
            pickupTime: time,
            returnDate: tripType === "return" && returnDate ? new Date(returnDate).toISOString() : null,
            returnTime: tripType === "return" ? returnTime : null,
            passengers: parseInt(passengers),
            luggage: parseInt(passengers),
            flightNumber: data.flightNumber || null,
            nameOnPlacard: data.nameOnPlacard || null,
            totalPrice: totalPrice.toString(),
          }),
        });

        if (!bookingResponse.ok) {
          throw new Error("Failed to create booking");
        }

        const booking = await bookingResponse.json();
        bookingId = booking.id;
      } catch (error) {
        throw new Error("Erreur lors de la création de la réservation");
      }

      // Step 3: Initialize payment
      toast({
        title: "Initialisation du paiement...",
        description: "Redirection vers Konnect...",
      });

      try {
        const paymentResponse = await fetch("/api/payments/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingType: "transfer",
            bookingId,
            amount: totalPrice,
            customerEmail: data.email,
            customerFirstName: data.firstName,
            customerLastName: data.lastName,
            customerPhone: data.phone,
            description: `Transfert ${origin} → ${destination}`,
          }),
        });

        if (!paymentResponse.ok) {
          throw new Error("Failed to initialize payment");
        }

        const paymentData = await paymentResponse.json();
        
        // Redirect to Konnect payment page
        window.location.href = paymentData.payUrl;
      } catch (error) {
        throw new Error("Erreur lors de l'initialisation du paiement");
      }
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la réservation",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const totalPrice = tripType === "return" ? price * 2 : price;

  if (!vehicleId || !origin || !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres manquants</CardTitle>
            <CardDescription>
              Veuillez effectuer une recherche complète pour continuer
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/book/transfer")}>
              Retour à la recherche
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Button
          data-testid="button-back"
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Customer Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Vos Informations
                </CardTitle>
                <CardDescription>
                  Veuillez remplir vos coordonnées pour finaliser la réservation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom *</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-first-name"
                                placeholder="Jean"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom *</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-last-name"
                                placeholder="Dupont"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-email"
                              type="email"
                              placeholder="jean.dupont@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone *</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-phone"
                              type="tel"
                              placeholder="+216 XX XXX XXX"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="flightNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro de Vol (optionnel)</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-flight-number"
                                placeholder="TU123"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nameOnPlacard"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom sur la Pancarte (optionnel)</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-name-on-placard"
                                placeholder="M. Dupont"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Paiement Sécurisé
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Vous serez redirigé vers notre plateforme de paiement sécurisée KONNECT
                        pour finaliser votre réservation.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Paiement 100% sécurisé</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Confirmation immédiate par email</span>
                      </div>
                    </div>

                    <Button
                      data-testid="button-confirm"
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Traitement en cours..." : `Confirmer et Payer ${totalPrice.toFixed(2)} €`}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="space-y-6">
            {/* Vehicle Card */}
            {vehicle && !isLoadingVehicle && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Votre Véhicule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    {vehicle.imageUrl ? (
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {VEHICLE_TYPE_LABELS[vehicle.type] || vehicle.type}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails de la Réservation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trip Type */}
                <div>
                  <Badge variant={tripType === "return" ? "default" : "secondary"}>
                    {tripType === "return" ? "Aller-Retour" : "Aller Simple"}
                  </Badge>
                </div>

                {/* Route */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold">Départ</p>
                      <p className="text-muted-foreground">{origin}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold">Arrivée</p>
                      <p className="text-muted-foreground">{destination}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Outbound */}
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Aller</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(date).toLocaleDateString("fr-FR")} à {time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{passengers} passager(s)</span>
                  </div>
                </div>

                {/* Return (if applicable) */}
                {tripType === "return" && returnDate && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Retour</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(returnDate).toLocaleDateString("fr-FR")} à {returnTime}</span>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Distance & Duration */}
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-semibold">{distance.toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durée estimée</span>
                    <span className="font-semibold">{duration} min</span>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prix aller simple</span>
                    <span>{price.toFixed(2)} €</span>
                  </div>
                  {tripType === "return" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Prix retour</span>
                        <span>{price.toFixed(2)} €</span>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{totalPrice.toFixed(2)} €</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
