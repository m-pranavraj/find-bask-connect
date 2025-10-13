import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Calendar,
  MessageSquare,
  Shield,
  AlertCircle,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ItemDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);

  // Verification form state
  const [purchaseProof, setPurchaseProof] = useState<File | null>(null);
  const [identificationMarks, setIdentificationMarks] = useState("");
  const [photoProof, setPhotoProof] = useState<File[]>([]);
  const [claimantPhone, setClaimantPhone] = useState("");
  const [securityAnswers, setSecurityAnswers] = useState({
    purchaseDate: "",
    purchaseLocation: "",
    specificDetails: ""
  });

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*, profiles(full_name, phone)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setItem(data);
    } catch (error: any) {
      toast({
        title: "Error loading item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to claim this item",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files to storage
      const uploadFile = async (file: File, bucket: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        return publicUrl;
      };

      let purchaseProofUrl = '';
      if (purchaseProof) {
        purchaseProofUrl = await uploadFile(purchaseProof, 'verification-docs');
      }

      const photoUrls: string[] = [];
      for (const photo of photoProof) {
        const url = await uploadFile(photo, 'verification-docs');
        photoUrls.push(url);
      }

      // Create verification request
      const { error: insertError } = await supabase
        .from('verification_requests')
        .insert({
          item_id: id,
          claimant_id: user.id,
          purchase_proof_url: purchaseProofUrl,
          identification_marks: identificationMarks,
          photo_with_item_urls: photoUrls,
          security_answers: securityAnswers,
          claimant_phone: claimantPhone,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: "Verification request submitted!",
        description: "The finder will review your claim and get back to you soon.",
      });

      setVerificationOpen(false);
    } catch (error: any) {
      toast({
        title: "Error submitting verification",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const verificationSteps = [
    {
      step: 1,
      title: "Product Purchase Proof",
      description: "Upload bill, receipt, or invoice showing purchase of the item",
    },
    {
      step: 2,
      title: "Identification Marks",
      description: "Describe specific marks, scratches, or unique features on the item",
    },
    {
      step: 3,
      title: "Photo Verification",
      description: "Provide old photos of yourself with the product",
    },
    {
      step: 4,
      title: "Additional Proof",
      description: "Serial number, IMEI (for phones), warranty cards, or packaging",
    },
    {
      step: 5,
      title: "Security Questions",
      description: "Answer questions about purchase date, location, and specific details",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Item not found</h2>
          <Link to="/search">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <Link to="/search">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image */}
              <div className="glass-card rounded-xl overflow-hidden">
                <img
                  src={item.image_urls[0] || 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800'}
                  alt={item.title}
                  className="w-full h-96 object-cover"
                />
              </div>

              {/* Item Info */}
              <div className="glass-card rounded-xl p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold">{item.title}</h1>
                    <div className="flex items-center gap-2">
                      <Badge>{item.category}</Badge>
                      <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Location</p>
                      <p>{item.area}, {item.city}</p>
                      {item.specific_location && (
                        <p className="text-sm">{item.specific_location}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Calendar className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Date Found</p>
                      <p>{new Date(item.date_found).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>

              {/* Verification Process */}
              <div className="glass-card rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">5-Step Verification Process</h2>
                </div>

                <p className="text-muted-foreground">
                  To claim this item, you'll need to complete our secure verification
                  process to prove ownership.
                </p>

                <div className="space-y-4">
                  {verificationSteps.map((step) => (
                    <div
                      key={step.step}
                      className="flex gap-4 p-4 rounded-lg bg-secondary/20 border border-border/50"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Finder Info */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-lg">Found By</h3>
                <div className="space-y-2">
                  <p className="font-medium">{item.profiles?.full_name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">
                    Contact Method: {item.contact_method}
                  </p>
                </div>

                <Dialog open={verificationOpen} onOpenChange={setVerificationOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full btn-hero gap-2" disabled={item.status !== 'available'}>
                      <MessageSquare className="h-4 w-4" />
                      {item.status === 'available' ? 'Start Verification' : 'Item Not Available'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Claim Item - Verification Form</DialogTitle>
                      <DialogDescription>
                        Please provide proof of ownership to claim this item
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleVerificationSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label>Purchase Proof (Receipt/Bill)</Label>
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setPurchaseProof(e.target.files?.[0] || null)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Identification Marks</Label>
                        <Textarea
                          placeholder="Describe unique features, scratches, or marks..."
                          value={identificationMarks}
                          onChange={(e) => setIdentificationMarks(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Photos with Item (Optional)</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => setPhotoProof(Array.from(e.target.files || []))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Your Phone Number (for SMS notification) *</Label>
                        <Input
                          type="tel"
                          placeholder="+91 1234567890"
                          value={claimantPhone}
                          onChange={(e) => setClaimantPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Security Questions</Label>
                        <div className="space-y-2">
                          <Input
                            placeholder="Purchase Date"
                            type="date"
                            value={securityAnswers.purchaseDate}
                            onChange={(e) => setSecurityAnswers({
                              ...securityAnswers,
                              purchaseDate: e.target.value
                            })}
                            required
                          />
                          <Input
                            placeholder="Purchase Location"
                            value={securityAnswers.purchaseLocation}
                            onChange={(e) => setSecurityAnswers({
                              ...securityAnswers,
                              purchaseLocation: e.target.value
                            })}
                            required
                          />
                          <Textarea
                            placeholder="Any other specific details..."
                            value={securityAnswers.specificDetails}
                            onChange={(e) => setSecurityAnswers({
                              ...securityAnswers,
                              specificDetails: e.target.value
                            })}
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full btn-hero"
                        disabled={isSubmitting}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Submitting..." : "Submit Verification"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Safety Tips */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Safety Tips</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Provide genuine proof of ownership</li>
                  <li>Be honest in your verification details</li>
                  <li>Wait for the finder to review your claim</li>
                  <li>Meet in safe, public locations for handover</li>
                  <li>Report any suspicious behavior</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ItemDetails;
