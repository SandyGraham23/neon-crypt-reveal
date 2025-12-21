import heroBg from "@/assets/hero-bg.png";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Shield, Lock } from "lucide-react";

interface HeroProps {
  onStartLottery: () => void;
}

export const Hero = ({ onStartLottery }: HeroProps) => {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

      {/* Animated background elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Floating icons */}
        <div className="flex justify-center gap-8 mb-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-4 rounded-xl bg-primary/10 border border-primary/30"
          >
            <Lock className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            className="p-4 rounded-xl bg-secondary/10 border border-secondary/30"
          >
            <Sparkles className="h-8 w-8 text-secondary" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            className="p-4 rounded-xl bg-accent/10 border border-accent/30"
          >
            <Shield className="h-8 w-8 text-accent" />
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-orbitron font-black mb-6 neon-text"
        >
          Encrypt. Compete. Win.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto font-mono"
        >
          Submit your encrypted lucky number and compete for the prize pool. Provably fair lottery with FHE encryption
          technology.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" className="px-8 py-6 font-orbitron font-bold neon-border" onClick={onStartLottery}>
              Enter Lottery
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 font-orbitron font-bold neon-border"
              onClick={scrollToFeatures}
            >
              How It Works
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
