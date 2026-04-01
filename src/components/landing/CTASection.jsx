import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/landing-ui/button";

const CTASection = () => {
  return (
    <section className="py-32 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-12 md:p-20 text-center relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          
          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Transform Your <span className="gradient-text">Hiring Process?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
              Join thousands of companies using AI-driven recruitment to find and hire the best talent faster.
            </p>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-10 py-6 rounded-xl font-display font-semibold glow-border">
              Start Recruiting Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
