import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAccount, useChainId, useReadContract } from "wagmi";
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

  const { data: hasParticipated, isLoading: checkingParticipation } = useReadContract({
    address: contractAddress,
    abi: SimpleLotteryABI.abi,
    functionName: "hasParticipated",
    args: address ? [address] : undefined,
    query: {
      enabled: !!contractAddress && !!address && contractAddress !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 5000,
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

    if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      toast({
        title: "Contract Not Deployed",
        description: "The lottery contract is not deployed on this network.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error("No wallet provider detected.");
      }

      const { ethers } = await import("ethers");
      const provider = new ethers.BrowserProvider(ethereum, "any");

      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        await provider.send("eth_requestAccounts", []);
      }

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, SimpleLotteryABI.abi, signer);

      const network = await provider.getNetwork();
      const isLocalhost = network.chainId === 31337n;

      const tx = await contract.submitNumber(number, {
        value: ethers.parseEther("0.01"),
        gasLimit: isLocalhost ? 5000000n : undefined,
      });

      await tx.wait();

      toast({
        title: "Lucky Number Submitted!",
        description: `Your lucky number ${number} has been submitted to the lottery.`,
      });

      setLuckyNumber("");
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("[Lottery] Submission failed:", error);

      let errorMessage = "There was an error submitting your lucky number.";
      const err = error as { message?: string; reason?: string };

      if (err?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds. You need at least 0.01 ETH.";
      } else if (err?.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected.";
      } else if (err?.message?.includes("Already participated") || err?.reason === "Already participated") {
        errorMessage = "You have already participated in this lottery.";
      } else if (err?.message?.includes("Lottery has ended")) {
        errorMessage = "The lottery has ended.";
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
              This will be encrypted before submission - Entry fee: 0.01 ETH
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
                You have already participated in this lottery.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || !isConnected || !luckyNumber.trim() || hasParticipated === true}
              className="flex-1 font-orbitron neon-border"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-orbitron">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
