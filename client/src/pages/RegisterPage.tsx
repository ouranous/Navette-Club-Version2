import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Truck } from "lucide-react";

const zones = [
  "Tunis et Nord",
  "Sousse",
  "Hammamet",
  "Monastir",
  "Sfax",
  "Djerba",
  "Sud Tunisien",
];

// Schema pour inscription client
const clientRegisterSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Schema pour inscription transporteur
const providerRegisterSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  name: z.string().min(1, "Le nom de la société est requis"),
  type: z.string(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  serviceZones: z.array(z.string()).min(1, "Sélectionnez au moins une zone"),
  notes: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type UserType = "client" | "provider" | null;
type ClientFormData = z.infer<typeof clientRegisterSchema>;
type ProviderFormData = z.infer<typeof providerRegisterSchema>;

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const providerForm = useForm<ProviderFormData>({
    resolver: zodResolver(providerRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      name: "",
      type: "transport_company",
      contactName: "",
      phone: "",
      address: "",
      city: "",
      country: "Tunisie",
      serviceZones: [],
      notes: "",
    },
  });

  const onClientSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/register", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      toast({
        title: "Compte créé avec succès",
        description: "Vous pouvez maintenant vous connecter",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le compte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onProviderSubmit = async (data: ProviderFormData) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/provider-register", data);

      toast({
        title: "Inscription réussie",
        description: "Votre compte transporteur a été créé avec succès",
      });

      navigate("/provider/dashboard");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le compte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoneToggle = (zone: string) => {
    const newZones = selectedZones.includes(zone)
      ? selectedZones.filter((z) => z !== zone)
      : [...selectedZones, zone];
    setSelectedZones(newZones);
    providerForm.setValue("serviceZones", newZones);
  };

  // Étape 1: Sélection du type d'utilisateur
  if (userType === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4 bg-muted/30">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle data-testid="text-register-title">Créer un compte</CardTitle>
              <CardDescription>Choisissez votre type de compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-8 flex flex-col gap-4 hover-elevate active-elevate-2"
                  onClick={() => setUserType("client")}
                  data-testid="button-select-client"
                >
                  <User className="h-12 w-12" />
                  <div className="space-y-2">
                    <div className="font-semibold text-lg">Je suis un Client</div>
                    <div className="text-sm text-muted-foreground">
                      Je souhaite réserver des transferts et visites
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-8 flex flex-col gap-4 hover-elevate active-elevate-2"
                  onClick={() => setUserType("provider")}
                  data-testid="button-select-provider"
                >
                  <Truck className="h-12 w-12" />
                  <div className="space-y-2">
                    <div className="font-semibold text-lg">Je suis un Transporteur</div>
                    <div className="text-sm text-muted-foreground">
                      Je souhaite proposer mes services de transport
                    </div>
                  </div>
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground mt-6">
                Vous avez déjà un compte ?{" "}
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => navigate("/login")}
                  data-testid="link-login"
                >
                  Se connecter
                </button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Étape 2: Formulaire Client
  if (userType === "client") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4 bg-muted/30">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle data-testid="text-client-register-title">Inscription Client</CardTitle>
              <CardDescription>Créez votre compte pour réserver vos transferts</CardDescription>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => setUserType(null)}
                data-testid="button-back"
              >
                ← Retour au choix du compte
              </button>
            </CardHeader>
            <CardContent>
              <Form {...clientForm}>
                <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={clientForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              data-testid="input-firstName"
                              placeholder="Jean"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={clientForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              data-testid="input-lastName"
                              placeholder="Dupont"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={clientForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            data-testid="input-email"
                            type="email"
                            placeholder="jean.dupont@example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            data-testid="input-password"
                            type="password"
                            placeholder="••••••••"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            data-testid="input-confirmPassword"
                            type="password"
                            placeholder="••••••••"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-testid="button-register"
                  >
                    {isLoading ? "Création..." : "Créer mon compte"}
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

  // Étape 2: Formulaire Transporteur
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle data-testid="text-provider-register-title">Inscription Transporteur</CardTitle>
            <CardDescription>Rejoignez NavetteClub en tant que transporteur partenaire</CardDescription>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setUserType(null)}
              data-testid="button-back"
            >
              ← Retour au choix du compte
            </button>
          </CardHeader>
          <CardContent>
            <Form {...providerForm}>
              <form onSubmit={providerForm.handleSubmit(onProviderSubmit)} className="space-y-6">
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold">Informations du compte</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={providerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ahmed" {...field} data-testid="input-firstname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={providerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ben Ali" {...field} data-testid="input-lastname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={providerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@transport.tn" {...field} data-testid="input-provider-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={providerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} data-testid="input-provider-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={providerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} data-testid="input-provider-confirm-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Informations de la société</h3>
                  
                  <FormField
                    control={providerForm.control}
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
                    control={providerForm.control}
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
                      control={providerForm.control}
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
                      control={providerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone de la société</FormLabel>
                          <FormControl>
                            <Input placeholder="+216 12 345 678" {...field} value={field.value || ""} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={providerForm.control}
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
                      control={providerForm.control}
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
                      control={providerForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pays</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} data-testid="input-country" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={providerForm.control}
                    name="serviceZones"
                    render={() => (
                      <FormItem>
                        <FormLabel>Zones de service *</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          {zones.map((zone) => (
                            <div key={zone} className="flex items-center space-x-2">
                              <Checkbox
                                id={`zone-${zone}`}
                                checked={selectedZones.includes(zone)}
                                onCheckedChange={() => handleZoneToggle(zone)}
                                data-testid={`checkbox-zone-${zone}`}
                              />
                              <label
                                htmlFor={`zone-${zone}`}
                                className="text-sm cursor-pointer"
                              >
                                {zone}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={providerForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input placeholder="Informations supplémentaires" {...field} value={field.value || ""} data-testid="input-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-submit"
                >
                  {isLoading ? "Inscription en cours..." : "Créer mon compte transporteur"}
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
