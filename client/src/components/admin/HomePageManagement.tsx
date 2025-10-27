import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Star, Users, Coffee, Shield, CheckCircle, Award, Heart, Sparkles } from "lucide-react";

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

interface ServiceBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

type BadgeFormData = Omit<ServiceBadge, "id">;

export default function HomePageManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<ServiceBadge | null>(null);

  // Initial service badges - these match the current homepage
  const [badges, setBadges] = useState<ServiceBadge[]>([
    {
      id: "1",
      title: "Qualité Garantie",
      description: "Tous nos véhicules sont régulièrement entretenus et inspectés",
      icon: "Star",
    },
    {
      id: "2",
      title: "Chauffeurs Experts",
      description: "Chauffeurs professionnels, formés et expérimentés",
      icon: "Users",
    },
    {
      id: "3",
      title: "Service Premium",
      description: "Attention aux détails et service client exceptionnel",
      icon: "Coffee",
    },
  ]);

  const form = useForm<BadgeFormData>({
    defaultValues: {
      title: "",
      description: "",
      icon: "Star",
    },
  });

  const handleEdit = (badge: ServiceBadge) => {
    setEditingBadge(badge);
    form.reset({
      title: badge.title,
      description: badge.description,
      icon: badge.icon,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setBadges(badges.filter((b) => b.id !== id));
    toast({ title: "Badge supprimé avec succès" });
  };

  const onSubmit = (data: BadgeFormData) => {
    if (editingBadge) {
      // Update existing badge
      setBadges(
        badges.map((b) =>
          b.id === editingBadge.id
            ? { ...b, ...data }
            : b
        )
      );
      toast({ title: "Badge modifié avec succès" });
    } else {
      // Create new badge
      const newBadge: ServiceBadge = {
        id: Date.now().toString(),
        ...data,
      };
      setBadges([...badges, newBadge]);
      toast({ title: "Badge créé avec succès" });
    }
    
    setIsDialogOpen(false);
    setEditingBadge(null);
    form.reset();
  };

  const getIconComponent = (iconName: string) => {
    const iconData = AVAILABLE_ICONS.find((i) => i.value === iconName);
    return iconData ? iconData.icon : Star;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contenu Page d'Accueil</h2>
          <p className="text-muted-foreground">
            Gérer les badges et contenus affichés sur la page d'accueil
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingBadge(null);
                form.reset({ title: "", description: "", icon: "Star" });
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  <Button type="submit" data-testid="button-submit">
                    Enregistrer
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Badges de Services</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const IconComponent = getIconComponent(badge.icon);
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
                      onClick={() => handleEdit(badge)}
                      data-testid={`button-edit-${badge.id}`}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(badge.id)}
                      data-testid={`button-delete-${badge.id}`}
                    >
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note :</strong> Les badges modifiés ici sont actuellement stockés localement dans votre navigateur. 
            Pour les sauvegarder de manière permanente, contactez votre administrateur système pour activer 
            la sauvegarde en base de données.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
