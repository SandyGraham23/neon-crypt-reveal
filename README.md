# Neon Crypt Reveal - Encrypted Lucky Number Lottery

A decentralized lottery system built with Fully Homomorphic Encryption (FHE) technology, enabling users to participate in a provably fair lottery while maintaining complete privacy of their lucky numbers until the lottery concludes.

## 🎯 Live Demo

**Try it now:** [https://neon-crypt-reveal.vercel.app/](https://neon-crypt-reveal.vercel.app/)

## 📹 Demo Video

Watch the demo video to see the system in action:
[Demo Video](https://github.com/SandyGraham23/neon-crypt-reveal/blob/main/neon-crypt-reveal.mp4)

## 🌟 Features

- **🔐 Fully Homomorphic Encryption**: Lucky numbers are encrypted before submission, ensuring complete privacy
- **🎲 Provably Fair**: Smart contracts guarantee tamper-proof lottery with transparent, verifiable encryption
- **🔒 Encrypted Comparison**: Winning numbers are compared in encrypted state, maintaining privacy until lottery ends
- **⚡ Automatic Winner Selection**: Winner is automatically determined and prize pool distributed instantly
- **🌐 Web3 Integration**: Seamless integration with MetaMask and Web3 wallets

## 🏗️ Architecture

### Smart Contracts

The project includes two main contracts:

#### 1. `LuckyNumberLottery.sol` (FHE Version)
The main contract implementing Fully Homomorphic Encryption for encrypted number submission and comparison.

**Key Features:**
- Encrypted number submission (1-99)
- Encrypted winning number generation
- Homomorphic comparison of encrypted numbers
- Access control for decryption permissions

**Core Functions:**
```solidity
// Submit encrypted lucky number
function submitNumber(externalEuint8 encryptedNumber, bytes calldata inputProof) external payable

// End lottery and reveal winner
function endLottery() external

// Get lottery status
function getLotteryStatus() external view returns (bool, address, uint8, uint256)

// Get participant's encrypted data
function getParticipant(address user) external view returns (bool, euint8, ebool)
```

#### 2. `SimpleLottery.sol` (Non-FHE Version)
A simplified version for testing basic lottery functionality without encryption.

### Encryption & Decryption Logic

#### Frontend Encryption Flow

The encryption process is handled in `ui/src/lib/fhevm.ts`:

1. **FHEVM Initialization**
   ```typescript
   // Initialize FHEVM instance based on network
   const fhevmInstance = await initializeFHEVM(chainId);
   ```

2. **Number Encryption**
   ```typescript
   // Encrypt lucky number before submission
   const encryptedInput = fhevm.createEncryptedInput(contractAddress, userAddress)
     .add8(luckyNumber)
     .encrypt();
   ```

3. **Encrypted Data Structure**
   ```typescript
   interface EncryptedInput {
     handles: string[];      // Encrypted data handles
     inputProof: string;      // Zero-knowledge proof
   }
   ```

#### Smart Contract Processing

1. **Input Validation & Conversion**
   ```solidity
   // Convert external encrypted input to internal euint8
   euint8 userNumber = FHE.fromExternal(encryptedNumber, inputProof);
   ```

2. **Homomorphic Comparison**
   ```solidity
   // Compare encrypted numbers without decryption
   ebool isWinner = FHE.eq(userNumber, winningNumber);
   ```

3. **Access Control Setup**
   ```solidity
   // Grant user permission to decrypt their own data
   FHE.allow(userNumber, msg.sender);
   FHE.allow(isWinner, msg.sender);
   ```

#### Decryption Flow

1. **User Decryption**
   ```typescript
   // Decrypt user's own encrypted data
   const decryptedValue = await userDecryptHandleBytes32(
     provider,
     signer,
     contractAddress,
     encryptedHandle,
     userAddress
   );
   ```

2. **Batch Decryption**
   ```typescript
   // Decrypt multiple handles at once
   const decrypted = await batchDecrypt(
     fhevm,
     handles,
     userAddress,
     signer,
     chainId
   );
   ```

## 📁 Project Structure

```
neon-crypt-reveal/
├── contracts/              # Smart contract source files
│   ├── LuckyNumberLottery.sol  # FHE-enabled lottery contract
│   ├── SimpleLottery.sol       # Non-FHE testing contract
│   └── FHECounter.sol          # Example FHE counter contract
├── deploy/                 # Deployment scripts
│   ├── 01_deploy_lucky_number_lottery.ts
│   └── 02_deploy_simple_lottery.ts
├── tasks/                  # Hardhat custom tasks
│   ├── LuckyNumberLottery.ts
│   └── FHECounter.ts
├── test/                   # Test files
│   ├── LuckyNumberLottery.ts
│   └── FHECounter.ts
├── ui/                     # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/            # FHEVM utilities
│   │   │   └── fhevm.ts    # Encryption/decryption logic
│   │   ├── hooks/          # React hooks
│   │   └── pages/          # Page components
│   └── package.json
├── hardhat.config.ts       # Hardhat configuration
└── package.json            # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager
- **MetaMask**: Web3 wallet extension

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SandyGraham23/neon-crypt-reveal.git
   cd neon-crypt-reveal
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd ui
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY  # Optional
   ```

### Local Development

1. **Start Hardhat node**
   ```bash
   npx hardhat node
   ```

2. **Deploy contracts**
   ```bash
   npx hardhat deploy --network localhost
   ```

3. **Start frontend**
   ```bash
   cd ui
   npm run dev
   ```

4. **Connect MetaMask**
   - Network: Localhost 8545
   - Chain ID: 31337
   - Import one of the test accounts from Hardhat node output

### Deploy to Sepolia Testnet

1. **Deploy contracts**
   ```bash
   npx hardhat deploy --network sepolia
   ```

2. **Verify contracts**
   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

3. **Update frontend addresses**
   - Update contract addresses in `ui/src/abi/SimpleLotteryAddresses.ts`
   - Update contract addresses in `ui/src/abi/LuckyNumberLotteryAddresses.ts`

## 📜 Available Scripts

| Script             | Description                    |
| ------------------ | ------------------------------ |
| `npm run compile`  | Compile all contracts          |
| `npm run test`     | Run all tests                  |
| `npm run coverage` | Generate coverage report      |
| `npm run lint`     | Run linting checks             |
| `npm run clean`    | Clean build artifacts          |

### Hardhat Tasks

```bash
# Lottery tasks
npx hardhat lottery:participate --number 42
npx hardhat lottery:status
npx hardhat lottery:end
npx hardhat lottery:withdraw
```

## 🔐 Security Features

### Encryption Guarantees

1. **Input Privacy**: User numbers are encrypted client-side before submission
2. **Zero-Knowledge Proofs**: Input validation without revealing the number
3. **Homomorphic Operations**: Comparisons performed on encrypted data
4. **Access Control**: Only authorized users can decrypt their own data

### Smart Contract Security

- Entry fee validation (0.01 ETH)
- Duplicate participation prevention
- Winner-only withdrawal mechanism
- Lottery state management

## 🧪 Testing

Run the test suite:

```bash
# Local tests
npm run test

# Sepolia tests
npm run test:sepolia
```

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## 🛠️ Technology Stack

### Backend
- **Solidity**: ^0.8.24
- **Hardhat**: Development environment
- **FHEVM**: Fully Homomorphic Encryption for Ethereum
- **TypeScript**: Type-safe development

### Frontend
- **React**: UI framework
- **Vite**: Build tool
- **Wagmi**: React Hooks for Ethereum
- **RainbowKit**: Wallet connection UI
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/SandyGraham23/neon-crypt-reveal/issues)
- **FHEVM Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

## 🙏 Acknowledgments

- Built with [FHEVM](https://github.com/zama-ai/fhevm) by Zama
- Inspired by privacy-preserving blockchain applications

---

**Built with 🔐 by the Neon Crypt Reveal team**
