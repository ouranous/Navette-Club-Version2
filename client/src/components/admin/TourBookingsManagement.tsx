import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, DollarSign, MapPin, Euro } from "lucide-react";
import type { TourBooking, CityTour } from "@shared/schema";
import { format } from "date-fns";

export default function TourBookingsManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<TourBooking[]>({
    queryKey: ["/api/tour-bookings"],
  });

  const { data: tours = [], isLoading: toursLoading } = useQuery<CityTour[]>({
    queryKey: ["/api/tours"],
  });

  const getTourName = (tourId: string) => {
    const tour = tours.find(t => t.id === tourId);
    return tour?.name || "Tour inconnu";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" data-testid={`status-${status}`}>Confirmé</Badge>;
      case "pending":
        return <Badge variant="secondary" data-testid={`status-${status}`}>En attente</Badge>;
      case "cancelled":
        return <Badge variant="destructive" data-testid={`status-${status}`}>Annulé</Badge>;
      default:
        return <Badge variant="outline" data-testid={`status-${status}`}>{status}</Badge>;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter !== "all" && booking.status !== statusFilter) return false;
    
    if (dateFilter !== "all") {
      const bookingDate = new Date(booking.tourDate);
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

  if (bookingsLoading || toursLoading) {
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
          <CardTitle>Demandes City Tours</CardTitle>
          <CardDescription>
            Gérez les demandes de réservation de city tours
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
              <p className="text-muted-foreground">Aucune demande de city tour</p>
            ) : (
              filteredBookings.map((booking) => (
                <Card key={booking.id} data-testid={`booking-${booking.id}`}>
                  <CardContent className="p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Tour</p>
                            <p className="text-sm text-muted-foreground">
                              {getTourName(booking.tourId)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Date</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(booking.tourDate), "dd/MM/yyyy")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Participants</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.adults} adulte{booking.adults > 1 ? 's' : ''}
                              {booking.children && booking.children > 0 && `, ${booking.children} enfant${booking.children > 1 ? 's' : ''}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Euro className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Prix</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.totalPrice ? `${parseFloat(booking.totalPrice).toFixed(2)} EUR` : "Non calculé"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Client ID</p>
                          <p className="text-sm text-muted-foreground font-mono text-xs">
                            {booking.customerId}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Statut</p>
                          {getStatusBadge(booking.status)}
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
    </div>
  );
}
