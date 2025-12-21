import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface PredictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: {
    id: string;
    title: string;
    category: string;
  };
}

export const PredictionModal = ({ open, onOpenChange, event }: PredictionModalProps) => {
  const [prediction, setPrediction] = useState("");
  const [stake, setStake] = useState("");
  const [phase, setPhase] = useState<"input" | "encrypting" | "success">("input");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhase("encrypting");

    // Simulate encryption process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setPhase("success");

    setTimeout(() => {
      toast({
        title: "Prediction Encrypted & Submitted",
        description: `Your prediction for "${event?.title}" has been encrypted and stored on-chain.`,
      });

      setPhase("input");
      setPrediction("");
      setStake("");
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-2 border-primary/30 neon-border overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === "encrypting" && (
            <motion.div
              key="encrypting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 z-10 flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <Lock className="h-16 w-16 text-secondary" />
              </motion.div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xl font-orbitron"
                style={{ color: "hsl(var(--secondary))", textShadow: "0 0 10px hsl(var(--secondary))" }}
              >
                Encrypting prediction...
              </motion.div>
              <div className="flex gap-1 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    className="w-3 h-3 rounded-full bg-secondary"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {phase === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 z-10 flex flex-col items-center justify-center"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
                <CheckCircle2 className="h-20 w-20 text-accent" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-orbitron text-accent mt-4"
              >
                Prediction Submitted!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron neon-text">Submit Encrypted Prediction</DialogTitle>
          <DialogDescription className="font-mono text-muted-foreground">
            {event?.title} - {event?.category}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prediction" className="font-mono">
              Your Prediction
            </Label>
            <Textarea
              id="prediction"
              placeholder="Enter your prediction here..."
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              required
              className="font-mono bg-background/50 border-primary/20"
              rows={4}
            />
            <p className="text-xs text-muted-foreground font-mono">This will be encrypted before submission</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stake" className="font-mono">
              Stake Amount (ETH)
            </Label>
            <Input
              id="stake"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              required
              className="font-mono bg-background/50 border-primary/20"
            />
          </div>

          <div className="flex gap-3">
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={phase !== "input"} className="w-full font-orbitron neon-border">
                {phase === "encrypting" ? (
                  <>
                    <Lock className="mr-2 h-4 w-4 animate-pulse" />
                    Encrypting...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Encrypt & Submit
                  </>
                )}
              </Button>
            </motion.div>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-orbitron">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
