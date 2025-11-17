import { Lock, Shield, Sparkles, Trophy } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "FHE Encryption",
    description: "Your lucky number is fully homomorphically encrypted, ensuring complete privacy during the lottery."
  },
  {
    icon: Shield,
    title: "Provably Fair",
    description: "Smart contracts guarantee tamper-proof lottery with transparent, verifiable encryption and random selection."
  },
  {
    icon: Sparkles,
    title: "Encrypted Comparison",
    description: "Winning numbers are compared in encrypted state, maintaining privacy until the lottery concludes."
  },
  {
    icon: Trophy,
    title: "Automatic Winner Selection",
    description: "Winner is automatically determined and prize pool distributed instantly when lottery ends."
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 neon-text">
            How It Works
          </h3>
          <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
            Decentralized lucky number lottery with fully homomorphic encryption
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100" />
                
                <div className="relative bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/50 transition-all h-full">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 neon-border">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <h4 className="text-xl font-orbitron font-bold mb-3 neon-text">
                    {feature.title}
                  </h4>
                  
                  <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
