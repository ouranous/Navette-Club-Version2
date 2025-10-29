import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface GooglePlacesInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

export default function GooglePlacesInput({
  id,
  value,
  onChange,
  placeholder,
  className,
  "data-testid": dataTestId,
}: GooglePlacesInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary("places");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    // Options pour l'autocomplétion (focus sur la Tunisie)
    const options: google.maps.places.AutocompleteOptions = {
      componentRestrictions: { country: "tn" }, // Limiter à la Tunisie
      fields: ["formatted_address", "name", "place_id"],
      types: ["geocode", "establishment"], // Adresses et lieux
    };

    // Initialiser l'autocomplétion
    autocompleteRef.current = new placesLib.Autocomplete(
      inputRef.current,
      options
    );

    // Écouter la sélection d'une place
    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place && place.formatted_address) {
        const selectedAddress = place.formatted_address;
        setInputValue(selectedAddress);
        onChange(selectedAddress);
      }
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [placesLib, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <Input
      ref={inputRef}
      id={id}
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={className}
      data-testid={dataTestId}
      autoComplete="off"
    />
  );
}
