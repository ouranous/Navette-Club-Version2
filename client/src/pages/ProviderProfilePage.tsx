import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Save, Building2, MapPin } from "lucide-react";

const GEOGRAPHIC_ZONES = [
  "Tunis et Nord",
  "Sousse et Sahel",
  "Djerba et Sud",
  "Tozeur et Désert",
  "Sfax",
  "Kairouan",
  "Monastir et Mahdia",
];

const profileSchema = z.object({
  name: z.string().min(1, "Le nom de l'entreprise est requis"),
  type: z.string(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  serviceZones: z.array(z.string()),
  notes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProviderProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: provider, isLoading } = useQuery({
    queryKey: ["/api/my-provider"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: provider ? {
      name: provider.name || "",
      type: provider.type || "transport_company",
      contactName: provider.contactName || "",
      phone: provider.phone || "",
      email: provider.email || "",
      address: provider.address || "",
      city: provider.city || "",
      country: provider.country || "Tunisie",
      serviceZones: provider.serviceZones || [],
      notes: provider.notes || "",
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const res = await apiRequest("PATCH", "/api/my-provider", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-provider"] });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/provider/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
              <p className="text-muted-foreground">
                Gérez les informations de votre entreprise
              </p>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Modifier le profil
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informations de l'entreprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'entreprise*</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Type d'activité*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="car_rental">Location de voitures</SelectItem>
                            <SelectItem value="travel_agency">Agence de voyage</SelectItem>
                            <SelectItem value="transport_company">Compagnie de transport</SelectItem>
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
                            <Input {...field} />
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
                            <Input {...field} />
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
                          <Input {...field} type="email" />
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
                          <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="serviceZones"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-base">Zones géographiques desservies</FormLabel>
                        <FormDescription>
                          Sélectionnez les régions où vous opérez
                        </FormDescription>
                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                          {GEOGRAPHIC_ZONES.map((zone) => (
                            <FormField
                              key={zone}
                              control={form.control}
                              name="serviceZones"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(zone)}
                                        onCheckedChange={(checked) => {
                                          const currentValues = field.value || [];
                                          return checked
                                            ? field.onChange([...currentValues, zone])
                                            : field.onChange(
                                                currentValues.filter((val) => val !== zone)
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal flex items-center gap-2">
                                      <MapPin className="w-3 h-3" />
                                      {zone}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" disabled={updateMutation.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Entreprise</p>
                  <p className="font-medium">{provider?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">
                    {provider?.type === "car_rental" && "Location de voitures"}
                    {provider?.type === "travel_agency" && "Agence de voyage"}
                    {provider?.type === "transport_company" && "Compagnie de transport"}
                  </p>
                </div>
                {provider?.contactName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{provider.contactName}</p>
                  </div>
                )}
                {provider?.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{provider.phone}</p>
                  </div>
                )}
                {provider?.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{provider.email}</p>
                  </div>
                )}
                {provider?.serviceZones && provider.serviceZones.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Zones desservies</p>
                    <div className="flex flex-wrap gap-2">
                      {provider.serviceZones.map((zone: string) => (
                        <span
                          key={zone}
                          className="text-xs px-2 py-1 bg-primary/10 rounded-full"
                        >
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
