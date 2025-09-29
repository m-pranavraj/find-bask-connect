import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
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

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with real data later
  const mockItems = [
    {
      id: "1",
      title: "iPhone 13 Pro",
      description:
        "Found a black iPhone 13 Pro with a cracked screen protector but the phone is in good condition.",
      category: "Electronics",
      location: "Waltair Junction, Vizag",
      date: "4/15/2025",
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800",
      status: "available" as const,
    },
    {
      id: "2",
      title: "Brown Leather Wallet",
      description:
        "Found a brown leather wallet with some cards and cash. No ID visible.",
      category: "Wallets & Purses",
      location: "MG Road, Bangalore",
      date: "4/12/2025",
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
      status: "available" as const,
    },
    {
      id: "3",
      title: "Car Keys with Honda Remote",
      description:
        "Found a set of car keys with Honda remote and a small keychain.",
      category: "Keys",
      location: "Jubilee Hills, Hyderabad",
      date: "4/10/2025",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      status: "claimed" as const,
    },
    {
      id: "4",
      title: "Black Backpack",
      description:
        "Found a black backpack containing books and a laptop near the metro station.",
      category: "Bags",
      location: "Connaught Place, Delhi",
      date: "4/14/2025",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
      status: "available" as const,
    },
  ];

  const categories = [
    "All Categories",
    "Electronics",
    "Wallets & Purses",
    "Keys",
    "Bags",
    "Documents",
    "Jewelry",
    "Other",
  ];

  const locations = [
    "All Locations",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Vizag",
  ];

  const timeFrames = ["All Time", "Last 7 days", "Last 30 days", "Last 3 months"];

  return (
    <div className="min-h-screen bg-background dark">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Search <span className="gradient-text">Lost & Found Items</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Looking for something you lost? Search through items that have been
              found.
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
                  <Select defaultValue="all-categories">
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat.toLowerCase().replace(/ /g, "-")}
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Location Filter */}
                  <Select defaultValue="all-locations">
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem
                          key={loc}
                          value={loc.toLowerCase().replace(/ /g, "-")}
                        >
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Time Filter */}
                  <Select defaultValue="all-time">
                    <SelectTrigger>
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeFrames.map((time) => (
                        <SelectItem
                          key={time}
                          value={time.toLowerCase().replace(/ /g, "-")}
                        >
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Search Button */}
                  <Button className="lg:col-span-3 btn-hero gap-2">
                    <SearchIcon className="h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Results */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Available Items{" "}
                    <span className="text-muted-foreground text-lg font-normal">
                      ({mockItems.filter((i) => i.status === "available").length}{" "}
                      items)
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockItems
                    .filter((item) => item.status === "available")
                    .map((item) => (
                      <ItemCard key={item.id} {...item} />
                    ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="claimed" className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Claimed Items{" "}
                    <span className="text-muted-foreground text-lg font-normal">
                      ({mockItems.filter((i) => i.status === "claimed").length}{" "}
                      items)
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockItems
                    .filter((item) => item.status === "claimed")
                    .map((item) => (
                      <ItemCard key={item.id} {...item} />
                    ))}
                </div>
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
