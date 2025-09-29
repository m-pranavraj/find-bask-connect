import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Star, Quote, Heart } from "lucide-react";

const SuccessStories = () => {
  const stories = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      item: "Diamond Wedding Ring",
      story:
        "I lost my wedding ring at a beach in Mumbai and thought I'd never see it again. Within 2 days of posting on Find & Bask, someone found it! The verification process gave me confidence, and the finder was incredibly helpful. This platform is a blessing!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      location: "Bangalore",
      item: "Laptop with Important Documents",
      story:
        "Left my laptop in an auto-rickshaw with all my work documents. Posted it here and the driver found it through the platform. The chat feature made coordination so easy. Got my laptop back within 24 hours!",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      rating: 5,
    },
    {
      name: "Anjali Mehta",
      location: "Delhi",
      item: "Lost Wallet with IDs",
      story:
        "Someone found my wallet with all my important IDs and cards near Connaught Place. The verification questions ensured only I could claim it. The finder even refused the reward money. Faith in humanity restored!",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
      rating: 5,
    },
    {
      name: "Vikram Patel",
      location: "Hyderabad",
      item: "iPhone with Family Photos",
      story:
        "Lost my iPhone with irreplaceable family photos at a metro station. Posted on Find & Bask and someone had already uploaded it! The platform made the return process smooth and secure. Highly recommended!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      rating: 5,
    },
    {
      name: "Sneha Reddy",
      location: "Chennai",
      item: "Car Keys with Documents",
      story:
        "Lost my car keys with important documents. A kind soul found them and posted on Find & Bask. The verification process was thorough but not complicated. Got everything back safely!",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400",
      rating: 5,
    },
    {
      name: "Arjun Singh",
      location: "Pune",
      item: "Backpack with Laptop",
      story:
        "Forgot my backpack in a cafe. The staff posted it on Find & Bask. The location-based search made it super easy to find. Retrieved my bag with all contents intact. Amazing platform!",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background dark">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card text-sm mb-4">
              <Heart className="h-4 w-4 text-primary" />
              <span>Real Stories from Real People</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Success <span className="gradient-text">Stories</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Read how Find & Bask has helped thousands reunite with their
              belongings across India
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
            {[
              { value: "5,000+", label: "Items Returned" },
              { value: "10,000+", label: "Happy Users" },
              { value: "50+", label: "Cities" },
              { value: "4.9/5", label: "Average Rating" },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-6 text-center space-y-2"
              >
                <div className="text-3xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {stories.map((story, index) => (
              <div
                key={index}
                className="glass-card rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-300 glow-on-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header with Image */}
                <div className="relative h-32 bg-gradient-to-br from-primary/20 to-accent/20">
                  <div className="absolute -bottom-8 left-6">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-16 h-16 rounded-full border-4 border-background object-cover"
                    />
                  </div>
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/40" />
                </div>

                {/* Content */}
                <div className="p-6 pt-12 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg">{story.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {story.location}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: story.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-primary">
                      {story.item}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "{story.story}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="max-w-3xl mx-auto mt-20 text-center space-y-6 glass-card rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Have Your Own <span className="gradient-text">Success Story</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              Share your experience and inspire others in our community
            </p>
            <button className="btn-hero px-8 py-4 rounded-xl font-semibold">
              Share Your Story
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SuccessStories;
