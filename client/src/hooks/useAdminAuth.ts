import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import type { User } from "@shared/schema";

interface AdminStatus {
  isAdmin: boolean;
}

export function useAdminAuth() {
  const [, setLocation] = useLocation();

  // On Replit, check regular auth
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // On Plesk, check admin password auth
  const { data: adminStatus } = useQuery<AdminStatus>({
    queryKey: ["/api/admin/status"],
    retry: false,
  });

  const isAdmin = user?.role === "admin" || adminStatus?.isAdmin || false;
  
  // Check if we've finished loading and confirmed user is NOT admin
  const isLoading = user === undefined && adminStatus === undefined;
  const hasLoaded = user !== undefined || adminStatus !== undefined;

  useEffect(() => {
    // Redirect if both queries have loaded and neither shows admin access
    if (hasLoaded && !isAdmin) {
      console.log("Not admin, redirecting to login", { user, adminStatus });
      setLocation("/admin/login");
    }
  }, [hasLoaded, isAdmin, user, adminStatus, setLocation]);

  return {
    isAdmin,
    isLoading,
  };
}
