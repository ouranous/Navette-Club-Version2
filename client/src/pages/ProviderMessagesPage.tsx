import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default function ProviderMessagesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/provider/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Communiquez avec l'administration
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Liste des conversations */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun message</p>
              </div>
            </CardContent>
          </Card>

          {/* Zone de messages */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Sélectionnez une conversation</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Sélectionnez une conversation pour commencer</p>
                <p className="text-sm mt-2">
                  La messagerie sera bientôt disponible
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info box */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm">
              <strong>📧 Besoin d'aide ?</strong> En attendant la messagerie intégrée, 
              vous pouvez nous contacter par email ou téléphone depuis la page de contact.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
