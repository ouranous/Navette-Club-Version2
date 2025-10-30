import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProviderSchema } from "@shared/schema";

const providerFormSchema = insertProviderSchema.omit({ userId: true }).extend({
  serviceZones: z.array(z.string()).min(1, "Sélectionnez au moins une zone"),
});

type ProviderFormData = z.infer<typeof providerFormSchema>;

const zones = [
  "Tunis et Nord",
  "Sousse",
  "Monastir",
  "Sfax",
  "Djerba et Sud",
  "Kairouan",
  "Tout le pays",
];

export default function ProviderRegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      name: "",
      type: "transport_company",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "Tunisie",
      serviceZones: [],
      notes: "",
      isActive: true,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: ProviderFormData) => {
      return await apiRequest("POST", "/api/provider-register", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-provider"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Inscription réussie",
        description: "Votre compte transporteur a été créé avec succès",
      });
      setLocation("/provider/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProviderFormData) => {
    registerMutation.mutate({
      ...data,
      serviceZones: selectedZones,
    });
  };

  const toggleZone = (zone: string) => {
    const newZones = selectedZones.includes(zone)
      ? selectedZones.filter((z) => z !== zone)
      : [...selectedZones, zone];
    
    setSelectedZones(newZones);
    form.setValue("serviceZones", newZones);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="container mx-auto px-4 py-24 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Inscription Transporteur</CardTitle>
            <CardDescription>
              Rejoignez NavetteClub en tant que transporteur partenaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la société *</FormLabel>
                      <FormControl>
                        <Input placeholder="Transport Elite" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de société *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="transport_company">Société de transport</SelectItem>
                          <SelectItem value="car_rental">Location de véhicules</SelectItem>
                          <SelectItem value="travel_agency">Agence de voyage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean Dupont" {...field} value={field.value || ""} data-testid="input-contact" />
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
                          <Input placeholder="+216 12 345 678" {...field} value={field.value || ""} data-testid="input-phone" />
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
                        <Input type="email" placeholder="contact@transport.tn" {...field} value={field.value || ""} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Avenue Habib Bourguiba" {...field} value={field.value || ""} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Tunis" {...field} value={field.value || ""} data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} disabled data-testid="input-country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel>Zones desservies *</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {zones.map((zone) => (
                      <Button
                        key={zone}
                        type="button"
                        variant={selectedZones.includes(zone) ? "default" : "outline"}
                        onClick={() => toggleZone(zone)}
                        className="w-full"
                        data-testid={`zone-${zone}`}
                      >
                        {zone}
                      </Button>
                    ))}
                  </div>
                  {form.formState.errors.serviceZones && (
                    <p className="text-sm text-destructive mt-2">
                      {form.formState.errors.serviceZones.message}
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informations complémentaires..."
                          {...field}
                          value={field.value || ""}
                          data-testid="input-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                  data-testid="button-submit"
                >
                  {registerMutation.isPending ? "Inscription en cours..." : "S'inscrire"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
