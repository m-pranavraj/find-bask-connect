import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Eye } from "lucide-react";

interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  image: string;
  status?: "available" | "claimed";
}

const ItemCard = ({
  id,
  title,
  description,
  category,
  location,
  date,
  image,
  status = "available",
}: ItemCardProps) => {
  return (
    <div className="group relative glass-card rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] glow-on-hover">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Category Badge */}
        <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">
          {category}
        </Badge>

        {/* Status Badge */}
        {status === "claimed" && (
          <Badge className="absolute top-3 left-3 bg-muted/90 backdrop-blur-sm">
            Claimed
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{date}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link to={`/item/${id}`} className="block">
          <Button
            className="w-full gap-2"
            variant={status === "claimed" ? "secondary" : "default"}
            disabled={status === "claimed"}
          >
            <Eye className="h-4 w-4" />
            {status === "claimed" ? "Already Claimed" : "View Details"}
          </Button>
        </Link>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
      </div>
    </div>
  );
};

export default ItemCard;
