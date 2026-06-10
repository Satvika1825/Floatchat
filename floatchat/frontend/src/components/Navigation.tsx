import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Waves, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";


export const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { name: "Home", href: "/" },
    { name: "XplrOcean", href: "/explorer" },
    // { name: "Visualizations", href: "/visualizations" },
    { name: "Resources", href: "/resources" },
    { name: "About", href: "/about" },

  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-lg ">
                <img src={logo} alt="FloatChat Logo" className="w-12 h-12 object-contain" />
              </div>
              <span className="text-2xl font-extrabold" style={{ color: "#0077be", fontFamily: "'Pacifico', cursive" }}>
                FloatChat
              </span>
            </Link>


          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button className="hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
