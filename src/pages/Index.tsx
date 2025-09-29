import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Search,
  Upload,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  MapPin,
  Star,
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Upload,
      title: "Post Found Item",
      description:
        "Found something valuable? Post details about the item including location, description, and photos.",
    },
    {
      icon: Search,
      title: "Search & Verify",
      description:
        "Lost something? Search by location and category, then verify your ownership through our secure process.",
    },
    {
      icon: MessageSquare,
      title: "Connect & Retrieve",
      description:
        "Chat securely with the finder, arrange a meeting point, and get your item back safely.",
    },
  ];

  const stats = [
    { icon: Users, value: "10,000+", label: "Happy Users" },
    { icon: TrendingUp, value: "5,000+", label: "Items Reunited" },
    { icon: MapPin, value: "50+", label: "Cities Covered" },
    { icon: Star, value: "4.9/5", label: "User Rating" },
  ];

  return (
    <div className="min-h-screen bg-background dark">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb w-96 h-96 bg-primary top-20 -left-48 animate-float" />
          <div className="orb w-96 h-96 bg-accent top-40 -right-48 animate-float animation-delay-2000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>Reuniting people with their belongings</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Lost Something?{" "}
              <span className="gradient-text">Find It Here.</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with people who found your lost items or report items you
              found to help others. Building a more helpful community together.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/post-item">
                <Button size="lg" className="btn-hero gap-2 w-full sm:w-auto">
                  <Upload className="h-5 w-5" />
                  Post Found Item
                </Button>
              </Link>
              <Link to="/search">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Search className="h-5 w-5" />
                  Search Lost Items
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center space-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto" />
                <div className="text-3xl md:text-4xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Simple <span className="gradient-text">Process</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find & Bask makes it easy to connect lost items with their owners
              through a simple process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all duration-300 glow-on-hover"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse-glow" />
                  <div className="relative flex items-center justify-center w-full h-full rounded-xl bg-primary/10 border border-primary/20">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/how-it-works">
              <Button variant="outline" size="lg">
                Learn More About the Process
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb w-96 h-96 bg-primary -bottom-48 left-1/4 animate-pulse-glow" />
          <div className="orb w-96 h-96 bg-accent -bottom-48 right-1/4 animate-pulse-glow" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card rounded-2xl p-8 md:p-16 text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold">
              Ready to Make a <span className="gradient-text">Difference</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of users across India who are helping reunite people
              with their belongings.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/auth">
                <Button size="lg" className="btn-hero w-full sm:w-auto">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
