import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        initServices();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBqKxDz2N9P_CmH8v2dXqYB8wYHYx8xZ8I&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initServices;
      document.head.appendChild(script);
    };

    const initServices = () => {
      if (!window.google) return;

      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      const mapDiv = document.createElement('div');
      const map = new window.google.maps.Map(mapDiv);
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    };

    loadGoogleMaps();

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!inputValue || inputValue.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      if (autocompleteServiceRef.current) {
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: inputValue,
            componentRestrictions: { country: 'in' },
            types: ['establishment', 'geocode']
          },
          (predictions: any, status: any) => {
            setIsLoading(false);
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setPredictions(predictions);
              setShowDropdown(true);
            } else {
              setPredictions([]);
              setShowDropdown(false);
            }
          }
        );
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleSelectPlace = (placeId: string) => {
    if (!placesServiceRef.current) return;

    placesServiceRef.current.getDetails(
      {
        placeId,
        fields: ['address_components', 'geometry', 'formatted_address', 'name']
      },
      (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const addressComponents = place.address_components || [];
          let city = '';

          for (const component of addressComponents) {
            if (component.types.includes('locality')) {
              city = component.long_name;
              break;
            } else if (component.types.includes('administrative_area_level_2')) {
              city = component.long_name;
            }
          }

          const location = {
            address: place.formatted_address || place.name || '',
            city: city,
            lat: place.geometry.location?.lat() || 0,
            lng: place.geometry.location?.lng() || 0
          };

          setInputValue(location.address);
          onLocationSelect(location);
          setShowDropdown(false);
          setPredictions([]);
        }
      }
    );
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin z-10" />
      )}
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder || "Search for mall, street, landmark..."}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => {
          if (predictions.length > 0) {
            setShowDropdown(true);
          }
        }}
        className="pl-10 pr-10"
        autoComplete="off"
      />
      
      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg"
        >
          <ScrollArea className="max-h-[300px]">
            <div className="p-2">
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  onClick={() => handleSelectPlace(prediction.place_id)}
                  className="w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors flex items-start gap-2"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {prediction.structured_formatting.main_text}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
