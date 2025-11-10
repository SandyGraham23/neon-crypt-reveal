import { createRoot } from "react-dom/client";
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { http } from 'viem';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

// Use basic config without WalletConnect for local development
// For localhost, we use a minimal transport that will fallback to MetaMask's provider
// This avoids "Requested resource not available" errors by using MetaMask's own RPC connection
const config = createConfig({
  chains: [hardhat, sepolia],
  transports: {
    // Use a minimal transport for localhost - MetaMask will handle the actual connection
    // Setting retryCount to 0 ensures quick fallback to MetaMask's provider
    [hardhat.id]: http('http://localhost:8545', {
      retryCount: 0,
      timeout: 1000, // Very short timeout to fail fast and use MetaMask
    }),
    [sepolia.id]: http(),
  },
  // Enable injected provider discovery - this allows wagmi to use MetaMask
  // MetaMask will handle the RPC connection to localhost:8545 directly via its own provider
  multiInjectedProviderDiscovery: true,
  ssr: false,
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={lightTheme({ borderRadius: "large" })}>
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
