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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Clock, Users, Euro, Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCityTourSchema, type CityTour, type Provider } from "@shared/schema";
import type { z } from "zod";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

type TourFormData = z.infer<typeof insertCityTourSchema>;

export default function ToursManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<CityTour | null>(null);

  const { data: tours = [], isLoading } = useQuery<CityTour[]>({
    queryKey: ["/api/tours"],
  });

  const { data: providers = [] } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });

  const form = useForm<TourFormData>({
    resolver: zodResolver(insertCityTourSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      fullDescription: "",
      category: "cultural",
      duration: 4,
      difficulty: "easy",
      maxCapacity: 20,
      minParticipants: 2,
      price: "50",
      priceChild: "25",
      highlights: [],
      included: [],
      excluded: [],
      meetingPoint: "",
      meetingTime: "",
      latitude: undefined,
      longitude: undefined,
      imageUrl: "",
      images: [],
      isActive: true,
      featured: false,
      providerId: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TourFormData) => {
      const res = await apiRequest("POST", "/api/tours", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      toast({ title: "Tour créé avec succès" });
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
      data: Partial<TourFormData>;
    }) => {
      const res = await apiRequest("PATCH", `/api/tours/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      toast({ title: "Tour modifié avec succès" });
      setIsDialogOpen(false);
      setEditingTour(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/tours/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      toast({ title: "Tour supprimé" });
    },
  });

  const handleEdit = (tour: CityTour) => {
    setEditingTour(tour);
    form.reset({
      name: tour.name,
      slug: tour.slug,
      description: tour.description,
      fullDescription: tour.fullDescription || "",
      category: tour.category,
      duration: tour.duration,
      difficulty: tour.difficulty,
      maxCapacity: tour.maxCapacity,
      minParticipants: tour.minParticipants || 2,
      price: tour.price || "0",
      priceChild: tour.priceChild || undefined,
      highlights: tour.highlights || [],
      included: tour.included || [],
      excluded: tour.excluded || [],
      meetingPoint: tour.meetingPoint,
      meetingTime: tour.meetingTime || "",
      latitude: tour.latitude || undefined,
      longitude: tour.longitude || undefined,
      imageUrl: tour.imageUrl || "",
      images: tour.images || [],
      isActive: tour.isActive,
      featured: tour.featured,
      providerId: tour.providerId || undefined,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: TourFormData) => {
    if (editingTour) {
      updateMutation.mutate({ id: editingTour.id, data });
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
          <h2 className="text-2xl font-bold">City Tours</h2>
          <p className="text-muted-foreground">
            Gérer les programmes de visite et itinéraires
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-tour">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau tour
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTour ? "Modifier" : "Nouveau"} city tour
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du tour*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Paris Classique"
                            data-testid="input-tour-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (URL)*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="paris-classique"
                            data-testid="input-slug"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Utilisé dans l'URL (ex: /tours/paris-classique)
                        </FormDescription>
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
                      <FormLabel>Description courte*</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description complète</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          data-testid="input-full-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cultural">Culturel</SelectItem>
                            <SelectItem value="gastronomic">Gastronomique</SelectItem>
                            <SelectItem value="adventure">Aventure</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulté*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-difficulty">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="easy">Facile</SelectItem>
                            <SelectItem value="medium">Modéré</SelectItem>
                            <SelectItem value="hard">Difficile</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée (h)*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-duration"
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
                    name="maxCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacité max*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-max-capacity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min. participants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-min-participants"
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
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix adulte (€)*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            data-testid="input-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceChild"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix enfant (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            data-testid="input-price-child"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="meetingPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Point de rendez-vous*</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Place de la Concorde, Paris"
                          data-testid="input-meeting-point"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="highlights"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points forts</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value?.join('\n') || ''}
                          onChange={(e) => {
                            const lines = e.target.value.split('\n').filter(line => line.trim());
                            field.onChange(lines);
                          }}
                          placeholder="Entrez un point fort par ligne&#10;Ex: Nuit dans le désert&#10;Villages troglodytes&#10;Ksour traditionnels"
                          rows={4}
                          data-testid="textarea-highlights"
                        />
                      </FormControl>
                      <FormDescription>
                        Entrez un point fort par ligne
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fournisseur/Partenaire</FormLabel>
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

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo du circuit</FormLabel>
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
                              if (result.successful[0]?.uploadURL) {
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

                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-is-active"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Actif</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-featured"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">À la une</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

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
      ) : tours.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Aucun tour. Commencez par en ajouter un.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {tours.map((tour) => (
            <Card key={tour.id} data-testid={`card-tour-${tour.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{tour.name}</CardTitle>
                    <CardDescription>{tour.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(tour)}
                      data-testid={`button-edit-${tour.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(tour.id)}
                      disabled={isPending}
                      data-testid={`button-delete-${tour.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge>{tour.category}</Badge>
                  <Badge variant="outline">{tour.difficulty}</Badge>
                  {tour.featured && <Badge variant="secondary">À la une</Badge>}
                  <Badge variant={tour.isActive ? "default" : "secondary"}>
                    {tour.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {tour.duration}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Max {tour.maxCapacity}
                  </span>
                  <span className="flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                    {tour.price}€
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
