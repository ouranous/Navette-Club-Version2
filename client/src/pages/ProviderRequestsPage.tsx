import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, MapPin, Users, Clock, ChevronLeft } from "lucide-react";
import type { TransferBooking, DisposalBooking } from "@shared/schema";

export default function ProviderRequestsPage() {
  const { data: requests, isLoading } = useQuery<{
    transfers: TransferBooking[];
    disposals: DisposalBooking[];
  }>({
    queryKey: ["/api/my-requests"],
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
          <Link href="/provider/dashboard">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Mes Demandes</h1>
          <p className="text-muted-foreground">
            Toutes les demandes qui vous sont assignées
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <Tabs defaultValue="transfers" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-2 mb-8">
              <TabsTrigger value="transfers" data-testid="tab-transfers">
                Transferts ({requests?.transfers.length || 0})
              </TabsTrigger>
              <TabsTrigger value="disposals" data-testid="tab-disposals">
                Mise à Disposition ({requests?.disposals.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transfers" className="space-y-4">
              {!requests?.transfers.length ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Aucune demande de transfert
                  </CardContent>
                </Card>
              ) : (
                requests.transfers.map((transfer) => (
                  <Card key={transfer.id} data-testid={`transfer-${transfer.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            {transfer.transferType === "one-way" ? "Aller Simple" : "Aller-Retour"}
                          </CardTitle>
                          <CardDescription>
                            Demande #{transfer.id.slice(0, 8)}
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

                      {transfer.specialRequests && (
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium mb-1">Demandes spéciales</p>
                          <p className="text-sm text-muted-foreground">
                            {transfer.specialRequests}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <Badge variant="outline">
                          {transfer.paymentStatus === "paid" ? "Payé" : "En attente"}
                        </Badge>
                        <div className="text-2xl font-bold">
                          {transfer.totalPrice} TND
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="disposals" className="space-y-4">
              {!requests?.disposals.length ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Aucune demande de mise à disposition
                  </CardContent>
                </Card>
              ) : (
                requests.disposals.map((disposal) => (
                  <Card key={disposal.id} data-testid={`disposal-${disposal.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Mise à Disposition</CardTitle>
                          <CardDescription>
                            Demande #{disposal.id.slice(0, 8)}
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

                      {disposal.specialRequests && (
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium mb-1">Demandes spéciales</p>
                          <p className="text-sm text-muted-foreground">
                            {disposal.specialRequests}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <Badge variant="outline">
                          {disposal.paymentStatus === "paid" ? "Payé" : "En attente"}
                        </Badge>
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
