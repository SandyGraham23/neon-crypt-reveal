import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Coins, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { SimpleLotteryABI } from "@/abi/SimpleLotteryABI";
import { SimpleLotteryAddresses } from "@/abi/SimpleLotteryAddresses";

interface LotteryStatusData {
  lotteryEnded: boolean;
  winner: string;
  winningNumber: number;
  participantCount: number;
  prizePool: string;
}

export const LotteryStatus = () => {
  const [status, setStatus] = useState<LotteryStatusData>({
    lotteryEnded: false,
    winner: "",
    winningNumber: 0,
    participantCount: 0,
    prizePool: "0.0",
  });
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();
  const chainId = useChainId();

  const contractInfo = SimpleLotteryAddresses[chainId?.toString() || "31337"];
  const contractAddress = contractInfo?.address as `0x${string}` | undefined;

  const {
    data: lotteryStatus,
    isLoading: statusLoading,
    error: statusError,
  } = useReadContract({
    address: contractAddress,
    abi: SimpleLotteryABI.abi,
    functionName: "getLotteryStatus",
    query: {
      enabled: !!contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 10000,
    },
  });

  const { data: contractBalance, isLoading: balanceLoading } = useReadContract({
    address: contractAddress,
    abi: SimpleLotteryABI.abi,
    functionName: "getContractBalance",
    query: {
      enabled: !!contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 10000,
    },
  });

  useEffect(() => {
    if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      setLoading(false);
      return;
    }

    if (statusLoading || balanceLoading) {
      setLoading(true);
      return;
    }

    if (statusError) {
      console.error("[LotteryStatus] Failed to fetch status:", statusError);
      setLoading(false);
      return;
    }

    if (lotteryStatus && contractBalance !== undefined) {
      const [lotteryEnded, winner, winningNumber, participantCount] = lotteryStatus as [
        boolean,
        string,
        bigint,
        bigint,
      ];

      setStatus({
        lotteryEnded,
        winner: winner || "",
        winningNumber: Number(winningNumber),
        participantCount: Number(participantCount),
        prizePool: formatEther(contractBalance as bigint),
      });

      setLoading(false);
    }
  }, [lotteryStatus, contractBalance, statusLoading, balanceLoading, statusError, contractAddress]);

  if (loading) {
    return (
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card/50 border-primary/20">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-3 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const statCards = [
    {
      icon: Users,
      title: "Participants",
      value: status.participantCount,
      subtitle: "Active players",
      color: "primary",
    },
    {
      icon: Coins,
      title: "Prize Pool",
      value: `${status.prizePool} ETH`,
      subtitle: "Total rewards",
      color: "yellow",
    },
    {
      icon: Trophy,
      title: "Status",
      value: status.lotteryEnded ? "Ended" : "Active",
      subtitle: "Lottery phase",
      color: "accent",
    },
    {
      icon: Clock,
      title: "Your Status",
      value: address ? "Participating" : "Not joined",
      subtitle: "Current state",
      color: "blue",
    },
  ];

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 ${
                          stat.color === "yellow"
                            ? "text-yellow-500"
                            : stat.color === "blue"
                              ? "text-blue-400"
                              : `text-${stat.color}`
                        }`}
                      />
                      {stat.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-orbitron font-bold ${
                        stat.color === "yellow"
                          ? "text-yellow-400"
                          : stat.color === "blue"
                            ? "text-blue-400"
                            : "neon-text"
                      }`}
                    >
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {status.lotteryEnded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-yellow-500/10 to-accent/10 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-xl font-orbitron flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Lottery Results
                </CardTitle>
                <CardDescription className="font-mono">Congratulations to the winner!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-muted-foreground">Winning Number:</span>
                  <span className="text-2xl font-orbitron neon-text">{status.winningNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-muted-foreground">Winner Address:</span>
                  <span className="font-mono text-sm text-accent">
                    {status.winner.slice(0, 6)}...{status.winner.slice(-4)}
                  </span>
                </div>
                {status.winner.toLowerCase() === address?.toLowerCase() && (
                  <Button className="w-full font-orbitron neon-border">Claim Your Prize!</Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  );
};
