import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Car, MapPin, Clock, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // todo: remove mock functionality
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "success",
        title: "Transfert confirmé",
        message: "Votre transfert du 28 septembre est confirmé. Chauffeur: Jean D.",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        read: false,
        action: {
          label: "Voir détails",
          onClick: () => console.log("View transfer details")
        }
      },
      {
        id: "2",
        type: "info",
        title: "Nouveau City Tour disponible",
        message: "Découvrez notre nouveau tour 'Paris Gourmand' avec 20% de réduction.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        action: {
          label: "Découvrir",
          onClick: () => console.log("View tour")
        }
      },
      {
        id: "3",
        type: "warning",
        title: "Modification d'horaire",
        message: "Votre transfert de demain a été avancé de 15 minutes due aux conditions de circulation.",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        read: true
      },
      {
        id: "4",
        type: "success",
        title: "Paiement traité",
        message: "Votre paiement de 89€ pour le City Tour Paris Classique a été traité avec succès.",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        read: true
      },
      {
        id: "5",
        type: "info",
        title: "Évaluation en attente",
        message: "Comment s'est passé votre transfert avec Marie L. ? Partagez votre expérience.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: true,
        action: {
          label: "Évaluer",
          onClick: () => console.log("Rate driver")
        }
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning": return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error": return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        data-testid="button-notification-center"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs" data-testid="badge-unread-count">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-w-[90vw] z-50 shadow-lg border" data-testid="panel-notifications">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={markAllAsRead}
                  data-testid="button-mark-all-read"
                >
                  Tout marquer comme lu
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="flex items-start gap-3">
                        {getIcon(notification.type)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-primary rounded-full" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.action && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.action!.onClick();
                                }}
                                className="text-xs h-6 px-2"
                                data-testid={`button-action-${notification.id}`}
                              >
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}