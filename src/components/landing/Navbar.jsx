import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/landing-ui/button";

const navLinks = ["Features", "Pipeline", "Pricing", "About"];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0"
    >
      <div className="section-container flex items-center justify-between h-16">
        <span className="font-display text-xl font-bold text-foreground">
          Recruit<span className="text-primary">MS</span>
        </span>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link}
            </a>
          ))}
          <Link to="/login">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display rounded-lg">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
  className="md:hidden border-t border-border/50 bg-card/80 backdrop-blur-xl"
>
  <div className="section-container py-4 flex flex-col gap-3">
    {navLinks.map((link) => (
      <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-muted-foreground py-2">
        {link}
      </a>
    ))}
    <Link to="/login" className="w-full">
      <Button size="sm" className="bg-primary text-primary-foreground font-display rounded-lg w-full mt-2">
        Sign In
      </Button>
    </Link>
  </div>
</motion.div>
)}
</motion.nav>
);
};

export default Navbar;
