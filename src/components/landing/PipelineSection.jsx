import { motion } from "framer-motion";

const stages = [
  { label: "Applied", count: 1247, color: "bg-primary/20 text-primary border-primary/30" },
  { label: "Screening", count: 843, color: "bg-accent/20 text-accent border-accent/30" },
  { label: "Interview", count: 412, color: "bg-primary/20 text-primary border-primary/30" },
  { label: "Offer", count: 198, color: "bg-accent/20 text-accent border-accent/30" },
  { label: "Hired", count: 156, color: "bg-primary/20 text-primary border-primary/30" },
];

const PipelineSection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-display font-semibold text-sm tracking-widest uppercase">Pipeline</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 text-foreground">
              Track Every Stage with <span className="gradient-text">AI Precision</span>
            </h2>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              From application to offer, monitor your entire hiring funnel. 
              AI-powered Match Scores help you identify top candidates instantly, 
              reducing time-to-hire by up to 60%.
            </p>
            <div className="mt-8 glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Average Match Score</span>
                <span className="text-primary font-display font-bold text-lg">87%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "87%" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {stages.map((stage, index) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${stage.color}`}>
                    {stage.label}
                  </div>
                  <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${(stage.count / 1247) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-display font-bold text-foreground">{stage.count.toLocaleString()}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PipelineSection;
