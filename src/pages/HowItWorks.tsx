import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import {
  Upload,
  Search,
  Shield,
  MessageSquare,
  CheckCircle,
  Award,
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Post Found Item",
      description:
        "Found something valuable? Post details about the item including location, description, and clear photos to help the owner identify it.",
      details: [
        "Upload clear photos of the item",
        "Provide accurate location where it was found",
        "Add detailed description with identifying features",
        "Choose your preferred contact method",
      ],
    },
    {
      icon: Search,
      title: "Search & Discover",
      description:
        "Lost something? Search our database by location and category. Filter by date and area to find items that match your lost belongings.",
      details: [
        "Search by location and category",
        "Filter by date range",
        "View detailed item descriptions",
        "Browse through available items",
      ],
    },
    {
      icon: Shield,
      title: "Verify Ownership",
      description:
        "To prevent fraud, we require the claimant to provide proof of ownership through our secure 5-step verification process.",
      details: [
        "Submit bill/receipt of the product",
        "Describe specific identification marks",
        "Provide photos with the product",
        "Share additional proof of ownership",
        "Answer security questions",
      ],
    },
    {
      icon: MessageSquare,
      title: "Connect & Chat",
      description:
        "Once verification is approved, use our secure chat to arrange a safe meeting point and return process with the finder.",
      details: [
        "Secure in-app chat system",
        "Discuss meeting location",
        "Coordinate return timing",
        "Negotiate reward if applicable",
      ],
    },
    {
      icon: CheckCircle,
      title: "Complete Return",
      description:
        "Meet at the agreed location, verify the item, and complete the return. You can optionally provide a reward to thank the finder.",
      details: [
        "Meet at safe, public location",
        "Verify item condition",
        "Complete the transaction",
        "Optional reward payment",
      ],
    },
    {
      icon: Award,
      title: "Rate & Review",
      description:
        "After successful return, both parties can rate each other to build trust in our community and help future transactions.",
      details: [
        "Rate the transaction experience",
        "Write a review for the other party",
        "Build your reputation score",
        "Help create a trusted community",
      ],
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Reunite with Lost Items",
    "description": "Step-by-step guide on how to find and return lost items through our secure platform",
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.description,
      "itemListElement": step.details.map((detail, i) => ({
        "@type": "HowToDirection",
        "position": i + 1,
        "text": detail
      }))
    }))
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="How It Works - Lost and Found Reunification Process"
        description="Learn how to post found items, search for lost belongings, verify ownership, and securely return items through our 6-step process. Complete guide to using our platform."
        keywords="how to find lost items, how to post found items, lost and found process, item verification, secure item return, lost item recovery guide"
        structuredData={structuredData}
      />
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              How <span className="gradient-text">It Works</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Lost and Found makes it easy to connect lost items with their owners
              through a simple, secure process
            </p>
          </div>

          {/* Process Steps */}
          <div className="max-w-5xl mx-auto space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute left-[2.75rem] top-24 w-0.5 h-full bg-gradient-to-b from-primary to-accent opacity-20" />
                )}

                <div className="glass-card rounded-xl p-6 md:p-8 hover:scale-[1.02] transition-all duration-300 glow-on-hover">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Icon & Number */}
                    <div className="flex-shrink-0">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse-glow" />
                        <div className="relative flex items-center justify-center w-full h-full rounded-xl bg-primary/10 border-2 border-primary/20">
                          <step.icon className="h-10 w-10 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
                          {index + 1}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </div>

                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="flex items-start space-x-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">
                              {detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Safety Tips */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="glass-card rounded-xl p-8 space-y-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Safety Tips</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Always meet in public, well-lit locations",
                  "Never share personal financial information",
                  "Use our in-app chat for all communications",
                  "Verify the item thoroughly before completing",
                  "Report suspicious behavior immediately",
                  "Take photos of the item during handover",
                ].map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorks;
