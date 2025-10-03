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

interface LocationIQResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
  };
}

const LocationSearch = ({ onLocationSelect, placeholder, value }: LocationSearchProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [predictions, setPredictions] = useState<LocationIQResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const LOCATIONIQ_API_KEY = 'pk.96a5bf877c32cb04ca7ebfdd8b613705';

  useEffect(() => {
    if (value) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
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
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(inputValue)}&countrycodes=in&limit=5&dedupe=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          setPredictions(data);
          setShowDropdown(data.length > 0);
        } else {
          setPredictions([]);
          setShowDropdown(false);
        }
      } catch (error) {
        console.error('LocationIQ API error:', error);
        setPredictions([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleSelectPlace = (result: LocationIQResult) => {
    const city = result.address.city || result.address.town || result.address.village || result.address.state || '';
    
    const location = {
      address: result.display_name,
      city: city,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };

    setInputValue(location.address);
    onLocationSelect(location);
    setShowDropdown(false);
    setPredictions([]);
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
                  onClick={() => handleSelectPlace(prediction)}
                  className="w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors flex items-start gap-2"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {prediction.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {prediction.display_name.split(',').slice(1).join(',')}
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
