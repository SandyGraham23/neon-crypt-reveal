// FHEVM SDK utilities for Lucky Number Lottery frontend
import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers";

// Import fhevmjs for frontend FHE operations
import { FHEVM, createFHEVMInstance } from "fhevmjs";

let fhevmInstance: any = null;

// Import @fhevm/mock-utils for localhost mock FHEVM
let MockFhevmInstance: any = null;
let userDecryptHandleBytes32: any = null;

export interface EncryptedInput {
  handles: string[];
  inputProof: string;
}

export enum FhevmType {
  euint8 = 0,
  euint16 = 1,
  euint32 = 2,
  euint64 = 3,
  euint128 = 4,
  euint256 = 5,
}


/**
 * Initialize FHEVM instance
 * Local network (31337): Uses @fhevm/mock-utils + Hardhat plugin
 * Sepolia (11155111): Uses @zama-fhe/relayer-sdk
 */
export async function initializeFHEVM(chainId?: number): Promise<any> {
  if (!fhevmInstance) {
    // Check window.ethereum
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("window.ethereum is not available. Please install MetaMask.");
    }

    // Get chainId first
    let currentChainId = chainId;
    if (!currentChainId) {
      try {
        const chainIdHex = await (window as any).ethereum.request({ method: "eth_chainId" });
        currentChainId = parseInt(chainIdHex, 16);
      } catch (error) {
        console.error("[FHEVM] Failed to get chainId:", error);
        currentChainId = 31337;
      }
    }

    console.log("[FHEVM] Current chain ID:", currentChainId);

    // Local network: Use Mock FHEVM
    if (currentChainId === 31337) {
      const localhostRpcUrl = "http://localhost:8545";

      try {
        console.log("[FHEVM] Fetching FHEVM metadata from Hardhat node...");
        const provider = new JsonRpcProvider(localhostRpcUrl);
        const metadata = await provider.send("fhevm_relayer_metadata", []);

        console.log("[FHEVM] Metadata:", metadata);

        if (metadata && metadata.ACLAddress && metadata.InputVerifierAddress && metadata.KMSVerifierAddress) {
          // Use @fhevm/mock-utils to create mock instance
          if (!MockFhevmInstance || !userDecryptHandleBytes32) {
            const mockUtils = await import("@fhevm/mock-utils");
            MockFhevmInstance = mockUtils.MockFhevmInstance;
            userDecryptHandleBytes32 = mockUtils.userDecryptHandleBytes32;
            console.log("[FHEVM] ✅ Loaded mock-utils:", {
              hasMockInstance: !!MockFhevmInstance,
              hasDecryptFunc: !!userDecryptHandleBytes32
            });
          }

          console.log("[FHEVM] Creating MockFhevmInstance with addresses:", {
            ACL: metadata.ACLAddress,
            InputVerifier: metadata.InputVerifierAddress,
            KMSVerifier: metadata.KMSVerifierAddress,
          });

          const mockInstance = await MockFhevmInstance.create(provider, provider, {
            aclContractAddress: metadata.ACLAddress,
            chainId: 31337,
            gatewayChainId: 55815,
            inputVerifierContractAddress: metadata.InputVerifierAddress,
            kmsContractAddress: metadata.KMSVerifierAddress,
            verifyingContractAddressDecryption: "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
            verifyingContractAddressInputVerification: "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
          });

          fhevmInstance = mockInstance;
          console.log("[FHEVM] Mock FHEVM instance created successfully!");
          return mockInstance;
        } else {
          throw new Error("FHEVM metadata is incomplete");
        }
      } catch (error: any) {
        console.error("[FHEVM] Failed to create Mock instance:", error);
        throw new Error(
          `Local Hardhat node FHEVM initialization failed: ${error.message}\n\n` +
          `Please ensure:\n` +
          `1. Hardhat node is running (npx hardhat node)\n` +
          `2. @fhevm/hardhat-plugin is imported in hardhat.config.ts\n` +
          `3. Restart Hardhat node and retry`
        );
      }
    }

    else {
      throw new Error(`Unsupported network (Chain ID: ${currentChainId}). Only local network (31337) is supported for now.`);
    }
  }

  return fhevmInstance;
}

/**
 * Encrypt lucky number input
 */
export async function encryptLuckyNumber(
  fhevm: any,
  contractAddress: string,
  userAddress: string,
  luckyNumber: number
): Promise<EncryptedInput> {
  try {
    console.log(`[FHEVM] Encrypting lucky number: ${luckyNumber}`);

    // For mock FHEVM, create encrypted input
    const encryptedInput = fhevm.createEncryptedInput(contractAddress, userAddress).add8(luckyNumber);
    const encrypted = await encryptedInput.encrypt();

    // Convert handles to proper format
    const handles = encrypted.handles.map((handle: any) => {
      const hexHandle = ethers.hexlify(handle);
      if (hexHandle.length < 66) {
        const padded = hexHandle.slice(2).padStart(64, '0');
        return `0x${padded}`;
      }
      if (hexHandle.length > 66) {
        return hexHandle.slice(0, 66);
      }
      return hexHandle;
    });

    return {
      handles,
      inputProof: ethers.hexlify(encrypted.inputProof),
    };
  } catch (error: any) {
    console.error("[FHEVM] Encryption failed:", error);
    throw new Error(`Encryption failed: ${error.message || "Unknown error"}`);
  }
}

/**
 * Batch decrypt multiple handles
 */
export async function batchDecrypt(
  fhevm: any,
  handles: { handle: string; contractAddress: string }[],
  userAddress: string,
  signer: any,
  chainId?: number
): Promise<Record<string, number>> {
  console.log("[FHEVM] 🔓 Batch decrypting", handles.length, "handles...");

  if (handles.length === 0) {
    return {};
  }

  // Only support local network for now
  if (chainId !== 31337) {
    console.warn("[FHEVM] Only local network decryption is supported");
    return {};
  }

  // Filter out invalid handles
  const validHandles = handles.filter(h => {
    const handleStr = String(h.handle);
    const isValid = handleStr &&
                   handleStr !== "0x" &&
                   handleStr.length === 66 &&
                   handleStr !== "0x0000000000000000000000000000000000000000000000000000000000000000" &&
                   /^0x[0-9a-fA-F]{64}$/.test(handleStr);

    if (!isValid) {
      console.warn("[FHEVM] ❌ Invalid handle:", handleStr);
    }

    return isValid;
  });

  if (validHandles.length === 0) {
    console.error("[FHEVM] ❌ No valid handles to decrypt");
    return {};
  }

  try {
    console.log("[FHEVM] Using local network decryption");

    if (!userDecryptHandleBytes32) {
      // Try to import mock utils
      try {
        const mockUtils = await import("@fhevm/mock-utils");
        userDecryptHandleBytes32 = mockUtils.userDecryptHandleBytes32;
      } catch (error: any) {
        console.error("[FHEVM] Failed to import mock utils:", error);
      }
    }


    const provider = new JsonRpcProvider("http://localhost:8545");
    const decrypted: Record<string, number> = {};

    for (const h of validHandles) {
      try {
        console.log(`[FHEVM] Decrypting handle: ${h.handle.slice(0, 20)}...`);

        const value = await userDecryptHandleBytes32(
          provider,
          signer,
          h.contractAddress,
          h.handle,
          userAddress
        );

        decrypted[h.handle] = Number(value);
        console.log(`[FHEVM] ✅ Decrypted: ${value}`);
      } catch (error: any) {
        console.error(`[FHEVM] ❌ Failed to decrypt ${h.handle}:`, error.message);
      }
    }

    return decrypted;
  } catch (error: any) {
    console.error("[FHEVM] Batch decrypt failed:", error);
    throw error;
  }
}

/**
 * Reset FHEVM instance
 */
export function resetFHEVMInstance() {
  fhevmInstance = null;
  console.log("[FHEVM] Instance reset");
}
