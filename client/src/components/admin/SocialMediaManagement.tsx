import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Share2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SocialMediaLink, InsertSocialMediaLink } from "@shared/schema";
import { insertSocialMediaLinkSchema } from "@shared/schema";
import SocialMediaLinkItem from "./SocialMediaLinkItem";

export default function SocialMediaManagement() {
  const { toast } = useToast();
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const { data: socialLinks, isLoading } = useQuery<SocialMediaLink[]>({
    queryKey: ["/api/social-media-links"],
  });

  const form = useForm<InsertSocialMediaLink>({
    resolver: zodResolver(insertSocialMediaLinkSchema),
    defaultValues: {
      platform: "facebook",
      url: "",
      isActive: true,
      order: 1,
    },
  });

  const handleOpenDialog = () => {
    form.reset({
      platform: "facebook",
      url: "",
      isActive: true,
      order: (socialLinks?.length || 0) + 1,
    });
    setIsAddingNew(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertSocialMediaLink) => {
      const res = await apiRequest("POST", "/api/social-media-links", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-media-links"] });
      toast({
        title: "Succès",
        description: "Le lien a été ajouté",
      });
      setIsAddingNew(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le lien",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSocialMediaLink) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground" data-testid="text-loading">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Réseaux Sociaux
              </CardTitle>
              <CardDescription>
                Gérez les liens vers vos réseaux sociaux affichés sur le site
              </CardDescription>
            </div>
            <Button onClick={handleOpenDialog} data-testid="button-add-social-link">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un lien
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {socialLinks?.map((link) => (
              <SocialMediaLinkItem key={link.id} link={link} />
            ))}

            {(!socialLinks || socialLinks.length === 0) && (
              <p className="text-center text-muted-foreground py-8" data-testid="text-empty">
                Aucun lien de réseau social configuré
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un réseau social</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau lien vers vos réseaux sociaux
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plateforme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-platform">
                          <SelectValue placeholder="Sélectionnez une plateforme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input
                        placeholder="https://facebook.com/votre-page"
                        {...field}
                        data-testid="input-url"
                      />
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
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        data-testid="input-order"
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
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Actif</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingNew(false)}
                  data-testid="button-cancel"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-save"
                >
                  {createMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
