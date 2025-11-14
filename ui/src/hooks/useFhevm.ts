import { useState, useEffect, useCallback } from "react";
import { initializeFHEVM, encryptLuckyNumber, batchDecrypt, resetFHEVMInstance } from "../lib/fhevm";
import { BrowserProvider } from "ethers";

export function useFhevm(chainId?: number) {
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize FHEVM
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      console.log("[useFhevm] Init called, chainId:", chainId);
      setLoading(true);

      if (!chainId) {
        console.log("[useFhevm] No chainId, skipping initialization");
        setLoading(false);
        return;
      }

      // Only support local network and Sepolia
      if (chainId !== 31337 && chainId !== 11155111) {
        console.error("[useFhevm] Unsupported network:", chainId);
        setError(new Error(`Unsupported network. Please switch to local network (31337) or Sepolia (11155111).`));
        setLoading(false);
        return;
      }

      try {
        setError(null);
        console.log("[useFhevm] Starting FHEVM initialization, chainId:", chainId);

        const fhevmInstance = await initializeFHEVM(chainId);

        if (mounted) {
          setInstance(fhevmInstance);
          setLoading(false);
          console.log("[useFhevm] ✅ FHEVM initialized successfully");
        } else {
          console.log("[useFhevm] Component unmounted, skipping state update");
        }
      } catch (err: any) {
        console.error("[useFhevm] ❌ FHEVM initialization failed:", err);
        console.error("[useFhevm] Error details:", {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      console.log("[useFhevm] Cleanup, chainId:", chainId);
      mounted = false;
    };
  }, [chainId]);

  // Reset instance on network change
  useEffect(() => {
    return () => {
      resetFHEVMInstance();
    };
  }, [chainId]);

  // Encryption function for lucky number
  const encrypt = useCallback(
    async (contractAddress: string, userAddress: string, luckyNumber: number) => {
      if (!instance) {
        throw new Error("FHEVM instance not initialized");
      }
      return encryptLuckyNumber(instance, contractAddress, userAddress, luckyNumber);
    },
    [instance]
  );

  // Batch decryption function
  const decryptMultiple = useCallback(
    async (handles: { handle: string; contractAddress: string }[], userAddress: string) => {
      if (!instance) {
        throw new Error("FHEVM instance not initialized");
      }

      // Get signer from window.ethereum
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      return batchDecrypt(instance, handles, userAddress, signer, chainId);
    },
    [instance, chainId]
  );

  return {
    instance,
    loading,
    error,
    isReady: !!instance && !loading,
    encrypt,
    decryptMultiple,
  };
}
