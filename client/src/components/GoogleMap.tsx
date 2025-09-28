import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import { useState } from "react";

interface MapLocation {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  description?: string;
  type: "tour" | "pickup" | "destination" | "poi";
  rating?: number;
  price?: number;
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  locations?: MapLocation[];
  height?: string;
  className?: string;
  showInfoWindows?: boolean;
}

export default function GoogleMap({ 
  center = { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
  zoom = 12,
  locations = [],
  height = "400px",
  className = "",
  showInfoWindows = true
}: GoogleMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  // Utilise une clé d'API de développement (vous devrez la remplacer par votre vraie clé)
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "DEMO_API_KEY";

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "tour": return "#10b981"; // Vert pour les tours
      case "pickup": return "#3b82f6"; // Bleu pour les points de départ
      case "destination": return "#ef4444"; // Rouge pour les destinations
      case "poi": return "#f59e0b"; // Orange pour les points d'intérêt
      default: return "#6b7280"; // Gris par défaut
    }
  };

  const handleMarkerClick = (locationId: string) => {
    setSelectedLocation(selectedLocation === locationId ? null : locationId);
    console.log('Marker clicked:', locationId);
  };

  const selectedLocationData = locations.find(loc => loc.id === selectedLocation);

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      {GOOGLE_MAPS_API_KEY === "DEMO_API_KEY" ? (
        // Version démo sans vraie API Google Maps
        <div 
          className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 flex items-center justify-center relative"
          data-testid="demo-map"
        >
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <Card className="p-6 text-center backdrop-blur-sm bg-card/90 max-w-md mx-4">
            <CardContent className="space-y-4">
              <MapPin className="h-12 w-12 text-primary mx-auto" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Carte Interactive</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Intégration Google Maps prête - configurez votre clé API pour l'activer
                </p>
                <Badge variant="secondary" className="text-xs">
                  Mode Démonstration
                </Badge>
              </div>
              
              {locations.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-medium">Emplacements disponibles :</p>
                  <div className="flex flex-wrap gap-1">
                    {locations.slice(0, 3).map((location) => (
                      <Badge 
                        key={location.id} 
                        variant="outline" 
                        className="text-xs cursor-pointer hover-elevate"
                        style={{ borderColor: getMarkerColor(location.type) }}
                        onClick={() => handleMarkerClick(location.id)}
                        data-testid={`demo-marker-${location.id}`}
                      >
                        {location.title}
                      </Badge>
                    ))}
                    {locations.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{locations.length - 3} autres
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* InfoWindow simulée */}
          {selectedLocationData && (
            <Card className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm" data-testid="demo-info-window">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-3 h-3 rounded-full mt-1"
                    style={{ backgroundColor: getMarkerColor(selectedLocationData.type) }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{selectedLocationData.title}</h4>
                    {selectedLocationData.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedLocationData.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      {selectedLocationData.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{selectedLocationData.rating}</span>
                        </div>
                      )}
                      {selectedLocationData.price && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedLocationData.price}€
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Version réelle avec Google Maps API
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={center}
            defaultZoom={zoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
            zoomControl={true}
            mapId="NAVETTECLUB_MAP"
            data-testid="google-map"
          >
            {/* Marqueurs */}
            {locations.map((location) => (
              <AdvancedMarker
                key={location.id}
                position={location.position}
                onClick={() => handleMarkerClick(location.id)}
                data-testid={`marker-${location.id}`}
              >
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: getMarkerColor(location.type) }}
                />
              </AdvancedMarker>
            ))}

            {/* InfoWindow */}
            {selectedLocationData && showInfoWindows && (
              <InfoWindow
                position={selectedLocationData.position}
                onCloseClick={() => setSelectedLocation(null)}
                data-testid={`info-window-${selectedLocationData.id}`}
              >
                <div className="p-2 max-w-xs">
                  <h4 className="font-medium text-sm mb-1">{selectedLocationData.title}</h4>
                  {selectedLocationData.description && (
                    <p className="text-xs text-gray-600 mb-2">
                      {selectedLocationData.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    {selectedLocationData.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{selectedLocationData.rating}</span>
                      </div>
                    )}
                    {selectedLocationData.price && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {selectedLocationData.price}€
                      </span>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      )}
    </div>
  );
}