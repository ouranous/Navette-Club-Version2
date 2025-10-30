import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, Trash2, Facebook, Twitter, Instagram, Linkedin, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertSocialMediaLinkSchema } from "@shared/schema";
import type { SocialMediaLink, InsertSocialMediaLink } from "@shared/schema";

interface SocialMediaLinkItemProps {
  link: SocialMediaLink;
}

export default function SocialMediaLinkItem({ link }: SocialMediaLinkItemProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<InsertSocialMediaLink>({
    resolver: zodResolver(insertSocialMediaLinkSchema),
    defaultValues: {
      platform: link.platform as "facebook" | "twitter" | "instagram" | "linkedin",
      url: link.url,
      isActive: link.isActive,
      order: link.order,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertSocialMediaLink>) => {
      const res = await apiRequest("PATCH", `/api/social-media-links/${link.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-media-links"] });
      toast({
        title: "Succès",
        description: "Le lien a été mis à jour",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le lien",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/social-media-links/${link.id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-media-links"] });
      toast({
        title: "Succès",
        description: "Le lien a été supprimé",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lien",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSocialMediaLink) => {
    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce lien ?")) {
      deleteMutation.mutate();
    }
  };

  const handleToggleActive = () => {
    const newValue = !form.getValues("isActive");
    form.setValue("isActive", newValue);
    updateMutation.mutate({ isActive: newValue });
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return Facebook;
      case 'twitter': return Twitter;
      case 'instagram': return Instagram;
      case 'linkedin': return Linkedin;
      default: return Share2;
    }
  };

  const Icon = getSocialIcon(link.platform);

  return (
    <Card>
      <CardContent className="pt-6">
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plateforme</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid={`input-platform-${link.id}`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." data-testid={`input-url-${link.id}`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordre d'affichage</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        value={field.value}
                        data-testid={`input-order-${link.id}`} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid={`switch-active-${link.id}`}
                      />
                    </FormControl>
                    <FormLabel>Actif</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  size="sm"
                  data-testid={`button-save-${link.id}`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  size="sm"
                  data-testid={`button-cancel-${link.id}`}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center" data-testid={`icon-${link.id}`}>
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold capitalize" data-testid={`text-platform-${link.id}`}>{link.platform}</h3>
                <p className="text-sm text-muted-foreground truncate max-w-md" data-testid={`text-url-${link.id}`}>
                  {link.url}
                </p>
              </div>
              <div className="flex items-center gap-2" data-testid={`status-wrapper-${link.id}`}>
                <Switch
                  checked={link.isActive}
                  onCheckedChange={handleToggleActive}
                  data-testid={`switch-toggle-${link.id}`}
                />
                <span className="text-xs text-muted-foreground" data-testid={`text-status-${link.id}`}>
                  {link.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                data-testid={`button-edit-${link.id}`}
              >
                Modifier
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
                data-testid={`button-delete-${link.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
