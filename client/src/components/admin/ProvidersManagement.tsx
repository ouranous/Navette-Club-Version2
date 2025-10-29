import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProviderSchema, type Provider } from "@shared/schema";
import type { z } from "zod";

// Zones géographiques disponibles en Tunisie
const GEOGRAPHIC_ZONES = [
  "Tunis et Nord",
  "Sousse et Sahel",
  "Djerba et Sud",
  "Tozeur et Désert",
  "Sfax",
  "Kairouan",
  "Monastir et Mahdia",
] as const;

type ProviderFormData = z.infer<typeof insertProviderSchema>;

export default function ProvidersManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  const { data: providers = [], isLoading } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(insertProviderSchema),
    defaultValues: {
      name: "",
      type: "car_rental",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "France",
      serviceZones: [],
      notes: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProviderFormData) => {
      const res = await apiRequest("POST", "/api/providers", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({ title: "Fournisseur créé avec succès" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le fournisseur",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ProviderFormData>;
    }) => {
      const res = await apiRequest("PATCH", `/api/providers/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({ title: "Fournisseur modifié avec succès" });
      setIsDialogOpen(false);
      setEditingProvider(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le fournisseur",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/providers/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({ title: "Fournisseur supprimé" });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fournisseur",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    form.reset({
      name: provider.name,
      type: provider.type,
      contactName: provider.contactName || "",
      email: provider.email || "",
      phone: provider.phone || "",
      address: provider.address || "",
      city: provider.city || "",
      country: provider.country || "France",
      serviceZones: provider.serviceZones || [],
      notes: provider.notes || "",
      isActive: provider.isActive,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ProviderFormData) => {
    if (editingProvider) {
      updateMutation.mutate({ id: editingProvider.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fournisseurs</h2>
          <p className="text-muted-foreground">
            Gérer les partenaires et sous-traitants
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-provider">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau fournisseur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProvider ? "Modifier" : "Nouveau"} fournisseur
              </DialogTitle>
              <DialogDescription>
                Informations sur le partenaire ou sous-traitant
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'entreprise*</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-provider-name" />
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
                      <FormLabel>Type*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-provider-type">
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="car_rental">
                            Location de voitures
                          </SelectItem>
                          <SelectItem value="travel_agency">
                            Agence de voyage
                          </SelectItem>
                          <SelectItem value="transport_company">
                            Compagnie de transport
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-contact-name" />
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
                          <Input {...field} data-testid="input-phone" />
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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-city" />
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
                          <Input {...field} data-testid="input-country" />
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
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          Zones géographiques desservies
                        </FormLabel>
                        <FormDescription>
                          Sélectionnez les régions où ce transporteur opère
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {GEOGRAPHIC_ZONES.map((zone) => (
                          <FormField
                            key={zone}
                            control={form.control}
                            name="serviceZones"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={zone}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(zone)}
                                      onCheckedChange={(checked) => {
                                        const currentValues = field.value || [];
                                        return checked
                                          ? field.onChange([...currentValues, zone])
                                          : field.onChange(
                                              currentValues.filter((val: string) => val !== zone)
                                            );
                                      }}
                                      data-testid={`checkbox-zone-${zone}`}
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
                        <Textarea {...field} data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={isPending} data-testid="button-submit">
                    {isPending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : providers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Aucun fournisseur. Commencez par en ajouter un.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {providers.map((provider) => (
            <Card key={provider.id} data-testid={`card-provider-${provider.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{provider.name}</CardTitle>
                    <CardDescription>
                      {provider.type === "car_rental" && "Location de voitures"}
                      {provider.type === "travel_agency" && "Agence de voyage"}
                      {provider.type === "transport_company" &&
                        "Compagnie de transport"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={provider.isActive ? "default" : "secondary"}>
                      {provider.isActive ? "Actif" : "Inactif"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(provider)}
                      data-testid={`button-edit-${provider.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(provider.id)}
                      disabled={isPending}
                      data-testid={`button-delete-${provider.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {provider.contactName && (
                  <p>
                    <span className="font-medium">Contact:</span>{" "}
                    {provider.contactName}
                  </p>
                )}
                {provider.email && (
                  <p>
                    <span className="font-medium">Email:</span> {provider.email}
                  </p>
                )}
                {provider.phone && (
                  <p>
                    <span className="font-medium">Tél:</span> {provider.phone}
                  </p>
                )}
                {provider.city && (
                  <p>
                    <span className="font-medium">Ville:</span> {provider.city}
                    {provider.country && `, ${provider.country}`}
                  </p>
                )}
                {provider.serviceZones && provider.serviceZones.length > 0 && (
                  <div>
                    <span className="font-medium">Zones desservies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {provider.serviceZones.map((zone) => (
                        <Badge key={zone} variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {zone}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
