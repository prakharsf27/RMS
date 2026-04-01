import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/landing-ui/button";
import heroBg from "@/assets/landing/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/5 blur-[100px] animate-float" style={{ animationDelay: "3s" }} />

      <div className="relative section-container text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Recruitment Platform</span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Hire Smarter</span>
            <br />
            <span className="gradient-text">with Intelligence</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A premium, data-driven platform connecting talent with opportunities through 
            automation and AI intelligence. From resume scanning to hiring pipeline — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 py-6 rounded-xl font-display font-semibold glow-border">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-border/50 text-foreground hover:bg-secondary text-base px-8 py-6 rounded-xl font-display">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto"
          >
            {[
              { value: "98%", label: "ATS Accuracy" },
              { value: "10K+", label: "Hires Made" },
              { value: "3.2s", label: "Avg. Match Time" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
