import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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
import { Upload, MapPin, Calendar, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PostItem = () => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Item Posted Successfully!",
      description: "Your found item has been posted and is now searchable.",
    });
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
    <div className="min-h-screen bg-background dark">
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
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>
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
                  required
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianCities.map((city) => (
                        <SelectItem key={city} value={city.toLowerCase()}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Specific Area *</Label>
                  <Input
                    id="area"
                    placeholder="e.g., Waltair Junction, MG Road"
                    required
                  />
                </div>
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
                <Select>
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
              <Button type="submit" size="lg" className="btn-hero flex-1 gap-2">
                <Upload className="h-5 w-5" />
                Post Found Item
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            {/* Info Box */}
            <div className="glass-card rounded-xl p-6 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
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
