import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { XCircle, ArrowLeft, RefreshCcw, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PaymentFailurePage() {
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

  const getErrorMessage = () => {
    if (paymentStatus?.status === 'expired') {
      return "Le lien de paiement a expiré. Veuillez créer une nouvelle réservation.";
    }
    if (paymentStatus?.status === 'failed') {
      return "Le paiement n'a pas pu être traité. Veuillez vérifier vos informations bancaires et réessayer.";
    }
    return "Une erreur s'est produite lors du traitement de votre paiement.";
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-red-950/20 dark:via-background dark:to-orange-950/20">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Paiement échoué</h1>
          <p className="text-xl text-muted-foreground">
            Nous n'avons pas pu traiter votre paiement
          </p>
        </div>

        <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage()}
          </AlertDescription>
        </Alert>

        <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              Que s'est-il passé ?
            </CardTitle>
            <CardDescription>
              Plusieurs raisons peuvent expliquer l'échec du paiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Informations de carte bancaire incorrectes</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Fonds insuffisants sur votre compte</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Carte expirée ou bloquée</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Limite de paiement dépassée</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Problème de connexion réseau</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-450">
          <CardHeader>
            <CardTitle>Que faire maintenant ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Vérifiez vos informations</h3>
                  <p className="text-sm text-muted-foreground">
                    Assurez-vous que les informations de votre carte sont correctes et que votre compte dispose de fonds suffisants
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Contactez votre banque</h3>
                  <p className="text-sm text-muted-foreground">
                    Si le problème persiste, contactez votre banque pour vérifier qu'aucune restriction ne bloque les paiements en ligne
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Réessayez</h3>
                  <p className="text-sm text-muted-foreground">
                    Une fois le problème résolu, vous pouvez créer une nouvelle réservation
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
          <Button
            size="lg"
            onClick={() => setLocation('/')}
            className="gap-2"
            data-testid="button-new-booking"
          >
            <RefreshCcw className="w-4 h-4" />
            Nouvelle réservation
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            data-testid="button-go-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </div>

        <div className="text-center mt-8 space-y-2 text-sm text-muted-foreground animate-in fade-in duration-500 delay-800">
          <p>Besoin d'aide ? Notre équipe est là pour vous</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="font-semibold">Email: support@navetteclub.com</p>
            <p className="font-semibold">Tél: +216 XX XXX XXX</p>
          </div>
        </div>
      </div>
    </div>
  );
}
