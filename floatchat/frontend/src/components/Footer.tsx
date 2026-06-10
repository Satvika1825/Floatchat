import { Link } from "react-router-dom";
import { Waves, Github, Twitter, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Data Explorer", href: "/explorer" },
    { name: "Visualizations", href: "/visualizations" },
    { name: "Resources", href: "/resources" },
    { name: "About", href: "/about" },
  ];

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "/contact", label: "Contact" }
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-ocean">
                <Waves className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">FloatChat</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Discover oceanographic insights through AI-powered conversations with ARGO float data. 
              Making ocean science accessible to everyone.
            </p>
            <p className="text-sm text-muted-foreground">
              Powered by <span className="text-primary font-semibold">ARGO Float Network</span> • 
              Built with <span className="text-accent font-semibold">Google ADK</span>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  to={social.href}
                  className="p-2 rounded-lg bg-muted hover:bg-ocean transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 FloatChat. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Ocean data courtesy of the International ARGO Program
          </p>
        </div>
      </div>
    </footer>
  );
};
