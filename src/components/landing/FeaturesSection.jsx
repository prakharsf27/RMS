import { motion } from "framer-motion";
import { 
  LayoutDashboard, Search, GitBranch, FileText, 
  ShieldCheck, Zap 
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Intelligent Dashboard",
    description: "A high-end Command Center with personalized metrics, application tracking, and AI-curated job recommendations.",
  },
  {
    icon: Search,
    title: "Smart Job Board",
    description: "Browse, search, and filter postings with built-in application tracking that prevents duplicate submissions.",
  },
  {
    icon: GitBranch,
    title: "Hiring Pipeline",
    description: "Track candidate progression from Applied to Hired with integrated Match Score indicators at every stage.",
  },
  {
    icon: FileText,
    title: "ATS Resume Scanner",
    description: "Upload PDFs and get instant semantic ATS Scores with AI-powered analysis for resume optimization.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Profiles",
    description: "OTP verification for email and phone ensures talent authenticity and builds Identity Strength scores.",
  },
  {
    icon: Zap,
    title: "Skill Forge",
    description: "Dynamic skills management with a Quick-Add recommendation engine powered by industry intelligence.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-primary font-display font-semibold text-sm tracking-widest uppercase">Features</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 text-foreground">
            Everything You Need to <span className="gradient-text">Recruit Brilliantly</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
            An end-to-end recruitment hub with AI-driven insights for candidates and recruiters alike.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-card-hover p-8 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
