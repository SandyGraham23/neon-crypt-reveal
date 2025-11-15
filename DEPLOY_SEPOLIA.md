# Deploy to Sepolia Testnet

## Prerequisites

1. **Private Key**: Your wallet private key (keep it secure!)
2. **Sepolia ETH**: You need Sepolia testnet ETH to pay for gas fees
3. **RPC Endpoint**: Infura API key (optional, will use public RPC if not provided)

## Deployment Steps

### Method 1: Using Environment Variable (Recommended)

1. **Set the private key as environment variable:**

   **Windows PowerShell:**
   ```powershell
   $env:PRIVATE_KEY="c178b2b488c4e41a6ab710d225cbf3cd5603c5bc0f109919be89cef4d91caba4"
   ```

   **Windows CMD:**
   ```cmd
   set PRIVATE_KEY=c178b2b488c4e41a6ab710d225cbf3cd5603c5bc0f109919be89cef4d91caba4
   ```

   **Linux/Mac:**
   ```bash
   export PRIVATE_KEY=c178b2b488c4e41a6ab710d225cbf3cd5603c5bc0f109919be89cef4d91caba4
   ```

2. **Optional: Set Infura API Key (for better RPC reliability):**
   ```powershell
   $env:INFURA_API_KEY="your_infura_api_key"
   ```

3. **Deploy the contract:**
   ```bash
   cd neon-crypt-reveal
   npx hardhat deploy --network sepolia
   ```

4. **After deployment, update the contract address:**
   - Copy the deployed contract address from the console output
   - Update `ui/src/abi/SimpleLotteryAddresses.ts` with the new address for chain ID `11155111`

### Method 2: Using Hardhat Vars

1. **Set up Hardhat vars:**
   ```bash
   npx hardhat vars set PRIVATE_KEY
   # Enter your private key when prompted
   ```

2. **Deploy:**
   ```bash
   npx hardhat deploy --network sepolia
   ```

## Verify Deployment

After deployment, you can verify the contract on Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Update Frontend

After successful deployment, update the contract address in:

`ui/src/abi/SimpleLotteryAddresses.ts`

```typescript
"11155111": { // Sepolia testnet
  address: "0x<YOUR_DEPLOYED_ADDRESS>"
}
```

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit your private key to git
- The `.gitignore` file already excludes `.env` files
- Consider using a dedicated testnet wallet with limited funds
- After deployment, consider rotating or removing the private key from your environment

## Troubleshooting

### Insufficient Funds
If you get "insufficient funds" error:
- Get Sepolia ETH from a faucet: https://sepoliafaucet.com/
- Check your wallet balance on Sepolia

### RPC Errors
If you encounter RPC errors:
- Set `INFURA_API_KEY` environment variable
- Or use `SEPOLIA_RPC_URL` to specify a custom RPC endpoint

### Network Issues
- Ensure you're connected to the internet
- Check if the RPC endpoint is accessible
- Try using a different RPC endpoint

