import { useState, useEffect, useCallback } from "react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, Users, Coins, Trophy, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, RefreshCw, User, Hash } from "lucide-react";
import { useChainId, useReadContract, useBlockNumber, useAccount } from "wagmi";
import { formatEther } from "viem";
import { SimpleLotteryABI } from "@/abi/SimpleLotteryABI";
import { SimpleLotteryAddresses } from "@/abi/SimpleLotteryAddresses";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

interface ParticipantData {
  address: string;
  number: number;
  index: number;
}

function Dashboard() {
  const chainId = useChainId();
  const { address: userAddress } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [participantHistory, setParticipantHistory] = useState<{ time: string; count: number }[]>([]);
  const [prizeHistory, setPrizeHistory] = useState<{ time: string; amount: number }[]>([]);
  const [numberDistribution, setNumberDistribution] = useState<{ range: string; count: number }[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const contractInfo = SimpleLotteryAddresses[chainId?.toString() || "31337"];
  const contractAddress = contractInfo?.address as `0x${string}` | undefined;

  const { data: lotteryStatus, refetch: refetchStatus } = useReadContract({
    address: contractAddress,
    abi: SimpleLotteryABI.abi,
    functionName: "getLotteryStatus",
    query: {
      enabled: !!contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 5000,
    },
  });

  const { data: contractBalance, refetch: refetchBalance } = useReadContract({
    address: contractAddress,
    abi: SimpleLotteryABI.abi,
    functionName: "getContractBalance",
    query: {
      enabled: !!contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 5000,
    },
  });

  const { data: entryFee } = useReadContract({
    address: contractAddress,
    abi: SimpleLotteryABI.abi,
    functionName: "ENTRY_FEE",
    query: {
      enabled: !!contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  const { data: userHasParticipated } = useReadContract({
    address: contractAddress,
    abi: SimpleLotteryABI.abi,
    functionName: "hasParticipated",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!contractAddress && !!userAddress && contractAddress !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 5000,
    },
  });

  const lotteryEnded = lotteryStatus ? (lotteryStatus as [boolean, string, bigint, bigint])[0] : false;
  const winnerAddress = lotteryStatus ? (lotteryStatus as [boolean, string, bigint, bigint])[1] : "";
  const winningNumber = lotteryStatus ? Number((lotteryStatus as [boolean, string, bigint, bigint])[2]) : 0;
  const participantCount = lotteryStatus ? Number((lotteryStatus as [boolean, string, bigint, bigint])[3]) : 0;
  const prizePool = contractBalance ? formatEther(contractBalance as bigint) : "0";
  const entryFeeEth = entryFee ? formatEther(entryFee as bigint) : "0.01";
  const currentBlock = blockNumber ? Number(blockNumber) : 0;

  const fetchParticipants = useCallback(async () => {
    if (!contractAddress || participantCount === 0) {
      setParticipants([]);
      return;
    }
    try {
      const { ethers } = await import("ethers");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ethereum = (window as any).ethereum;
      const provider = ethereum
        ? new ethers.BrowserProvider(ethereum, "any")
        : new ethers.JsonRpcProvider("http://localhost:8545");

      const contract = new ethers.Contract(contractAddress, SimpleLotteryABI.abi, provider);
      const list: ParticipantData[] = [];

      for (let i = 0; i < participantCount; i++) {
        try {
          const result = await contract.getParticipant(i);
          list.push({ address: result[0], number: Number(result[1]), index: i });
        } catch (err) {
          console.error("Failed to fetch participant", i, err);
        }
      }
      setParticipants(list);

      const ranges = [
        { range: "1-20", min: 1, max: 20, count: 0 },
        { range: "21-40", min: 21, max: 40, count: 0 },
        { range: "41-60", min: 41, max: 60, count: 0 },
        { range: "61-80", min: 61, max: 80, count: 0 },
        { range: "81-99", min: 81, max: 99, count: 0 },
      ];
      list.forEach((p) => {
        const r = ranges.find((x) => p.number >= x.min && p.number <= x.max);
        if (r) r.count++;
      });
      setNumberDistribution(ranges.map((r) => ({ range: r.range, count: r.count })));
    } catch (error) {
      console.error("Failed to fetch participants:", error);
    }
  }, [contractAddress, participantCount]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setParticipantHistory((prev) => [...prev, { time: timeStr, count: participantCount }].slice(-20));
    setPrizeHistory((prev) => [...prev, { time: timeStr, amount: parseFloat(prizePool) }].slice(-20));
  }, [participantCount, prizePool]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStatus(), refetchBalance(), fetchParticipants()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const distributionData = [
    { name: "Winner Prize (85%)", value: 85, color: "hsl(180, 100%, 50%)" },
    { name: "Platform Fee (10%)", value: 10, color: "hsl(280, 100%, 60%)" },
    { name: "Reserve Fund (5%)", value: 5, color: "hsl(150, 100%, 50%)" },
  ];

  const stats = [
    { title: "Total Participants", value: participantCount.toString(), subtitle: `${(participantCount * parseFloat(entryFeeEth)).toFixed(4)} ETH collected`, trend: participantCount > 0 ? "up" : "neutral", icon: Users, color: "primary" },
    { title: "Prize Pool", value: `${parseFloat(prizePool).toFixed(4)} ETH`, subtitle: `Entry fee: ${entryFeeEth} ETH`, trend: parseFloat(prizePool) > 0 ? "up" : "neutral", icon: Coins, color: "yellow" },
    { title: "Current Block", value: currentBlock.toLocaleString(), subtitle: "Live blockchain data", trend: "up", icon: Activity, color: "accent" },
    { title: "Lottery Status", value: lotteryEnded ? "Ended" : "Active", subtitle: lotteryEnded ? `Winner: ${winningNumber}` : "Accepting entries", trend: lotteryEnded ? "down" : "up", icon: Trophy, color: lotteryEnded ? "secondary" : "primary" },
  ];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <StaggerContainer>
          <StaggerItem>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-orbitron font-bold neon-text flex items-center gap-3">
                  <BarChart3 className="h-8 w-8" />
                  Analytics Dashboard
                </h1>
                <p className="text-muted-foreground font-mono mt-2">Real-time lottery statistics from blockchain</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono">
                  <Activity className="h-3 w-3 mr-1 animate-pulse" />
                  Live Data
                </Badge>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="font-mono">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.title} whileHover={{ scale: 1.02, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-mono text-muted-foreground">{stat.title}</CardTitle>
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className={`h-4 w-4 ${stat.color === "yellow" ? "text-yellow-500" : stat.color === "accent" ? "text-accent" : stat.color === "secondary" ? "text-secondary" : "text-primary"}`} />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-orbitron font-bold ${stat.color === "yellow" ? "text-yellow-400" : "neon-text"}`}>{stat.value}</div>
                        <div className={`flex items-center gap-1 text-xs font-mono mt-1 ${stat.trend === "up" ? "text-accent" : stat.trend === "down" ? "text-secondary" : "text-muted-foreground"}`}>
                          {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : stat.trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
                          {stat.subtitle}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Participant Growth
                  </CardTitle>
                  <CardDescription className="font-mono">Live participant count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={participantHistory.length > 0 ? participantHistory : [{ time: "Now", count: participantCount }]}>
                        <defs>
                          <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(180, 100%, 50%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(180, 100%, 50%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(180, 100%, 50%, 0.1)" />
                        <XAxis dataKey="time" stroke="hsl(180, 50%, 70%)" fontSize={10} />
                        <YAxis stroke="hsl(180, 50%, 70%)" fontSize={12} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(220, 25%, 12%)", border: "1px solid hsl(180, 100%, 50%, 0.3)", borderRadius: "8px", fontFamily: "monospace" }} />
                        <Area type="monotone" dataKey="count" stroke="hsl(180, 100%, 50%)" fillOpacity={1} fill="url(#colorParticipants)" name="Participants" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    Prize Pool Growth
                  </CardTitle>
                  <CardDescription className="font-mono">Contract balance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prizeHistory.length > 0 ? prizeHistory : [{ time: "Now", amount: parseFloat(prizePool) }]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(180, 100%, 50%, 0.1)" />
                        <XAxis dataKey="time" stroke="hsl(180, 50%, 70%)" fontSize={10} />
                        <YAxis stroke="hsl(180, 50%, 70%)" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(220, 25%, 12%)", border: "1px solid hsl(180, 100%, 50%, 0.3)", borderRadius: "8px", fontFamily: "monospace" }} formatter={(value: number) => [`${value.toFixed(4)} ETH`, "Prize Pool"]} />
                        <Line type="monotone" dataKey="amount" stroke="hsl(45, 100%, 50%)" strokeWidth={2} dot={{ fill: "hsl(45, 100%, 50%)", strokeWidth: 2 }} name="ETH" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-2">
                    <Hash className="h-5 w-5 text-secondary" />
                    Number Distribution
                  </CardTitle>
                  <CardDescription className="font-mono">Selected numbers by range</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={numberDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(180, 100%, 50%, 0.1)" />
                        <XAxis dataKey="range" stroke="hsl(180, 50%, 70%)" fontSize={10} />
                        <YAxis stroke="hsl(180, 50%, 70%)" fontSize={12} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(220, 25%, 12%)", border: "1px solid hsl(180, 100%, 50%, 0.3)", borderRadius: "8px", fontFamily: "monospace" }} />
                        <Bar dataKey="count" fill="hsl(280, 100%, 60%)" radius={[4, 4, 0, 0]} name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    Prize Distribution
                  </CardTitle>
                  <CardDescription className="font-mono">Fund allocation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={distributionData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={5} dataKey="value">
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(220, 25%, 12%)", border: "1px solid hsl(180, 100%, 50%, 0.3)", borderRadius: "8px", fontFamily: "monospace" }} formatter={(value: number) => [`${value}%`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1 mt-2">
                    {distributionData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-xs font-mono">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Contract Info
                  </CardTitle>
                  <CardDescription className="font-mono">Blockchain connection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">Chain ID</span>
                    <Badge variant="outline" className="font-mono text-xs">{chainId || "N/A"}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">Block</span>
                    <span className="font-mono text-xs text-primary">{currentBlock.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">Contract</span>
                    <span className="font-mono text-xs text-muted-foreground">{contractAddress ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}` : "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">Your Status</span>
                    <Badge className={userHasParticipated ? "bg-accent/20 text-accent border-accent/30" : "bg-muted/20 text-muted-foreground"}>{userHasParticipated ? "Participating" : "Not Joined"}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">Status</span>
                    <Badge className="bg-accent/20 text-accent border-accent/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5 animate-pulse" />
                      Connected
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Card className="bg-card/50 border-primary/20">
              <CardHeader>
                <CardTitle className="font-orbitron flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Participants List ({participants.length})
                </CardTitle>
                <CardDescription className="font-mono">All lottery participants from blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground font-mono">No participants yet. Be the first to join!</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-primary/20">
                          <th className="text-left py-3 px-4 font-mono text-xs text-muted-foreground">#</th>
                          <th className="text-left py-3 px-4 font-mono text-xs text-muted-foreground">Address</th>
                          <th className="text-left py-3 px-4 font-mono text-xs text-muted-foreground">Number</th>
                          <th className="text-left py-3 px-4 font-mono text-xs text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((p, idx) => (
                          <motion.tr key={p.address} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="border-b border-primary/10 hover:bg-primary/5">
                            <td className="py-3 px-4 font-mono text-sm">{idx + 1}</td>
                            <td className="py-3 px-4 font-mono text-sm">
                              <span className={p.address.toLowerCase() === userAddress?.toLowerCase() ? "text-accent" : "text-foreground"}>
                                {p.address.slice(0, 6)}...{p.address.slice(-4)}
                                {p.address.toLowerCase() === userAddress?.toLowerCase() && <Badge className="ml-2 text-xs bg-accent/20 text-accent">You</Badge>}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-orbitron font-bold neon-text">{p.number}</span>
                            </td>
                            <td className="py-3 px-4">
                              {lotteryEnded && p.number === winningNumber ? (
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  Winner!
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">Entered</Badge>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </StaggerItem>

          {lotteryEnded && winnerAddress && (
            <StaggerItem>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <Card className="bg-gradient-to-r from-yellow-500/10 via-accent/10 to-primary/10 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-2xl font-orbitron flex items-center gap-3">
                      <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Trophy className="h-8 w-8 text-yellow-500" />
                      </motion.div>
                      Lottery Results
                    </CardTitle>
                    <CardDescription className="font-mono">The lottery has ended!</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-card/50 rounded-lg border border-yellow-500/20">
                        <p className="text-sm text-muted-foreground font-mono mb-2">Winning Number</p>
                        <p className="text-5xl font-orbitron font-black text-yellow-400" style={{ textShadow: "0 0 20px gold" }}>{winningNumber}</p>
                      </div>
                      <div className="text-center p-4 bg-card/50 rounded-lg border border-accent/20">
                        <p className="text-sm text-muted-foreground font-mono mb-2">Winner Address</p>
                        <p className="font-mono text-accent break-all">{winnerAddress.slice(0, 10)}...{winnerAddress.slice(-8)}</p>
                        {winnerAddress.toLowerCase() === userAddress?.toLowerCase() && <Badge className="mt-2 bg-accent/20 text-accent">That is You!</Badge>}
                      </div>
                      <div className="text-center p-4 bg-card/50 rounded-lg border border-primary/20">
                        <p className="text-sm text-muted-foreground font-mono mb-2">Prize Amount</p>
                        <p className="text-3xl font-orbitron font-bold neon-text">{(parseFloat(prizePool) * 0.85).toFixed(4)} ETH</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          )}
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}

export default Dashboard;
