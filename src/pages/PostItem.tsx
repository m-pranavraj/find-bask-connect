import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import LocationSearch from "@/components/LocationSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Calendar, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const PostItem = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState({ address: "", city: "", lat: 0, lng: 0 });
  const [dateFound, setDateFound] = useState("");
  const [contactMethod, setContactMethod] = useState("chat");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to post an item",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!location.city) {
      toast({
        title: "Location required",
        description: "Please select a location using the search",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image to storage
      let imageUrl = '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Insert item into database
      const { error: insertError } = await supabase
        .from('items')
        .insert({
          title,
          category: category as any,
          description,
          city: location.city,
          area: location.address,
          specific_location: location.address,
          latitude: location.lat,
          longitude: location.lng,
          date_found: dateFound,
          image_urls: imageUrl ? [imageUrl] : [],
          contact_method: contactMethod,
          finder_id: user.id,
          status: 'available'
        });

      if (insertError) throw insertError;

      toast({
        title: "Item Posted Successfully!",
        description: "Your found item has been posted and is now searchable.",
      });

      navigate('/search');
    } catch (error: any) {
      toast({
        title: "Error posting item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Electronics",
    "Wallets & Purses",
    "Keys",
    "Bags",
    "Documents",
    "Jewelry",
    "Clothing",
    "Other",
  ];

  const indianCities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Surat",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Visakhapatnam",
    "Indore",
    "Thane",
    "Bhopal",
    "Patna",
    "Vadodara",
    "Ghaziabad",
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Post Found Item - Help Reunite Someone with Their Belongings"
        description="Found a lost item? Post details, location, and photos to help reunite it with the owner. Secure verification process ensures items return to rightful owners."
        keywords="post found item, report found item, found item listing, lost and found post, help return lost items, found property report"
      />
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Post a <span className="gradient-text">Found Item</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Help someone reunite with their belongings by posting details about
              the item you found.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="glass-card rounded-xl p-6 md:p-8 space-y-6">
              {/* Item Name */}
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  placeholder="e.g., iPhone 13 Pro, Black Wallet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat.toLowerCase().replace(/ /g, '_')}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed description including color, size, brand, condition, and any distinguishing marks..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Location with Google Maps Search */}
              <div className="space-y-2">
                <Label htmlFor="location">Location (Search with Google Maps) *</Label>
                <LocationSearch
                  onLocationSelect={setLocation}
                  placeholder="Search for mall, street, landmark, etc."
                  value={location.address}
                />
                {location.city && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {location.address}, {location.city}
                  </p>
                )}
              </div>

              {/* Date Found */}
              <div className="space-y-2">
                <Label htmlFor="dateFound">Date Found *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="dateFound"
                    type="date"
                    className="pl-10"
                    value={dateFound}
                    onChange={(e) => setDateFound(e.target.value)}
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Upload Image *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setImagePreview(null)}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="image"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PNG, JPG up to 10MB
                      </span>
                      <input
                        id="image"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Contact Preference */}
              <div className="space-y-2">
                <Label htmlFor="contactMethod">
                  Preferred Contact Method (Optional)
                </Label>
                <Select value={contactMethod} onValueChange={setContactMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">Chat Only (Recommended)</SelectItem>
                    <SelectItem value="phone">Phone Number</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  We recommend using our secure chat system to protect your
                  privacy.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                type="submit" 
                size="lg" 
                className="btn-hero flex-1 gap-2"
                disabled={isSubmitting}
              >
                <Upload className="h-5 w-5" />
                {isSubmitting ? "Posting..." : "Post Found Item"}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/search')}
              >
                Cancel
              </Button>
            </div>

            {/* Info Box */}
            <div className="glass-card rounded-xl p-6 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Important Information
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>
                  Ensure all information is accurate to help the rightful owner
                  find their item
                </li>
                <li>
                  Upload clear photos showing identifying features of the item
                </li>
                <li>
                  You will be notified when someone claims this item through the
                  verification process
                </li>
                <li>
                  Never share personal information until ownership is verified
                </li>
              </ul>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PostItem;
