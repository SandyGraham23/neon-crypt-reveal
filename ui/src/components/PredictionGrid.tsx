import { Lock, TrendingUp } from "lucide-react";

interface PredictionSlot {
  id: string;
  title: string;
  category: string;
  participants: number;
  status: "active" | "locked" | "revealed";
}

const mockSlots: PredictionSlot[] = [
  { id: "1", title: "BTC Price > $100K", category: "Crypto", participants: 1247, status: "active" },
  { id: "2", title: "ETH Merge Q1 2024", category: "Crypto", participants: 892, status: "active" },
  { id: "3", title: "AI Breakthrough", category: "Tech", participants: 2134, status: "locked" },
  { id: "4", title: "Mars Mission 2025", category: "Space", participants: 456, status: "active" },
  { id: "5", title: "Quantum Computing", category: "Tech", participants: 1678, status: "revealed" },
  { id: "6", title: "Climate Agreement", category: "World", participants: 934, status: "active" },
  { id: "7", title: "DeFi TVL Growth", category: "Crypto", participants: 1523, status: "active" },
];

interface PredictionGridProps {
  onSelectEvent: (event: PredictionSlot) => void;
}

export const PredictionGrid = ({ onSelectEvent }: PredictionGridProps) => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-orbitron font-bold mb-4 neon-text">
            Active Prediction Markets
          </h3>
          <p className="text-muted-foreground font-mono">
            Choose an event and submit your encrypted prediction
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSlots.map((slot) => (
            <div
              key={slot.id}
              className="relative group cursor-pointer"
              onClick={() => slot.status === "active" && onSelectEvent(slot)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100" />
              
              <div className="relative bg-card border-2 border-primary/30 rounded-lg p-6 hover:border-primary transition-all neon-border">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-muted rounded-full text-xs font-mono text-foreground">
                    {slot.category}
                  </span>
                  {slot.status === "locked" && (
                    <Lock className="h-4 w-4 text-secondary" />
                  )}
                  {slot.status === "revealed" && (
                    <TrendingUp className="h-4 w-4 text-accent" />
                  )}
                </div>
                
                <h4 className="text-xl font-orbitron font-bold mb-3 neon-text">
                  {slot.title}
                </h4>
                
                <div className="flex items-center justify-between text-sm font-mono">
                  <span className="text-muted-foreground">
                    {slot.participants.toLocaleString()} predictions
                  </span>
                  <span className={`font-bold ${
                    slot.status === "active" ? "text-accent" :
                    slot.status === "locked" ? "text-secondary" :
                    "text-primary"
                  }`}>
                    {slot.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
