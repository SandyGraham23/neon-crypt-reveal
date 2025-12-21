import { useState } from "react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { LotteryStatus } from "@/components/LotteryStatus";
import { LotteryModal } from "@/components/LotteryModal";
import { WinnerReveal } from "@/components/WinnerReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Ticket, Sparkles, Shield, Lock } from "lucide-react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { SimpleLotteryABI } from "@/abi/SimpleLotteryABI";
import { SimpleLotteryAddresses } from "@/abi/SimpleLotteryAddresses";

const Lottery = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const contractInfo = SimpleLotteryAddresses[chainId?.toString() || "31337"];
  const contractAddress = contractInfo?.address as `0x${string}` | undefined;

  const { data: lotteryStatus } = useReadContract({
    address: contractAddress,
    abi: SimpleLotteryABI.abi,
    functionName: "getLotteryStatus",
    query: {
      enabled: !!contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 5000,
    },
  });

  const lotteryEnded = lotteryStatus ? (lotteryStatus as [boolean, string, bigint, bigint])[0] : false;

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <StaggerContainer>
          {/* Page Header */}
          <StaggerItem>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 mb-6"
              >
                <Ticket className="h-10 w-10 text-primary" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 neon-text">Lucky Number Lottery</h1>
              <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
                Submit your encrypted lucky number and compete for the prize pool. Your number stays private until the
                reveal.
              </p>
            </div>
          </StaggerItem>

          {/* Lottery Status */}
          <StaggerItem>
            <LotteryStatus />
          </StaggerItem>

          {/* Action Cards */}
          <StaggerItem>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {/* Enter Lottery Card */}
              <motion.div whileHover={{ scale: 1.02, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="bg-card/50 border-primary/20 hover:border-primary/50 transition-all h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-orbitron">
                      <div className="p-2 rounded-lg bg-primary/10 neon-border">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      Enter Lottery
                    </CardTitle>
                    <CardDescription className="font-mono">Submit your encrypted lucky number (1-99)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm text-muted-foreground font-mono">
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-accent" />
                        FHE encrypted submission
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-secondary" />
                        Entry fee: 0.01 ETH
                      </li>
                    </ul>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      disabled={!isConnected || lotteryEnded}
                      className="w-full font-orbitron neon-border"
                    >
                      {!isConnected ? "Connect Wallet First" : lotteryEnded ? "Lottery Ended" : "Enter Now"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Reveal Winner Card */}
              <motion.div whileHover={{ scale: 1.02, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="bg-card/50 border-secondary/20 hover:border-secondary/50 transition-all h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-orbitron">
                      <div
                        className="p-2 rounded-lg bg-secondary/10"
                        style={{ boxShadow: "0 0 10px hsl(var(--secondary))" }}
                      >
                        <Sparkles className="h-5 w-5 text-secondary" />
                      </div>
                      Winner Reveal
                    </CardTitle>
                    <CardDescription className="font-mono">Watch the dramatic winner announcement</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground font-mono">
                      Experience the exciting moment when the winning number is decrypted and the winner is revealed
                      with stunning visual effects.
                    </p>
                    <Button
                      onClick={() => setShowReveal(true)}
                      variant="outline"
                      disabled={!lotteryEnded}
                      className="w-full font-orbitron border-secondary/50 hover:bg-secondary/10"
                    >
                      {lotteryEnded ? "View Winner Reveal" : "Waiting for Lottery End"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>

      <LotteryModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <WinnerReveal open={showReveal} onOpenChange={setShowReveal} />
    </PageTransition>
  );
};

export default Lottery;
