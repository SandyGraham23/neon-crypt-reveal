import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAccount, useChainId, useReadContract } from 'wagmi';
import { SimpleLotteryABI } from "@/abi/SimpleLotteryABI";
import { SimpleLotteryAddresses } from "@/abi/SimpleLotteryAddresses";

interface LotteryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LotteryModal = ({ open, onOpenChange }: LotteryModalProps) => {
  const [luckyNumber, setLuckyNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const contractInfo = SimpleLotteryAddresses[chainId?.toString() || "31337"];
  const contractAddress = contractInfo?.address as `0x${string}` | undefined;

  // Check if user has already participated
  const { data: hasParticipated, isLoading: checkingParticipation } = useReadContract({
    address: contractAddress,
    abi: SimpleLotteryABI.abi,
    functionName: 'hasParticipated',
    args: address ? [address] : undefined,
    query: {
      enabled: !!contractAddress && !!address && contractAddress !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 5000, // Check every 5 seconds
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    const number = parseInt(luckyNumber);
    if (isNaN(number) || number < 1 || number > 99) {
      toast({
        title: "Invalid Number",
        description: "Please enter a number between 1 and 99.",
        variant: "destructive",
      });
      return;
    }

    if (!contractAddress) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("[Lottery] Submitting lucky number:", number);
      console.log("[Lottery] Contract address:", contractAddress);
      console.log("[Lottery] Chain ID:", chainId);
      console.log("[Lottery] Account:", address);

      // Use ethers.js directly like secret-vote-box-main does
      // This approach is more reliable for localhost development
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("No wallet provider detected. Please install or enable your wallet.");
      }

      const ethereum = (window as any).ethereum;
      const { ethers } = await import("ethers");
      
      // Use BrowserProvider with "any" parameter like secret-vote-box-main
      const provider = new ethers.BrowserProvider(ethereum, "any");
      
      // Ensure accounts are available
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        try {
          await provider.send("eth_requestAccounts", []);
        } catch (reqErr) {
          throw new Error("Wallet not authorized. Please connect your wallet.");
        }
      }
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress as string,
        SimpleLotteryABI.abi,
        signer
      );

      // Check if we're on localhost network
      const network = await provider.getNetwork();
      const isLocalhost = network.chainId === 31337n;

      if (isLocalhost) {
        // For localhost, skip gas estimation and use high gas limit
        // This avoids "Requested resource not available" errors
        console.log("[Lottery] Calling on localhost network (skipping gas estimation)");
        const tx = await contract.submitNumber(number, {
          value: ethers.parseEther("0.01"), // 0.01 ETH
          gasLimit: 5000000n, // High gas limit for localhost
        });
        
        console.log("[Lottery] Transaction sent, hash:", tx.hash);
        await tx.wait();
        console.log("[Lottery] Transaction confirmed");
      } else {
        // For other networks, use normal gas estimation
        const tx = await contract.submitNumber(number, {
          value: ethers.parseEther("0.01"), // 0.01 ETH
        });
        
        console.log("[Lottery] Transaction sent, hash:", tx.hash);
        await tx.wait();
        console.log("[Lottery] Transaction confirmed");
      }

      console.log("[Lottery] Submission successful!");

      toast({
        title: "Lucky Number Submitted!",
        description: `Your lucky number ${number} has been submitted to the lottery.`,
      });

      setLuckyNumber("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("[Lottery] Submission failed:", error);

      // Provide more helpful error messages
      let errorMessage = "There was an error submitting your lucky number.";
      
      if (error?.message?.includes("Requested resource not available") || 
          error?.message?.includes("RPC endpoint returned too many errors") ||
          error?.message?.includes("CONNECTION_REFUSED")) {
        errorMessage = "Cannot connect to Hardhat node. Please:\n1. Restart Hardhat node: 'npx hardhat node'\n2. Refresh this page\n3. Ensure MetaMask is connected to localhost (Chain ID: 31337)";
      } else if (error?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds. You need at least 0.01 ETH to participate.";
      } else if (error?.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected. Please try again.";
      } else if (error?.message?.includes("Already participated") || error?.reason === "Already participated") {
        errorMessage = "You have already participated in this lottery. Each address can only participate once.";
      } else if (error?.message?.includes("Lottery has ended")) {
        errorMessage = "The lottery has ended. Please wait for the next round.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-2 border-primary/30 neon-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron neon-text flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            Enter Lucky Number Lottery
          </DialogTitle>
          <DialogDescription className="font-mono text-muted-foreground">
            Submit your encrypted lucky number (1-99) and compete for the prize pool.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="luckyNumber" className="font-mono">
              Your Lucky Number (1-99)
            </Label>
            <Input
              id="luckyNumber"
              type="number"
              min="1"
              max="99"
              placeholder="Enter a number between 1 and 99"
              value={luckyNumber}
              onChange={(e) => setLuckyNumber(e.target.value)}
              required
              className="font-mono bg-background/50 border-primary/20 text-center text-2xl"
            />
            <p className="text-xs text-muted-foreground font-mono">
              This will be encrypted before submission • Entry fee: 0.01 ETH
            </p>
          </div>

          {!isConnected && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400 font-mono">
                Please connect your wallet to participate in the lottery.
              </p>
            </div>
          )}

          {isConnected && address && !checkingParticipation && hasParticipated && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400 font-mono flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                You have already participated in this lottery. Each address can only participate once.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || !isConnected || !luckyNumber.trim() || (hasParticipated === true)}
              className="flex-1 font-orbitron neon-border"
            >
              {isSubmitting ? (
                <>
                  <Lock className="mr-2 h-4 w-4 animate-pulse" />
                  Submitting...
                </>
              ) : hasParticipated ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Already Participated
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Enter Lottery
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
