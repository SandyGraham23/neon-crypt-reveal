# Deployment Information

## Sepolia Testnet Deployment

### SimpleLottery Contract
- **Address**: `0xF8a5Fa6229caE82d2CE1875c53e2DC6C9467C5D4`
- **Transaction Hash**: `0x8e002844d4a8e093860f2d98b0e26601a70b1c6d396c7b6c56364448a793dca1`
- **Gas Used**: 610,990
- **Initial Prize Pool**: 0.1 ETH
- **Network**: Sepolia (Chain ID: 11155111)
- **Explorer**: https://sepolia.etherscan.io/address/0xF8a5Fa6229caE82d2CE1875c53e2DC6C9467C5D4

### LuckyNumberLottery Contract (FHE Version)
- **Address**: `0xB2c0621d1DF491e22ed397c1FC73Df6Cf868d4f1`
- **Transaction Hash**: `0x53d2ea4c18e7d0b102fb6571ee48bad1559b965114a26bd32aef4512123b5bbe`
- **Gas Used**: 1,107,547
- **Initial Prize Pool**: 0.1 ETH
- **Network**: Sepolia (Chain ID: 11155111)
- **Explorer**: https://sepolia.etherscan.io/address/0xB2c0621d1DF491e22ed397c1FC73Df6Cf868d4f1

### FHECounter Contract
- **Address**: `0x60FA4e1dBaf3E739c9887D552b8A2E57dd5c64B5`
- **Transaction Hash**: `0x9b9280cce4164dd98a3cd252c23a1873625c94acda210662bd490a153aa2c3d9`
- **Gas Used**: 546,287
- **Network**: Sepolia (Chain ID: 11155111)
- **Explorer**: https://sepolia.etherscan.io/address/0x60FA4e1dBaf3E739c9887D552b8A2E57dd5c64B5

## Deployment Date
Deployed on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Next Steps

1. **Update Frontend Addresses**:
   - ✅ SimpleLottery address updated in `ui/src/abi/SimpleLotteryAddresses.ts`
   - Update LuckyNumberLottery address if needed in `ui/src/abi/LuckyNumberLotteryAddresses.ts`

2. **Verify Contracts on Etherscan** (Optional):
   ```bash
   npx hardhat verify --network sepolia 0xF8a5Fa6229caE82d2CE1875c53e2DC6C9467C5D4
   npx hardhat verify --network sepolia 0xB2c0621d1DF491e22ed397c1FC73Df6Cf868d4f1
   ```

3. **Test on Sepolia**:
   - Switch MetaMask to Sepolia network
   - Get Sepolia ETH from faucet if needed
   - Test the lottery functionality

## Security Reminder

⚠️ **IMPORTANT**: 
- The private key used for deployment should be kept secure
- Consider using a dedicated testnet wallet
- Never commit private keys to version control

