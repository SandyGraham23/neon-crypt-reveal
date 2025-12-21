import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, PartyPopper, X } from "lucide-react";
import { useChainId, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { SimpleLotteryABI } from "@/abi/SimpleLotteryABI";
import { SimpleLotteryAddresses } from "@/abi/SimpleLotteryAddresses";

interface WinnerRevealProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WinnerReveal = ({ open, onOpenChange }: WinnerRevealProps) => {
  const [phase, setPhase] = useState<"intro" | "decrypt" | "reveal" | "celebrate">("intro");
  const [displayNumber, setDisplayNumber] = useState(0);
  const chainId = useChainId();

  const contractInfo = SimpleLotteryAddresses[chainId?.toString() || "31337"];
  const contractAddress = contractInfo?.address as `0x${string}` | undefined;

  const { data: lotteryStatus } = useReadContract({
    address: contractAddress,
    abi: SimpleLotteryABI.abi,
    functionName: "getLotteryStatus",
    query: {
      enabled: !!contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  const { data: contractBalance } = useReadContract({
    address: contractAddress,
    abi: SimpleLotteryABI.abi,
    functionName: "getContractBalance",
    query: {
      enabled: !!contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  const winner = lotteryStatus ? (lotteryStatus as [boolean, string, bigint, bigint])[1] : "";
  const winningNumber = lotteryStatus ? Number((lotteryStatus as [boolean, string, bigint, bigint])[2]) : 0;
  const prizePool = contractBalance ? formatEther(contractBalance as bigint) : "0";

  useEffect(() => {
    if (!open) {
      setPhase("intro");
      setDisplayNumber(0);
      return;
    }

    // Phase transitions
    const introTimer = setTimeout(() => setPhase("decrypt"), 2000);

    return () => clearTimeout(introTimer);
  }, [open]);

  useEffect(() => {
    if (phase === "decrypt") {
      // Rapid number cycling effect
      let count = 0;
      const interval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * 99) + 1);
        count++;
        if (count > 30) {
          clearInterval(interval);
          setDisplayNumber(winningNumber);
          setPhase("reveal");
          setTimeout(() => setPhase("celebrate"), 1500);
        }
      }, 80);

      return () => clearInterval(interval);
    }
  }, [phase, winningNumber]);

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background/95 border-2 border-primary/50 overflow-hidden p-0">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative min-h-[500px] flex flex-col items-center justify-center p-8">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

          {/* Animated particles during celebration */}
          <AnimatePresence>
            {phase === "celebrate" &&
              particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  initial={{ y: "100%", x: `${particle.x}%`, opacity: 0 }}
                  animate={{ y: "-100%", opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                    repeat: Infinity,
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: `hsl(${Math.random() * 60 + 150} 100% 50%)`,
                    boxShadow: `0 0 10px hsl(${Math.random() * 60 + 150} 100% 50%)`,
                  }}
                />
              ))}
          </AnimatePresence>

          {/* Intro Phase */}
          <AnimatePresence mode="wait">
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-6"
                >
                  <Sparkles className="h-16 w-16 text-primary" />
                </motion.div>
                <h2 className="text-3xl font-orbitron font-bold neon-text mb-4">Preparing Reveal...</h2>
                <p className="text-muted-foreground font-mono">Decrypting the winning number</p>
              </motion.div>
            )}

            {/* Decrypt Phase */}
            {phase === "decrypt" && (
              <motion.div
                key="decrypt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <h2 className="text-2xl font-orbitron font-bold text-muted-foreground mb-8">Decrypting...</h2>
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px hsl(var(--primary))",
                      "0 0 60px hsl(var(--primary))",
                      "0 0 20px hsl(var(--primary))",
                    ],
                  }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-40 h-40 rounded-2xl bg-card border-4 border-primary/50"
                >
                  <span className="text-7xl font-orbitron font-black neon-text">
                    {String(displayNumber).padStart(2, "0")}
                  </span>
                </motion.div>
              </motion.div>
            )}

            {/* Reveal Phase */}
            {phase === "reveal" && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-center"
              >
                <h2 className="text-2xl font-orbitron font-bold text-accent mb-8">The Winning Number Is...</h2>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, times: [0, 0.7, 1] }}
                  className="inline-flex items-center justify-center w-48 h-48 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-accent"
                  style={{ boxShadow: "0 0 60px hsl(var(--accent))" }}
                >
                  <span
                    className="text-8xl font-orbitron font-black"
                    style={{ color: "hsl(var(--accent))", textShadow: "0 0 30px hsl(var(--accent))" }}
                  >
                    {String(winningNumber).padStart(2, "0")}
                  </span>
                </motion.div>
              </motion.div>
            )}

            {/* Celebrate Phase */}
            {phase === "celebrate" && (
              <motion.div
                key="celebrate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center relative z-10"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="mb-6"
                >
                  <Trophy
                    className="h-20 w-20 text-yellow-500 mx-auto"
                    style={{ filter: "drop-shadow(0 0 20px gold)" }}
                  />
                </motion.div>

                <motion.h2
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl font-orbitron font-bold mb-4"
                  style={{ color: "hsl(var(--accent))", textShadow: "0 0 20px hsl(var(--accent))" }}
                >
                  Congratulations!
                </motion.h2>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center gap-2">
                    <PartyPopper className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-mono text-muted-foreground">Winning Number:</span>
                    <span className="text-2xl font-orbitron font-bold neon-text">{winningNumber}</span>
                  </div>

                  <div className="bg-card/50 rounded-lg p-4 border border-primary/20">
                    <p className="text-sm text-muted-foreground font-mono mb-2">Winner Address</p>
                    <p className="font-mono text-primary break-all">{winner || "No winner yet"}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-mono">Prize Pool</p>
                    <p className="text-3xl font-orbitron font-bold text-yellow-400">{prizePool} ETH</p>
                  </div>
                </div>

                <Button onClick={() => onOpenChange(false)} className="font-orbitron neon-border">
                  Close
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
