import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lock } from "lucide-react";
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
  const [isEncrypting, setIsEncrypting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEncrypting(true);

    // Simulate encryption process
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Prediction Encrypted & Submitted",
      description: `Your prediction for "${event?.title}" has been encrypted and stored on-chain.`,
    });

    setIsEncrypting(false);
    setPrediction("");
    setStake("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-2 border-primary/30 neon-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron neon-text">
            Submit Encrypted Prediction
          </DialogTitle>
          <DialogDescription className="font-mono text-muted-foreground">
            {event?.title} • {event?.category}
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
            <p className="text-xs text-muted-foreground font-mono">
              This will be encrypted before submission
            </p>
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
            <Button
              type="submit"
              disabled={isEncrypting}
              className="flex-1 font-orbitron neon-border"
            >
              {isEncrypting ? (
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-orbitron"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
