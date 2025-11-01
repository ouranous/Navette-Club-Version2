import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, DollarSign, Pencil } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TransferBooking, Provider } from "@shared/schema";
import { format } from "date-fns";

export default function TransferBookingsManagement() {
  const { toast } = useToast();
  const [editingBooking, setEditingBooking] = useState<TransferBooking | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const { data: bookings = [], isLoading } = useQuery<TransferBooking[]>({
    queryKey: ["/api/transfer-bookings"],
  });

  const { data: providers = [] } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, providerId }: { id: string; providerId: string }) => {
      const res = await apiRequest("PATCH", `/api/transfer-bookings/${id}`, { providerId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfer-bookings"] });
      toast({ title: "Transporteur modifié avec succès" });
      setEditingBooking(null);
      setSelectedProviderId("");
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le transporteur",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (booking: TransferBooking) => {
    setEditingBooking(booking);
    setSelectedProviderId(booking.providerId || "");
  };

  const handleSave = () => {
    if (!editingBooking || !selectedProviderId) return;
    updateMutation.mutate({ id: editingBooking.id, providerId: selectedProviderId });
  };

  const getProviderName = (providerId: string | null) => {
    if (!providerId) return "Non assigné";
    const provider = providers.find(p => p.id === providerId);
    return provider ? `Assigné à ${provider.name}` : "Assigné (fournisseur inconnu)";
  };

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter !== "all" && booking.status !== statusFilter) return false;
    
    if (dateFilter !== "all") {
      const bookingDate = new Date(booking.pickupDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (dateFilter === "today") {
        const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        if (bookingDay.getTime() !== today.getTime()) return false;
      } else if (dateFilter === "upcoming") {
        if (bookingDate < today) return false;
      } else if (dateFilter === "past") {
        if (bookingDate >= today) return false;
      }
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Chargement des demandes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Demandes de Transfert</CardTitle>
          <CardDescription>
            Gérez les demandes de transfert et assignez les transporteurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filtrer par statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="filter-status">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmés</SelectItem>
                  <SelectItem value="cancelled">Annulés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filtrer par date</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger data-testid="filter-date">
                  <SelectValue placeholder="Toutes les dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les dates</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="upcoming">À venir</SelectItem>
                  <SelectItem value="past">Passées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <p className="text-muted-foreground">Aucune demande de transfert</p>
            ) : (
              filteredBookings.map((booking) => (
                <Card key={booking.id} data-testid={`booking-${booking.id}`}>
                  <CardContent className="p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Trajet</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.pickupLocation} → {booking.dropoffLocation}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Date</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(booking.pickupDate), "dd/MM/yyyy")} à {booking.pickupTime}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Passagers</p>
                            <p className="text-sm text-muted-foreground">{booking.passengers}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Prix</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.totalPrice ? `${parseFloat(booking.totalPrice).toFixed(2)} TND` : "Non calculé"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Transporteur</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={booking.providerId ? "default" : "secondary"}>
                              {getProviderName(booking.providerId)}
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(booking)}
                              data-testid={`button-edit-${booking.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Statut</p>
                          <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium">Demandes spéciales</p>
                        <p className="text-sm text-muted-foreground">{booking.specialRequests}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingBooking} onOpenChange={(open) => !open && setEditingBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le transporteur</DialogTitle>
            <DialogDescription>
              Sélectionnez un nouveau transporteur pour cette demande de transfert
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-2">Transporteur</p>
              <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                <SelectTrigger data-testid="select-provider">
                  <SelectValue placeholder="Sélectionnez un transporteur" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name} - {provider.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingBooking(null)}
              data-testid="button-cancel"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedProviderId || updateMutation.isPending}
              data-testid="button-save"
            >
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
