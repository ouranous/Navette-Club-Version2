import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, Euro, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CityTour } from "@shared/schema";

interface TourBookingFormProps {
  tour: CityTour;
}

const bookingFormSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Téléphone requis"),
  country: z.string().optional(),
  tourDate: z.string().min(1, "Date requise"),
  adults: z.coerce.number().min(1, "Au moins 1 adulte requis"),
  children: z.coerce.number().min(0).default(0),
  specialRequests: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function TourBookingForm({ tour }: TourBookingFormProps) {
  const { toast } = useToast();
  const [bookingComplete, setBookingComplete] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "France",
      tourDate: "",
      adults: 1,
      children: 0,
      specialRequests: "",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      // Create or get customer
      const customerRes = await apiRequest("POST", "/api/customers", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        country: data.country,
      });
      const customer = await customerRes.json();

      // Calculate total price
      const adultsPrice = parseFloat(tour.price || "0") * data.adults;
      const childrenPrice = tour.priceChild 
        ? parseFloat(tour.priceChild) * (data.children || 0)
        : 0;
      const totalPrice = adultsPrice + childrenPrice;

      // Create tour booking
      const bookingRes = await apiRequest("POST", "/api/tour-bookings", {
        customerId: customer.id,
        tourId: tour.id,
        tourDate: new Date(data.tourDate).toISOString(),
        adults: data.adults,
        children: data.children || 0,
        totalPrice: totalPrice.toString(),
        specialRequests: data.specialRequests || null,
      });
      const booking = await bookingRes.json();

      return booking;
    },
    onSuccess: () => {
      setBookingComplete(true);
      queryClient.invalidateQueries({ queryKey: ["/api/tour-bookings"] });
      toast({
        title: "Réservation confirmée !",
        description: "Nous vous enverrons un email de confirmation sous peu.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la réservation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormValues) => {
    createBookingMutation.mutate(data);
  };

  const adults = form.watch("adults");
  const children = form.watch("children");
  const totalPrice = 
    parseFloat(tour.price || "0") * (adults || 0) + 
    (tour.priceChild ? parseFloat(tour.priceChild) * (children || 0) : 0);

  if (bookingComplete) {
    return (
      <Card data-testid="card-booking-success">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Réservation confirmée !</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Un email de confirmation vous a été envoyé.
            </p>
          </div>
          <Button 
            onClick={() => setBookingComplete(false)}
            variant="outline"
            className="w-full"
            data-testid="button-new-booking"
          >
            Nouvelle réservation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-booking-form">
      <CardHeader>
        <CardTitle>Réserver ce tour</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Date */}
            <FormField
              control={form.control}
              name="tourDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date du tour
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      min={new Date().toISOString().split('T')[0]}
                      data-testid="input-tour-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Participants */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adultes</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        max={tour.maxCapacity}
                        {...field}
                        data-testid="input-adults"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="children"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enfants</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        max={tour.maxCapacity}
                        {...field}
                        data-testid="input-children"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-first-name" />
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
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-last-name" />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} data-testid="input-email" />
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
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} data-testid="input-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Demandes spéciales (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Régime alimentaire, allergies, mobilité réduite..."
                      className="min-h-20"
                      data-testid="input-special-requests"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Price */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {adults} adulte{adults > 1 ? 's' : ''} 
                  {children > 0 && ` + ${children} enfant${children > 1 ? 's' : ''}`}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Total</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{totalPrice.toFixed(2)}</span>
                  <Euro className="w-5 h-5" />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createBookingMutation.isPending}
              data-testid="button-submit-booking"
            >
              {createBookingMutation.isPending ? "Réservation en cours..." : "Confirmer la réservation"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
