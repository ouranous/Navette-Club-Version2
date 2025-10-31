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

  useEffect(() => {
    // Only redirect if we know we're not admin and queries have loaded
    if (user === null && adminStatus?.isAdmin === false) {
      setLocation("/admin/login");
    }
  }, [user, adminStatus, setLocation]);

  return {
    isAdmin,
    isLoading: user === undefined && adminStatus === undefined,
  };
}
