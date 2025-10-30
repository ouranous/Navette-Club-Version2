import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Luggage, Clock, CreditCard } from "lucide-react";
import type { TransferBooking, TourBooking, DisposalBooking } from "@shared/schema";

export default function ClientDashboardPage() {
  const { data: bookings, isLoading } = useQuery<{
    transfers: TransferBooking[];
    tours: TourBooking[];
    disposals: DisposalBooking[];
  }>({
    queryKey: ["/api/my-bookings"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "completed":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "cancelled":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="container mx-auto px-4 py-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mes Réservations</h1>
          <p className="text-muted-foreground">
            Consultez l'historique de toutes vos réservations
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <Tabs defaultValue="transfers" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3 mb-8">
              <TabsTrigger value="transfers" data-testid="tab-transfers">
                Transferts ({bookings?.transfers.length || 0})
              </TabsTrigger>
              <TabsTrigger value="tours" data-testid="tab-tours">
                City Tours ({bookings?.tours.length || 0})
              </TabsTrigger>
              <TabsTrigger value="disposals" data-testid="tab-disposals">
                Mise à Disposition ({bookings?.disposals.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transfers" className="space-y-4">
              {!bookings?.transfers.length ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Aucune réservation de transfert
                  </CardContent>
                </Card>
              ) : (
                bookings.transfers.map((transfer) => (
                  <Card key={transfer.id} data-testid={`transfer-${transfer.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            {transfer.transferType === "one-way" ? "Aller Simple" : "Aller-Retour"}
                          </CardTitle>
                          <CardDescription>
                            Réservation #{transfer.id.slice(0, 8)}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(transfer.status)}>
                          {transfer.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">De</p>
                            <p className="text-sm text-muted-foreground">
                              {transfer.pickupLocation}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Vers</p>
                            <p className="text-sm text-muted-foreground">
                              {transfer.dropoffLocation}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(transfer.pickupDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{transfer.pickupTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{transfer.passengers} passagers</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {transfer.paymentStatus === "paid" ? "Payé" : "En attente"}
                          </span>
                        </div>
                        <div className="text-2xl font-bold">
                          {transfer.totalPrice} TND
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="tours" className="space-y-4">
              {!bookings?.tours.length ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Aucune réservation de city tour
                  </CardContent>
                </Card>
              ) : (
                bookings.tours.map((tour) => (
                  <Card key={tour.id} data-testid={`tour-${tour.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">City Tour</CardTitle>
                          <CardDescription>
                            Réservation #{tour.id.slice(0, 8)}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(tour.status)}>
                          {tour.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(tour.tourDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {tour.adults} adultes {tour.children ? `+ ${tour.children} enfants` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {tour.paymentStatus === "paid" ? "Payé" : "En attente"}
                          </span>
                        </div>
                        <div className="text-2xl font-bold">
                          {tour.totalPrice} TND
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="disposals" className="space-y-4">
              {!bookings?.disposals.length ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Aucune réservation de mise à disposition
                  </CardContent>
                </Card>
              ) : (
                bookings.disposals.map((disposal) => (
                  <Card key={disposal.id} data-testid={`disposal-${disposal.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Mise à Disposition</CardTitle>
                          <CardDescription>
                            Réservation #{disposal.id.slice(0, 8)}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(disposal.status)}>
                          {disposal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Lieu de départ</p>
                          <p className="text-sm text-muted-foreground">
                            {disposal.pickupLocation}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(disposal.pickupDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{disposal.pickupTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{disposal.duration}h</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {disposal.paymentStatus === "paid" ? "Payé" : "En attente"}
                          </span>
                        </div>
                        <div className="text-2xl font-bold">
                          {disposal.totalPrice} TND
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Footer />
    </div>
  );
}
