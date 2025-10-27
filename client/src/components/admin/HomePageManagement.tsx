import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Star, Users, Coffee, Shield, CheckCircle, Award, Heart, Sparkles, Image as ImageIcon, Upload } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { insertHomePageContentSchema, type HomePageContent } from "@shared/schema";
import { z } from "zod";

// Available icons for badges
const AVAILABLE_ICONS = [
  { value: "Star", label: "Étoile", icon: Star },
  { value: "Users", label: "Utilisateurs", icon: Users },
  { value: "Coffee", label: "Café", icon: Coffee },
  { value: "Shield", label: "Bouclier", icon: Shield },
  { value: "CheckCircle", label: "Check", icon: CheckCircle },
  { value: "Award", label: "Récompense", icon: Award },
  { value: "Heart", label: "Cœur", icon: Heart },
  { value: "Sparkles", label: "Étincelles", icon: Sparkles },
];

const badgeFormSchema = insertHomePageContentSchema.extend({
  type: z.literal("service_badge"),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  icon: z.string().min(1, "L'icône est requise"),
});

type BadgeFormData = z.infer<typeof badgeFormSchema>;

const heroFormSchema = insertHomePageContentSchema.extend({
  type: z.literal("hero_image"),
  imageUrl: z.string().min(1, "L'image est requise"),
});

type HeroFormData = z.infer<typeof heroFormSchema>;

export default function HomePageManagement() {
  const { toast } = useToast();
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [isHeroDialogOpen, setIsHeroDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<HomePageContent | null>(null);

  // Fetch all homepage content
  const { data: allContent = [], isLoading } = useQuery<HomePageContent[]>({
    queryKey: ["/api/homepage-content"],
  });

  // Filter content by type
  const badges = allContent.filter((item) => item.type === "service_badge");
  const heroImage = allContent.find((item) => item.type === "hero_image");

  const badgeForm = useForm<BadgeFormData>({
    resolver: zodResolver(badgeFormSchema),
    defaultValues: {
      type: "service_badge",
      title: "",
      description: "",
      icon: "Star",
      order: 0,
      isActive: true,
    },
  });

  const heroForm = useForm<HeroFormData>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: {
      type: "hero_image",
      imageUrl: "",
      title: "Bannière principale",
      order: 0,
      isActive: true,
    },
  });

  const createBadgeMutation = useMutation({
    mutationFn: async (data: BadgeFormData) => {
      const res = await apiRequest("POST", "/api/homepage-content", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-content"] });
      toast({ title: "Badge créé avec succès" });
      setIsBadgeDialogOpen(false);
      badgeForm.reset();
    },
    onError: () => {
      toast({ 
        title: "Erreur", 
        description: "Impossible de créer le badge",
        variant: "destructive" 
      });
    },
  });

  const updateBadgeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BadgeFormData> }) => {
      const res = await apiRequest("PATCH", `/api/homepage-content/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-content"] });
      toast({ title: "Badge modifié avec succès" });
      setIsBadgeDialogOpen(false);
      setEditingBadge(null);
      badgeForm.reset();
    },
  });

  const deleteBadgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/homepage-content/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-content"] });
      toast({ title: "Badge supprimé avec succès" });
    },
  });

  const updateHeroMutation = useMutation({
    mutationFn: async (data: HeroFormData) => {
      if (heroImage) {
        const res = await apiRequest("PATCH", `/api/homepage-content/${heroImage.id}`, data);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/homepage-content", data);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-content"] });
      toast({ title: "Bannière mise à jour avec succès" });
      setIsHeroDialogOpen(false);
    },
    onError: () => {
      toast({ 
        title: "Erreur", 
        description: "Impossible de mettre à jour la bannière",
        variant: "destructive" 
      });
    },
  });

  const handleEditBadge = (badge: HomePageContent) => {
    setEditingBadge(badge);
    badgeForm.reset({
      type: "service_badge",
      title: badge.title || "",
      description: badge.description || "",
      icon: badge.icon || "Star",
      order: badge.order,
      isActive: badge.isActive,
    });
    setIsBadgeDialogOpen(true);
  };

  const handleDeleteBadge = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce badge ?")) {
      deleteBadgeMutation.mutate(id);
    }
  };

  const onSubmitBadge = (data: BadgeFormData) => {
    if (editingBadge) {
      updateBadgeMutation.mutate({ id: editingBadge.id, data });
    } else {
      createBadgeMutation.mutate(data);
    }
  };

  const onSubmitHero = (data: HeroFormData) => {
    updateHeroMutation.mutate(data);
  };

  const getIconComponent = (iconName: string) => {
    const iconData = AVAILABLE_ICONS.find((i) => i.value === iconName);
    return iconData ? iconData.icon : Star;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Contenu Page d'Accueil</h2>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Contenu Page d'Accueil</h2>
        <p className="text-muted-foreground">
          Gérer les images, badges et contenus affichés sur la page d'accueil
        </p>
      </div>

      {/* Hero Banner Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Bannière Principale
              </CardTitle>
              <CardDescription>
                Image de fond affichée en haut de la page d'accueil
              </CardDescription>
            </div>
            <Dialog open={isHeroDialogOpen} onOpenChange={setIsHeroDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    heroForm.reset({
                      type: "hero_image",
                      imageUrl: heroImage?.imageUrl || "",
                      title: "Bannière principale",
                      order: 0,
                      isActive: true,
                    });
                  }}
                  data-testid="button-change-hero"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {heroImage ? "Changer" : "Ajouter"} la bannière
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Bannière Principale</DialogTitle>
                </DialogHeader>
                <Form {...heroForm}>
                  <form onSubmit={heroForm.handleSubmit(onSubmitHero)} className="space-y-4">
                    <FormField
                      control={heroForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image de bannière*</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              {field.value && (
                                <div className="relative w-full max-w-2xl h-64 bg-muted rounded-md overflow-hidden border">
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
                                  onComplete={(result) => {
                                    if (result.successful && result.successful.length > 0 && result.successful[0]?.uploadURL) {
                                      const uploadedUrl = result.successful[0].uploadURL.split('?')[0];
                                      const objectPath = uploadedUrl.replace('https://storage.googleapis.com', '/objects');
                                      field.onChange(objectPath);
                                      toast({ title: "Bannière uploadée avec succès" });
                                    }
                                  }}
                                  buttonVariant="outline"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  {field.value ? "Changer la bannière" : "Ajouter une bannière"}
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
                          </FormControl>
                          <FormDescription>
                            <strong>Dimensions recommandées :</strong> 1920x1080px minimum (ratio 16:9)<br />
                            <strong>Taille max :</strong> 10 MB • <strong>Formats :</strong> JPG, PNG, WEBP
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={updateHeroMutation.isPending}
                        data-testid="button-save-hero"
                      >
                        {updateHeroMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {heroImage?.imageUrl ? (
            <div className="relative aspect-video w-full max-w-2xl rounded-lg overflow-hidden border">
              <img 
                src={heroImage.imageUrl} 
                alt="Bannière principale"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video w-full max-w-2xl rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/10">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune bannière configurée</p>
                <p className="text-sm">Cliquez sur "Ajouter la bannière" pour commencer</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Badges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Badges de Services</h3>
            <p className="text-sm text-muted-foreground">
              Icônes et textes affichés sous la bannière principale
            </p>
          </div>
          <Dialog open={isBadgeDialogOpen} onOpenChange={setIsBadgeDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingBadge(null);
                  badgeForm.reset({
                    type: "service_badge",
                    title: "",
                    description: "",
                    icon: "Star",
                    order: 0,
                    isActive: true,
                  });
                }}
                data-testid="button-add-badge"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau badge
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingBadge ? "Modifier" : "Nouveau"} badge
                </DialogTitle>
              </DialogHeader>
              <Form {...badgeForm}>
                <form onSubmit={badgeForm.handleSubmit(onSubmitBadge)} className="space-y-4">
                  <FormField
                    control={badgeForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Qualité Garantie"
                            data-testid="input-badge-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={badgeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description*</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Description du service..."
                            rows={3}
                            data-testid="input-badge-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={badgeForm.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icône*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-badge-icon">
                              <SelectValue placeholder="Choisir une icône" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AVAILABLE_ICONS.map((iconData) => (
                              <SelectItem key={iconData.value} value={iconData.value}>
                                {iconData.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createBadgeMutation.isPending || updateBadgeMutation.isPending}
                      data-testid="button-submit-badge"
                    >
                      {(createBadgeMutation.isPending || updateBadgeMutation.isPending) 
                        ? "Enregistrement..." 
                        : "Enregistrer"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {badges.length === 0 ? (
            <Card className="col-span-3">
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>Aucun badge configuré. Cliquez sur "Nouveau badge" pour commencer.</p>
              </CardContent>
            </Card>
          ) : (
            badges.map((badge) => {
              const IconComponent = getIconComponent(badge.icon || "Star");
              return (
                <Card key={badge.id} data-testid={`card-badge-${badge.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{badge.title}</CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {AVAILABLE_ICONS.find((i) => i.value === badge.icon)?.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription className="text-sm">
                      {badge.description}
                    </CardDescription>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBadge(badge)}
                        data-testid={`button-edit-${badge.id}`}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBadge(badge.id)}
                        disabled={deleteBadgeMutation.isPending}
                        data-testid={`button-delete-${badge.id}`}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            <strong>Astuce :</strong> Pour modifier les photos des véhicules et des city tours, 
            utilisez les sections "Véhicules" et "City Tours" dans la navigation admin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
