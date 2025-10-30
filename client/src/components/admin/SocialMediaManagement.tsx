import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import type { SocialMediaLink } from "@shared/schema";
import SocialMediaLinkItem from "./SocialMediaLinkItem";

export default function SocialMediaManagement() {
  const { data: socialLinks, isLoading } = useQuery<SocialMediaLink[]>({
    queryKey: ["/api/social-media-links"],
  });

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
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Réseaux Sociaux
          </CardTitle>
          <CardDescription>
            Gérez les liens vers vos réseaux sociaux affichés sur le site
          </CardDescription>
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
    </div>
  );
}
