import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle2, ArrowRight, Download, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get('payment_ref');
    
    if (ref) {
      setPaymentRef(ref);
      fetchPaymentStatus(ref);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPaymentStatus = async (ref: string) => {
    try {
      const response = await fetch(`/api/payments/${ref}/status`);
      if (response.ok) {
        const data = await response.json();
        setPaymentStatus(data);
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 dark:from-green-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Paiement confirmé !</h1>
          <p className="text-xl text-muted-foreground">
            Votre réservation a été validée avec succès
          </p>
        </div>

        <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Confirmation par email
            </CardTitle>
            <CardDescription>
              Un email de confirmation avec tous les détails de votre réservation vous a été envoyé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Statut du paiement</span>
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      {paymentStatus.status === 'completed' ? 'Payé' : paymentStatus.status}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Montant</span>
                    <span className="font-semibold">{paymentStatus.amount?.toFixed(2)} TND</span>
                  </div>
                  {paymentRef && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Référence de paiement</span>
                        <span className="font-mono text-sm">{paymentRef.slice(0, 12)}...</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader>
            <CardTitle>Prochaines étapes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email de confirmation</h3>
                  <p className="text-sm text-muted-foreground">
                    Vérifiez votre boîte mail pour le voucher de réservation
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Contact du transporteur</h3>
                  <p className="text-sm text-muted-foreground">
                    Un transporteur vous contactera prochainement pour confirmer les détails
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Suivi de votre réservation</h3>
                  <p className="text-sm text-muted-foreground">
                    Accédez à votre espace client pour suivre l'état de votre réservation
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <Button
            size="lg"
            onClick={() => setLocation('/client/dashboard')}
            className="gap-2"
            data-testid="button-view-bookings"
          >
            Voir mes réservations
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setLocation('/')}
            data-testid="button-back-home"
          >
            Retour à l'accueil
          </Button>
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground animate-in fade-in duration-500 delay-700">
          <p>Des questions ? Contactez notre service client</p>
          <p className="font-semibold">support@navetteclub.com</p>
        </div>
      </div>
    </div>
  );
}
