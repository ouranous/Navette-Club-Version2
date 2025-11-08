import { useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function LogoutPage() {
  const [, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout", {});
      return await res.json();
    },
    onSuccess: () => {
      // Invalider toutes les queries
      queryClient.clear();
      // Rediriger vers la page d'accueil
      setLocation("/");
    },
    onError: () => {
      // Même en cas d'erreur, on redirige vers l'accueil
      queryClient.clear();
      setLocation("/");
    },
  });

  useEffect(() => {
    // Déconnecter automatiquement au chargement de la page
    logoutMutation.mutate();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Déconnexion en cours...</p>
      </div>
    </div>
  );
}
