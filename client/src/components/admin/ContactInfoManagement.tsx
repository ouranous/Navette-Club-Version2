import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { insertContactInfoSchema } from "@shared/schema";
import type { ContactInfo, InsertContactInfo } from "@shared/schema";

export default function ContactInfoManagement() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: contactInfo, isLoading } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  const form = useForm<InsertContactInfo>({
    resolver: zodResolver(insertContactInfoSchema),
    mode: "onChange",
    defaultValues: {
      companyName: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      phone1: "",
      email: "",
      phone2: "",
      description: "",
      aboutText: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertContactInfo>) => {
      if (!contactInfo?.id) throw new Error("No contact info to update");
      const res = await apiRequest("PATCH", `/api/contact-info/${contactInfo.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-info"] });
      toast({
        title: "Succès",
        description: "Les informations de contact ont été mises à jour",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les informations",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (contactInfo) {
      form.reset({
        companyName: contactInfo.companyName,
        address: contactInfo.address,
        city: contactInfo.city,
        postalCode: contactInfo.postalCode,
        country: contactInfo.country,
        phone1: contactInfo.phone1,
        phone2: contactInfo.phone2 || undefined,
        email: contactInfo.email,
        description: contactInfo.description || undefined,
        aboutText: contactInfo.aboutText || undefined,
      });
      setIsEditing(true);
    }
  };

  const onSubmit = (data: Partial<InsertContactInfo>) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!contactInfo && !isEditing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Aucune information de contact disponible</p>
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
                <MapPin className="w-5 h-5" />
                Informations de Contact
              </CardTitle>
              <CardDescription>
                Gérez les informations de contact affichées sur le site
              </CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit} data-testid="button-edit-contact">
                Modifier
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'entreprise *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-company-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone 1 *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-phone1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone 2</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} data-testid="input-phone2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-postal-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville *</FormLabel>
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
                        <FormLabel>Pays *</FormLabel>
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description courte</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} rows={2} data-testid="textarea-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aboutText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texte "À Propos"</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} rows={6} data-testid="textarea-about" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    data-testid="button-save-contact"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handleCancel}
                    data-testid="button-cancel-contact"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-muted-foreground">Entreprise</Label>
                  <p className="font-medium" data-testid="text-company-name">{contactInfo?.companyName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium" data-testid="text-email">{contactInfo?.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-muted-foreground">Téléphone 1</Label>
                  <p className="font-medium" data-testid="text-phone1">{contactInfo?.phone1}</p>
                </div>
                {contactInfo?.phone2 && (
                  <div>
                    <Label className="text-muted-foreground">Téléphone 2</Label>
                    <p className="font-medium" data-testid="text-phone2">{contactInfo.phone2}</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-muted-foreground">Adresse complète</Label>
                <p className="font-medium" data-testid="text-address">
                  {contactInfo?.address}<br />
                  {contactInfo?.postalCode} {contactInfo?.city}<br />
                  {contactInfo?.country}
                </p>
              </div>

              {contactInfo?.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium" data-testid="text-description">{contactInfo.description}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
