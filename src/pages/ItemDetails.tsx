import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  MessageSquare,
  Shield,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const ItemDetails = () => {
  const { id } = useParams();

  // Mock data - will be replaced with real data later
  const item = {
    id: id || "1",
    title: "iPhone 13 Pro",
    description:
      "Found a black iPhone 13 Pro with a cracked screen protector but the phone is in good condition. The phone was found near the railway platform. Has a black case with some stickers on it.",
    category: "Electronics",
    location: "Waltair Junction, Vizag",
    specificLocation: "Platform 2, near the waiting hall",
    date: "April 15, 2025",
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800",
    status: "available" as const,
    finderName: "Rahul Kumar",
    contactMethod: "Chat",
  };

  const verificationSteps = [
    {
      step: 1,
      title: "Product Purchase Proof",
      description:
        "Upload bill, receipt, or invoice showing purchase of the item",
    },
    {
      step: 2,
      title: "Identification Marks",
      description:
        "Describe specific marks, scratches, or unique features on the item",
    },
    {
      step: 3,
      title: "Photo Verification",
      description: "Provide old photos of yourself with the product",
    },
    {
      step: 4,
      title: "Additional Proof",
      description:
        "Serial number, IMEI (for phones), warranty cards, or packaging",
    },
    {
      step: 5,
      title: "Security Questions",
      description:
        "Answer questions about purchase date, location, and specific details",
    },
  ];

  return (
    <div className="min-h-screen bg-background dark">
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
                  src={item.image}
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
                      <Badge
                        variant={
                          item.status === "available" ? "default" : "secondary"
                        }
                      >
                        {item.status === "available" ? "Available" : "Claimed"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <h2 className="font-semibold text-lg mb-2">Description</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm">
                          Found Location
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.location}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.specificLocation}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm">Date Found</div>
                        <div className="text-sm text-muted-foreground">
                          {item.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Process */}
              <div className="glass-card rounded-xl p-6 space-y-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Verification Required</h2>
                </div>

                <p className="text-muted-foreground">
                  To claim this item, you must complete our 5-step verification
                  process to prove ownership:
                </p>

                <div className="space-y-4">
                  {verificationSteps.map((step) => (
                    <div
                      key={step.step}
                      className="flex space-x-4 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
                        {step.step}
                      </div>
                      <div>
                        <div className="font-semibold mb-1">{step.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Claim Card */}
              <div className="glass-card rounded-xl p-6 space-y-4 sticky top-24">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Found by
                  </div>
                  <div className="font-semibold">{item.finderName}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Contact Method
                  </div>
                  <div className="font-semibold">{item.contactMethod}</div>
                </div>

                <Button className="w-full btn-hero gap-2" size="lg">
                  <MessageSquare className="h-5 w-5" />
                  Start Verification Process
                </Button>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-start space-x-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      You'll be able to chat with the finder after completing
                      verification
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Safety Tips</h3>
                </div>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Meet in public places</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Verify the item thoroughly</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Use in-app chat only</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>Report suspicious activity</span>
                  </li>
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
