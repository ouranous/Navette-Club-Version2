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
import { Plus, Pencil, Trash2, Car, Users, Briefcase, Upload, Image as ImageIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertVehicleSchema, type Vehicle, type Provider } from "@shared/schema";
import type { z } from "zod";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

type VehicleFormData = z.infer<typeof insertVehicleSchema>;

// Helper function to display vehicle type names
const getVehicleTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    economy: "Économie",
    comfort: "Confort",
    business: "Business",
    premium: "Premium",
    vip: "VIP",
    suv: "SUV",
    van: "Van",
    minibus: "Minibus",
    // Legacy types for backward compatibility
    sedan: "Berline",
    bus: "Autocar",
  };
  return typeNames[type] || type;
};

export default function VehiclesManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: providers = [] } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      brand: "",
      model: "",
      licensePlate: undefined,
      driver: undefined,
      type: "economy",
      capacity: 4,
      luggage: 2,
      description: undefined,
      features: [],
      imageUrl: "",
      basePrice: "0",
      pricePerKm: undefined,
      isAvailable: true,
      providerId: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const res = await apiRequest("POST", "/api/vehicles", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Véhicule créé avec succès" });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<VehicleFormData>;
    }) => {
      const res = await apiRequest("PATCH", `/api/vehicles/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Véhicule modifié avec succès" });
      setIsDialogOpen(false);
      setEditingVehicle(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/vehicles/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Véhicule supprimé" });
    },
  });

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      licensePlate: vehicle.licensePlate ?? undefined,
      driver: vehicle.driver ?? undefined,
      type: vehicle.type as any,
      capacity: vehicle.capacity,
      luggage: vehicle.luggage,
      description: vehicle.description ?? undefined,
      features: vehicle.features || [],
      imageUrl: vehicle.imageUrl || "",
      basePrice: vehicle.basePrice || "0",
      pricePerKm: vehicle.pricePerKm ?? undefined,
      isAvailable: vehicle.isAvailable,
      providerId: vehicle.providerId ?? undefined,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: VehicleFormData) => {
    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, data });
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
          <h2 className="text-2xl font-bold">Véhicules</h2>
          <p className="text-muted-foreground">
            Gérer le parc de véhicules disponibles
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-vehicle">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau véhicule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? "Modifier" : "Nouveau"} véhicule
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marque*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Mercedes, BMW, Toyota..."
                            data-testid="input-vehicle-brand"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modèle*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Classe E, Série 5, Camry..."
                            data-testid="input-vehicle-model"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matricule</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="123 TU 1234"
                            data-testid="input-vehicle-license-plate"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="driver"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chauffeur</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nom du chauffeur"
                            data-testid="input-vehicle-driver"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                            <SelectTrigger data-testid="select-vehicle-type">
                              <SelectValue placeholder="Type de véhicule" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="economy">Économie</SelectItem>
                            <SelectItem value="comfort">Confort</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                            <SelectItem value="suv">SUV</SelectItem>
                            <SelectItem value="van">Van</SelectItem>
                            <SelectItem value="minibus">Minibus</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="providerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fournisseur</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-provider">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {providers.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacité (passagers)*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-capacity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="luggage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bagages*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-luggage"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix de base (€)*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            data-testid="input-base-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricePerKm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix par km (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            data-testid="input-price-per-km"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo du véhicule</FormLabel>
                      <div className="space-y-3">
                        {field.value && (
                          <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
                            <img
                              src={field.value}
                              alt="Aperçu"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const res = await apiRequest("POST", "/api/objects/upload");
                              const data = await res.json();
                              return {
                                method: "PUT" as const,
                                url: data.uploadURL,
                              };
                            }}
                            onComplete={(result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                              if (result.successful && result.successful[0]?.uploadURL) {
                                const uploadedUrl = result.successful[0].uploadURL.split('?')[0];
                                const objectPath = uploadedUrl.replace('https://storage.googleapis.com', '/objects');
                                field.onChange(objectPath);
                                toast({ title: "Photo uploadée avec succès" });
                              }
                            }}
                            buttonVariant="outline"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {field.value ? "Changer la photo" : "Ajouter une photo"}
                          </ObjectUploader>
                          {field.value && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => field.onChange("")}
                            >
                              Supprimer
                            </Button>
                          )}
                        </div>
                      </div>
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
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Aucun véhicule. Commencez par en ajouter un.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} data-testid={`card-vehicle-${vehicle.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription>
                      {getVehicleTypeName(vehicle.type)}
                      {vehicle.licensePlate && ` • ${vehicle.licensePlate}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(vehicle)}
                      data-testid={`button-edit-${vehicle.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(vehicle.id)}
                      disabled={isPending}
                      data-testid={`button-delete-${vehicle.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {vehicle.capacity} pers.
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {vehicle.luggage} bagages
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {vehicle.basePrice}€
                  </span>
                  {vehicle.pricePerKm && (
                    <span className="text-sm text-muted-foreground">
                      + {vehicle.pricePerKm}€/km
                    </span>
                  )}
                </div>
                <Badge variant={vehicle.isAvailable ? "default" : "secondary"}>
                  {vehicle.isAvailable ? "Disponible" : "Indisponible"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
