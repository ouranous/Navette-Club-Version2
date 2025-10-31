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
import RichTextEditor from "@/components/RichTextEditor";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Clock, 
  Users, 
  Euro, 
  Upload,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCityTourSchema, type CityTour, type Provider } from "@shared/schema";
import type { z } from "zod";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { 
  VisualCategoryChip, 
  VisualDifficultyChip, 
  TourPreviewCard 
} from "./TourVisualSelectors";
import { HighlightComposer } from "./HighlightComposer";
import { cn } from "@/lib/utils";

type TourFormData = z.infer<typeof insertCityTourSchema>;

const STEPS = [
  { id: 1, title: "Concept", description: "Identité & ambiance" },
  { id: 2, title: "Détails", description: "Description & highlights" },
  { id: 3, title: "Logistique", description: "Prix & informations pratiques" },
];

export default function ToursManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<CityTour | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

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

  const watchedValues = form.watch();

  const createMutation = useMutation({
    mutationFn: async (data: TourFormData) => {
      const res = await apiRequest("POST", "/api/tours", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      toast({ title: "Tour créé avec succès" });
      setIsDialogOpen(false);
      setCurrentStep(1);
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
      setCurrentStep(1);
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

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      cultural: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
      gastronomic: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
      adventure: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
      historical: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      nature: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
      moderate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
      difficult: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-700";
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      easy: "Facile",
      moderate: "Modéré",
      difficult: "Difficile",
    };
    return labels[difficulty] || difficulty;
  };

  const formatDuration = (hours: number) => {
    if (hours === 4) return "Demi journée";
    if (hours >= 24 && hours % 24 === 0) {
      const days = hours / 24;
      return `${days} jour${days > 1 ? 's' : ''}`;
    }
    return `${hours}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">City Tours</h2>
          <p className="text-muted-foreground">
            Gérer les programmes de visite et itinéraires
          </p>
        </div>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setCurrentStep(1);
              setEditingTour(null);
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button data-testid="button-add-tour">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau tour
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full max-h-full h-screen w-screen p-0 gap-0">
            <div className="flex h-full">
              {/* Vertical Sidebar - Stepper */}
              <div className="w-64 border-r bg-muted/30 shrink-0 flex flex-col">
                <DialogHeader className="px-4 pt-6 pb-4 border-b">
                  <DialogTitle className="text-xl">
                    {editingTour ? "Modifier" : "Créer"} un tour
                  </DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 p-4 space-y-2">
                  {STEPS.map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setCurrentStep(step.id)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-lg transition-all hover-elevate text-left",
                        currentStep === step.id 
                          ? "bg-primary text-primary-foreground" 
                          : currentStep > step.id
                            ? "bg-primary/10 text-primary"
                            : "bg-background text-muted-foreground"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold shrink-0 mt-0.5",
                        currentStep === step.id 
                          ? "bg-white text-primary" 
                          : currentStep > step.id
                            ? "bg-primary text-white"
                            : "bg-muted"
                      )}>
                        {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{step.title}</div>
                        <div className="text-xs opacity-80 mt-0.5">{step.description}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    data-testid="button-toggle-preview"
                    className="w-full"
                  >
                    {showPreview ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Masquer aperçu
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Voir aperçu
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex flex-1 overflow-hidden">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                    {/* Form Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                      {/* Step 1: Concept */}
                      {currentStep === 1 && (
                        <div className="space-y-6 max-w-2xl">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">🎨 Identité du Tour</h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nom du tour*</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Ex: Odyssée Saharienne"
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
                                        placeholder="odyssee-saharienne"
                                        data-testid="input-slug"
                                      />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                      URL: /tours/{field.value || "..."}
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
                                  <FormLabel>Accroche courte*</FormLabel>
                                  <FormControl>
                                    <RichTextEditor
                                      content={field.value || ""}
                                      onChange={field.onChange}
                                      placeholder="Décrivez votre tour en une phrase captivante..."
                                      minHeight="120px"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3">Catégorie</h4>
                            <FormField
                              control={form.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="grid grid-cols-2 gap-3">
                                    {["cultural", "gastronomic", "adventure", "historical", "nature"].map((cat) => (
                                      <VisualCategoryChip
                                        key={cat}
                                        category={cat}
                                        selected={field.value === cat}
                                        onClick={() => field.onChange(cat)}
                                      />
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3">Difficulté</h4>
                            <FormField
                              control={form.control}
                              name="difficulty"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="grid grid-cols-3 gap-3">
                                    {["easy", "moderate", "difficult"].map((diff) => (
                                      <VisualDifficultyChip
                                        key={diff}
                                        difficulty={diff}
                                        selected={field.value === diff}
                                        onClick={() => field.onChange(diff)}
                                      />
                                    ))}
                                  </div>
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
                                <FormLabel>Photo principale du circuit</FormLabel>
                                <div className="space-y-3">
                                  {field.value && (
                                    <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden border">
                                      <img
                                        src={field.value}
                                        alt="Aperçu"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  
                                  {/* URL Input - Always visible */}
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">
                                      URL de l'image (externe ou uploadée)
                                    </label>
                                    <Input
                                      placeholder="https://exemple.com/image-tour.jpg"
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value)}
                                      data-testid="input-tour-imageUrl"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Entrez l'URL d'une image hébergée sur un service externe (Cloudinary, ImageKit, etc.)
                                    </p>
                                  </div>

                                  {/* Upload button - Only on Replit */}
                                  {import.meta.env.REPL_ID && (
                                    <div className="flex gap-2 items-center">
                                      <div className="text-sm text-muted-foreground">Ou</div>
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
                                        onComplete={async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                                          if (result.successful && result.successful[0]?.uploadURL) {
                                            const uploadedUrl = result.successful[0].uploadURL.split('?')[0];
                                            try {
                                              const res = await apiRequest("POST", "/api/objects/normalize-path", { uploadURL: uploadedUrl });
                                              const data = await res.json();
                                              field.onChange(data.path);
                                              toast({ title: "Photo uploadée avec succès" });
                                            } catch (error) {
                                              console.error("Error normalizing path:", error);
                                              toast({ title: "Erreur lors de l'upload", variant: "destructive" });
                                            }
                                          }
                                        }}
                                        buttonVariant="outline"
                                      >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Uploader depuis votre ordinateur
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
                                  )}

                                  <FormDescription>
                                    <strong>Dimensions recommandées :</strong> 1200x800px minimum (ratio 3:2)<br />
                                    <strong>Taille max :</strong> 10 MB • <strong>Formats :</strong> JPG, PNG, WEBP
                                  </FormDescription>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Step 2: Détails */}
                      {currentStep === 2 && (
                        <div className="space-y-6 max-w-2xl">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">✨ Expérience & Détails</h3>
                            
                            <FormField
                              control={form.control}
                              name="fullDescription"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description complète</FormLabel>
                                  <FormControl>
                                    <RichTextEditor
                                      content={field.value || ""}
                                      onChange={field.onChange}
                                      placeholder="Racontez l'histoire de ce tour, ce qui le rend unique..."
                                      minHeight="300px"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="highlights"
                            render={({ field }) => (
                              <FormItem>
                                <HighlightComposer
                                  highlights={field.value || []}
                                  onChange={field.onChange}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Step 3: Logistique */}
                      {currentStep === 3 && (
                        <div className="space-y-6 max-w-2xl">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">💰 Prix & Informations Pratiques</h3>
                            
                            <div className="grid grid-cols-3 gap-4 mb-6">
                              <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Durée*</FormLabel>
                                    <Select
                                      value={field.value?.toString()}
                                      onValueChange={(value) => field.onChange(parseInt(value))}
                                    >
                                      <FormControl>
                                        <SelectTrigger data-testid="select-duration">
                                          <SelectValue placeholder="Sélectionner la durée" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="4">Demi journée</SelectItem>
                                        <SelectItem value="24">1 jour</SelectItem>
                                        <SelectItem value="48">2 jours</SelectItem>
                                        <SelectItem value="72">3 jours</SelectItem>
                                        <SelectItem value="96">4 jours</SelectItem>
                                        <SelectItem value="120">5 jours</SelectItem>
                                        <SelectItem value="144">6 jours</SelectItem>
                                        <SelectItem value="168">7 jours</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

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
                                        value={field.value ?? 0}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        data-testid="input-min-participants"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
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
                                        value={field.value || ""}
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
                                      placeholder="Ex: Hall de l'Hôtel Africa, Tunis"
                                      data-testid="input-meeting-point"
                                    />
                                  </FormControl>
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
                                    defaultValue={field.value || undefined}
                                  >
                                    <FormControl>
                                      <SelectTrigger data-testid="select-provider">
                                        <SelectValue placeholder="Sélectionner un partenaire" />
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

                            <div className="flex items-center gap-4 mt-6">
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
                                    <FormLabel className="!mt-0">Tour actif</FormLabel>
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
                                    <FormLabel className="!mt-0">Circuit Incontournable</FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sticky Footer */}
                    <DialogFooter className="px-8 py-4 border-t bg-background shrink-0 gap-3">
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          data-testid="button-prev-step"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Précédent
                        </Button>
                      )}
                      
                      {currentStep < 3 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          data-testid="button-next-step"
                          className="ml-auto"
                        >
                          Suivant
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          type="submit" 
                          disabled={isPending} 
                          data-testid="button-submit"
                          className="ml-auto"
                        >
                          {isPending ? "Enregistrement..." : "Enregistrer le tour"}
                        </Button>
                      )}
                    </DialogFooter>
                  </form>
                </Form>

                {/* Preview Panel - Collapsible */}
                {showPreview && (
                  <div className="w-96 bg-muted/30 border-l overflow-y-auto shrink-0">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">Aperçu en direct</h3>
                      </div>
                      <TourPreviewCard
                        name={watchedValues.name}
                        description={watchedValues.description}
                        imageUrl={watchedValues.imageUrl || undefined}
                        category={watchedValues.category}
                        difficulty={watchedValues.difficulty}
                        duration={watchedValues.duration}
                        maxCapacity={watchedValues.maxCapacity}
                        price={watchedValues.price}
                      />
                      
                      {/* Highlights Preview */}
                      {watchedValues.highlights && watchedValues.highlights.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-sm mb-3">Points Forts</h4>
                          <div className="space-y-2">
                            {watchedValues.highlights.slice(0, 5).map((highlight, idx) => {
                              const parts = highlight.split('::');
                              const text = parts.length > 1 ? parts[1] : highlight;
                              return (
                                <div key={idx} className="flex items-start gap-2 text-sm bg-card p-2 rounded-md">
                                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span>{text}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : tours.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Aucun tour disponible</p>
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(true)}
              className="mt-2"
              data-testid="button-create-first-tour"
            >
              Créer votre premier tour
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tours.map((tour) => (
            <Card key={tour.id} data-testid={`tour-card-${tour.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{tour.name}</CardTitle>
                      {!tour.isActive && (
                        <Badge variant="outline">Inactif</Badge>
                      )}
                      {tour.featured && (
                        <Badge variant="default">Incontournable</Badge>
                      )}
                    </div>
                    <CardDescription>{tour.description}</CardDescription>
                    <div className="flex gap-2 mt-3">
                      <Badge className={getCategoryBadgeColor(tour.category)}>
                        {tour.category}
                      </Badge>
                      <Badge className={getDifficultyBadgeColor(tour.difficulty)}>
                        {getDifficultyLabel(tour.difficulty)}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(tour.duration)}
                      </Badge>
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        Max {tour.maxCapacity}
                      </Badge>
                      <Badge variant="outline">
                        <Euro className="w-3 h-3 mr-1" />
                        {tour.price}€
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(tour)}
                      data-testid={`button-edit-tour-${tour.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Êtes-vous sûr de vouloir supprimer ce tour ?")) {
                          deleteMutation.mutate(tour.id);
                        }
                      }}
                      data-testid={`button-delete-tour-${tour.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
