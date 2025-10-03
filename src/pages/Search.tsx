import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ItemCard from "@/components/ItemCard";
import LocationSearch from "@/components/LocationSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search as SearchIcon, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Search = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState({ address: "", city: "", lat: 0, lng: 0 });
  const [timeFrame, setTimeFrame] = useState("all");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    "All Categories",
    "Electronics",
    "Wallets & Purses",
    "Keys",
    "Bags",
    "Documents",
    "Jewelry",
    "Clothing",
    "Other",
  ];

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading items",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('items')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      // Apply filters
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (category !== 'all') {
        query = query.eq('category', category as any);
      }

      if (locationFilter.city) {
        query = query.eq('city', locationFilter.city);
      }

      if (timeFrame !== 'all') {
        const now = new Date();
        let dateLimit = new Date();
        
        switch (timeFrame) {
          case 'last-7-days':
            dateLimit.setDate(now.getDate() - 7);
            break;
          case 'last-30-days':
            dateLimit.setDate(now.getDate() - 30);
            break;
          case 'last-3-months':
            dateLimit.setMonth(now.getMonth() - 3);
            break;
        }

        if (timeFrame !== 'all') {
          query = query.gte('created_at', dateLimit.toISOString());
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error searching items",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableItems = items.filter(item => item.status === 'available');
  const claimedItems = items.filter(item => item.status === 'claimed' || item.status === 'returned');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": "Search Lost and Found Items",
    "description": "Search for lost items across India by location, category, and time frame"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Search Lost & Found Items - Find Your Lost Belongings"
        description="Search for lost items that have been found across India. Filter by location, category, and date to find your lost belongings quickly and securely."
        keywords="search lost items, find lost items, lost and found search, search found items india, find lost belongings, lost item recovery"
        structuredData={structuredData}
      />
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Search <span className="gradient-text">Lost & Found Items</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Looking for something you lost? Search through items that have been found.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="found" className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="found">Found Items</TabsTrigger>
              <TabsTrigger value="claimed">Claimed Items</TabsTrigger>
            </TabsList>

            <TabsContent value="found" className="space-y-8">
              {/* Search Filters */}
              <div className="glass-card rounded-xl p-6 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Filter className="h-6 w-6 text-primary" />
                  Search Filters
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search Input */}
                  <div className="lg:col-span-2">
                    <Input
                      placeholder="Search by item name or description"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Category Filter */}
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.slice(1).map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat.toLowerCase().replace(/ /g, '_')}
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Location Filter with Google Maps */}
                  <div className="space-y-2">
                    <LocationSearch
                      onLocationSelect={setLocationFilter}
                      placeholder="Filter by location (mall, city, etc.)"
                      value={locationFilter.address}
                    />
                    {locationFilter.city && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Filtering: {locationFilter.city}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocationFilter({ address: "", city: "", lat: 0, lng: 0 })}
                          className="text-xs h-6"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Time Filter */}
                  <Select value={timeFrame} onValueChange={setTimeFrame}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="last-7-days">Last 7 days</SelectItem>
                      <SelectItem value="last-30-days">Last 30 days</SelectItem>
                      <SelectItem value="last-3-months">Last 3 months</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Search Button */}
                  <Button 
                    className="lg:col-span-3 btn-hero gap-2"
                    onClick={handleSearch}
                    disabled={isLoading}
                  >
                    <SearchIcon className="h-4 w-4" />
                    {isLoading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {/* Results */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Available Items{" "}
                    <span className="text-muted-foreground text-lg font-normal">
                      ({availableItems.length} items)
                    </span>
                  </h2>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading items...</p>
                  </div>
                ) : availableItems.length === 0 ? (
                  <div className="text-center py-12 glass-card rounded-xl">
                    <p className="text-xl text-muted-foreground">No items found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try adjusting your search filters or check back later
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        category={item.category}
                        location={`${item.area}, ${item.city}`}
                        date={new Date(item.date_found).toLocaleDateString()}
                        image={item.image_urls[0] || 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800'}
                        status={item.status}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="claimed" className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Claimed Items{" "}
                    <span className="text-muted-foreground text-lg font-normal">
                      ({claimedItems.length} items)
                    </span>
                  </h2>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading items...</p>
                  </div>
                ) : claimedItems.length === 0 ? (
                  <div className="text-center py-12 glass-card rounded-xl">
                    <p className="text-xl text-muted-foreground">No claimed items yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {claimedItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        category={item.category}
                        location={`${item.area}, ${item.city}`}
                        date={new Date(item.date_found).toLocaleDateString()}
                        image={item.image_urls[0] || 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800'}
                        status={item.status}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;
