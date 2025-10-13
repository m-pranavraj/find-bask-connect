import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import LocationSearch from "@/components/LocationSearch";

const Organizations = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    address: "",
    city: "",
    latitude: null as number | null,
    longitude: null as number | null,
    radius_meters: 500,
    contact_email: "",
    contact_phone: "",
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading organizations",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLocationSelect = (location: any) => {
    setFormData({
      ...formData,
      city: location.city,
      address: location.display_name,
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register an organization",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('organizations')
        .insert({
          ...formData,
          is_verified: false, // Admin will verify
        });

      if (error) throw error;

      toast({
        title: "Registration Submitted!",
        description: "Your organization will be reviewed by our admin team.",
      });

      setShowForm(false);
      setFormData({
        name: "",
        type: "",
        address: "",
        city: "",
        latitude: null,
        longitude: null,
        radius_meters: 500,
        contact_email: "",
        contact_phone: "",
      });
      loadOrganizations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Organizations</h1>
              <p className="text-muted-foreground">
                Register your mall, college, or institution for private lost & found
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="btn-hero">
              <Building2 className="h-4 w-4 mr-2" />
              {showForm ? 'Cancel' : 'Register Organization'}
            </Button>
          </div>

          {showForm && (
            <Card className="glass-card p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-6">Register Your Organization</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      placeholder="ABC Mall / XYZ University"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mall">Mall</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="airport">Airport</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Location *</Label>
                    <LocationSearch onLocationSelect={handleLocationSelect} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="admin@organization.com"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone *</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      placeholder="+91 1234567890"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="radius">Access Radius (meters)</Label>
                    <Input
                      id="radius"
                      type="number"
                      min="100"
                      max="5000"
                      value={formData.radius_meters}
                      onChange={(e) => setFormData({ ...formData, radius_meters: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Users within this radius can access your organization's lost & found
                    </p>
                  </div>
                </div>

                <Button type="submit" className="btn-hero" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </Button>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="glass-card p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg">{org.name}</h3>
                      <Badge variant="outline" className="mt-1">
                        {org.type}
                      </Badge>
                    </div>
                  </div>
                  {org.is_verified && (
                    <Badge className="bg-green-500">Verified</Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{org.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span>{org.contact_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{org.contact_phone}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/search?org=${org.id}`)}
                >
                  View Items
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Organizations;
