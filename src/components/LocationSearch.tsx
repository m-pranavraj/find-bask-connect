import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface LocationSearchProps {
  onLocationSelect: (location: {
    address: string;
    city: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
  value?: string;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

const LocationSearch = ({ onLocationSelect, placeholder, value }: LocationSearchProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (value) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        initAutocomplete();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBqKxDz2N9P_CmH8v2dXqYB8wYHYx8xZ8I&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['address_components', 'geometry', 'formatted_address'],
        types: ['establishment', 'geocode']
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (!place || !place.geometry) return;

        const addressComponents = place.address_components || [];
        let city = '';

        // Extract city from address components
        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            city = component.long_name;
            break;
          } else if (component.types.includes('administrative_area_level_2')) {
            city = component.long_name;
          }
        }

        const location = {
          address: place.formatted_address || '',
          city: city,
          lat: place.geometry.location?.lat() || 0,
          lng: place.geometry.location?.lng() || 0
        };

        setInputValue(location.address);
        onLocationSelect(location);
      });
    };

    loadGoogleMaps();

    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onLocationSelect]);

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder || "Search for a location (mall, street, etc.)"}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default LocationSearch;
