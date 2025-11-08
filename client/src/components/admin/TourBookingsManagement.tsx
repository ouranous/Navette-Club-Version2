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
import { Calendar, Users, Euro, MapPin, User, Mail, Phone } from "lucide-react";
import type { TourBooking, CityTour } from "@shared/schema";
import { format } from "date-fns";

// Type pour les détails clients
interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export default function TourBookingsManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<TourBooking[]>({
    queryKey: ["/api/tour-bookings"],
  });

  const { data: tours = [], isLoading: toursLoading } = useQuery<CityTour[]>({
    queryKey: ["/api/tours"],
  });

  // Récupérer les détails des clients
  const { data: customers = {} } = useQuery<Record<string, Customer>>({
    queryKey: ["/api/customers"],
    select: (data: any[]) => {
      return data.reduce((acc, customer) => {
        acc[customer.id] = customer;
        return acc;
      }, {} as Record<string, Customer>);
    },
  });

  const getTourName = (tourId: string) => {
    const tour = tours.find(t => t.id === tourId);
    return tour?.name || "Tour inconnu";
  };

  const getCustomerDetails = (customerId: string) => {
    const customer = customers[customerId];
    if (!customer) {
      return {
        fullName: "Client inconnu",
        email: "N/A",
        phone: "N/A",
      };
    }
    
    // Construire le nom complet à partir de firstName et lastName
    const fullName = [customer.firstName, customer.lastName]
      .filter(Boolean)
      .join(' ') || "Client inconnu";
    
    return {
      fullName,
      email: customer.email || "N/A",
      phone: customer.phone || "N/A",
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default">Confirmé</Badge>;
      case "pending":
        return <Badge variant="secondary">En attente</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
                <SelectTrigger>
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
                <SelectTrigger>
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
              filteredBookings.map((booking) => {
                const customer = getCustomerDetails(booking.customerId);
                
                return (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-sm">
                            {booking.referenceNumber || `ID: ${booking.id.slice(0, 8)}`}
                          </Badge>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                      
                      {/* SECTION DÉTAILS CLIENT - AJOUTÉE */}
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Informations Client
                        </h4>
                        <div className="grid md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">{customer.fullName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{customer.phone}</span>
                          </div>
                        </div>
                      </div>
                      
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
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
