import { Link } from "react-router-dom";
import { Search, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    platform: [
      { label: "How It Works", path: "/how-it-works" },
      { label: "Post Found Item", path: "/post-item" },
      { label: "Search Items", path: "/search" },
      { label: "Success Stories", path: "/success-stories" },
    ],
    legal: [
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Service", path: "/terms" },
      { label: "Cookie Policy", path: "/cookies" },
      { label: "FAQ", path: "/faq" },
    ],
  };

  return (
    <footer className="relative border-t border-border/50 bg-card/50 backdrop-blur-xl mt-20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <Search className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold gradient-text">Find & Bask</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Reuniting people with their belongings across India. Building a more helpful community together.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a href="#" className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a href="#" className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a href="#" className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>support@findandbask.in</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>+91 1800-123-4567</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Serving all major cities across India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2025 Find & Bask. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with ❤️ for India
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-primary -bottom-48 -left-48 animate-pulse-glow" />
        <div className="orb w-96 h-96 bg-accent -bottom-48 -right-48 animate-pulse-glow animation-delay-2000" />
      </div>
    </footer>
  );
};

export default Footer;
