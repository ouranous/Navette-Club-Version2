import GoogleMap from '../GoogleMap'

export default function GoogleMapExample() {
  // Données d'exemple pour la démonstration
  const sampleLocations = [
    {
      id: "eiffel-tower",
      position: { lat: 48.8584, lng: 2.2945 },
      title: "Tour Eiffel",
      description: "Monument emblématique de Paris",
      type: "tour" as const,
      rating: 4.6,
      price: 89
    },
    {
      id: "louvre",
      position: { lat: 48.8606, lng: 2.3376 },
      title: "Musée du Louvre",
      description: "Plus grand musée d'art au monde",
      type: "poi" as const,
      rating: 4.7
    },
    {
      id: "cdg-airport",
      position: { lat: 49.0097, lng: 2.5479 },
      title: "Aéroport CDG",
      description: "Aéroport Charles de Gaulle",
      type: "pickup" as const
    }
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Carte Google Maps - NavetteClub</h3>
        <GoogleMap 
          center={{ lat: 48.8566, lng: 2.3522 }}
          zoom={11}
          locations={sampleLocations}
          height="400px"
          className="w-full rounded-lg border"
        />
      </div>
    </div>
  )
}