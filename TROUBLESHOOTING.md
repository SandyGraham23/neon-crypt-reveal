# Troubleshooting Guide: "Requested resource not available" Error

## Problem
When submitting a transaction, you see:
```
ContractFunctionExecutionError: Requested resource not available.
RPC endpoint returned too many errors, retrying in X minutes.
```

## Root Cause
This error occurs when MetaMask has tried to send transactions through the Hardhat node too many times and failed. MetaMask stops retrying for a period of time.

## Solutions

### Solution 1: Restart Hardhat Node (Most Common Fix)

**Quick Method (Recommended):**
```powershell
# Run the restart script
cd neon-crypt-reveal
.\restart-hardhat.ps1
```

**Manual Method:**
1. **Stop the current Hardhat node:**
   - In the terminal where `npx hardhat node` is running, press `Ctrl+C`

2. **Kill any remaining processes:**
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :8545
   # Note the PID, then:
   taskkill /PID <PID> /F
   ```

3. **Restart Hardhat node:**
   ```bash
   cd neon-crypt-reveal
   npx hardhat node
   ```

4. **Wait for deployment:**
   - Wait until you see "SimpleLottery contract deployed at: 0x..."

5. **Refresh your browser:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Solution 2: Reset MetaMask Account

1. **Open MetaMask**
2. **Go to Settings → Advanced**
3. **Click "Reset Account"**
   - This clears the nonce cache and transaction history
4. **Reconnect to localhost network**

### Solution 3: Verify MetaMask Network Configuration

Ensure MetaMask is connected to the correct network:

1. **Open MetaMask**
2. **Click the network dropdown**
3. **Select "Localhost 8545" or add it manually:**
   - **Network Name**: Localhost 8545
   - **RPC URL**: `http://localhost:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
   - **Block Explorer**: (leave empty)

### Solution 4: Clear Browser Cache

1. **Open browser DevTools** (F12)
2. **Right-click the refresh button**
3. **Select "Empty Cache and Hard Reload"**

### Solution 5: Check Hardhat Node Status

Verify the Hardhat node is responding:

```bash
# Test RPC connection (PowerShell)
$body = @{
    jsonrpc = "2.0"
    method = "eth_blockNumber"
    params = @()
    id = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8545" -Method POST -Body $body -ContentType "application/json"
```

If this fails, the Hardhat node is not running correctly.

### Solution 6: Use a Different Account

Try using a different account from Hardhat's test accounts:

1. **Check Hardhat node output** for account addresses
2. **Import one of the private keys** into MetaMask
3. **Use that account** to submit transactions

## Prevention

To avoid this error in the future:

1. **Always restart Hardhat node** after making contract changes
2. **Reset MetaMask account** if you restart Hardhat node
3. **Don't spam transactions** - wait for each transaction to complete
4. **Check Hardhat node logs** for errors before submitting transactions

## Still Having Issues?

If none of these solutions work:

1. **Check Hardhat node logs** for error messages
2. **Verify contract is deployed** at the expected address
3. **Try a completely fresh setup:**
   - Stop Hardhat node
   - Clear browser cache
   - Restart Hardhat node
   - Refresh browser
   - Reset MetaMask account

