import { motion } from "framer-motion";
import dashboardPreview from "@/assets/landing/dashboard-preview.jpg";

const DashboardPreview = () => {
  return (
    <section className="py-20 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="glass-card p-2 md:p-3 glow-border">
            <img
              src={dashboardPreview}
              alt="RMS Dashboard showing hiring pipeline with candidate match scores and analytics"
              className="w-full rounded-xl"
              loading="lazy"
              width={1920}
              height={1080}
            />
          </div>
          {/* Glow effects */}
          <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
