import heroBg from "@/assets/hero-bg.png";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onStartLottery: () => void;
}

export const Hero = ({ onStartLottery }: HeroProps) => {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-5xl md:text-7xl font-orbitron font-black mb-6 neon-text animate-fade-in">
          Encrypt. Compete. Win.
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto font-mono animate-fade-in">
          Submit your encrypted lucky number and compete for the prize pool.
          Provably fair lottery with FHE encryption technology.
        </p>
        <div className="flex gap-4 justify-center animate-fade-in">
          <Button
            size="lg"
            className="px-8 py-6 font-orbitron font-bold neon-border hover:scale-105 transition-transform"
            onClick={onStartLottery}
          >
            Enter Lottery
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 font-orbitron font-bold hover:scale-105 transition-all neon-border"
            onClick={scrollToFeatures}
          >
            How It Works
          </Button>
        </div>
      </div>
    </section>
  );
};
