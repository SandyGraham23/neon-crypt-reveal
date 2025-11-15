# Neon Crypt Reveal

A decentralized lottery system built with Fully Homomorphic Encryption (FHE) technology, enabling users to participate in a provably fair lottery while maintaining complete privacy of their lucky numbers. Built on Ethereum using Zama's FHEVM protocol.

## 🎯 Live Demo

**Try it now:** [https://neon-crypt-reveal.vercel.app/](https://neon-crypt-reveal.vercel.app/)

## 📹 Demo Video

**Watch the demo:** [https://github.com/SandyGraham23/neon-crypt-reveal/blob/main/neon-crypt-reveal.mp4](https://github.com/SandyGraham23/neon-crypt-reveal/blob/main/neon-crypt-reveal.mp4)

## ✨ Features

- **Fully Homomorphic Encryption (FHE)**: Lucky numbers are encrypted before submission and remain encrypted during computation
- **Provably Fair**: Smart contract-based lottery with transparent, verifiable random number generation
- **Privacy-Preserving**: Users' numbers are never revealed until the lottery ends
- **Encrypted Comparison**: Winning numbers are compared in encrypted state using FHE operations
- **Automatic Winner Selection**: Winner is automatically determined and prize pool distributed
- **Real-time Status**: Live updates on participants, prize pool, and lottery status

## 🏗️ Architecture

### Smart Contracts

The project includes two main contracts:

#### 1. `LuckyNumberLottery.sol` (FHE Version)
A fully homomorphic encryption-enabled lottery contract where:
- Users submit encrypted numbers (1-99) using FHE
- The winning number is generated and stored in encrypted form
- Comparisons are performed on encrypted data using `FHE.eq()`
- Results remain encrypted until the lottery ends

**Key Functions:**
- `submitNumber(externalEuint8 encryptedNumber, bytes calldata inputProof)`: Submit an encrypted lucky number
- `endLottery()`: End the lottery and reveal the winner
- `getLotteryStatus()`: Get current lottery status
- `getParticipant(address user)`: Get encrypted participant data
- `withdrawFunds()`: Winner can withdraw the prize pool

#### 2. `SimpleLottery.sol` (Non-FHE Version)
A simplified version for testing and demonstration:
- Uses plain numbers (not encrypted)
- Faster execution for development and testing
- Same lottery mechanics without FHE overhead

### Encryption & Decryption Logic

#### Frontend Encryption Flow

1. **FHEVM Initialization** (`ui/src/lib/fhevm.ts`):
   ```typescript
   // For localhost (Chain ID: 31337)
   - Uses @fhevm/mock-utils with Hardhat plugin
   - Fetches FHEVM metadata from Hardhat node
   - Creates MockFhevmInstance with ACL, InputVerifier, and KMS addresses
   
   // For Sepolia (Chain ID: 11155111)
   - Uses @zama-fhe/relayer-sdk (future implementation)
   ```

2. **Number Encryption** (`encryptLuckyNumber`):
   ```typescript
   // User enters a number (1-99)
   const encryptedInput = fhevm.createEncryptedInput(contractAddress, userAddress)
     .add8(luckyNumber);
   const encrypted = await encryptedInput.encrypt();
   
   // Returns:
   // - handles: Encrypted number handles
   // - inputProof: Zero-knowledge proof for input validation
   ```

3. **Contract Submission**:
   ```solidity
   // Contract receives encrypted number
   euint8 userNumber = FHE.fromExternal(encryptedNumber, inputProof);
   
   // Encrypted comparison
   ebool isWinner = FHE.eq(userNumber, winningNumber);
   
   // Store encrypted result
   participants.push(Participant({
     user: msg.sender,
     encryptedNumber: userNumber,
     isWinner: isWinner,
     hasParticipated: true
   }));
   ```

4. **Decryption** (`batchDecrypt`):
   ```typescript
   // For localhost only
   const value = await userDecryptHandleBytes32(
     provider,
     signer,
     contractAddress,
     handle,
     userAddress
   );
   ```

#### Key Encryption/Decryption Components

**Contract Side:**
- `FHE.asEuint8(uint8)`: Convert plain number to encrypted type
- `FHE.fromExternal(externalEuint8, bytes)`: Import encrypted input with proof
- `FHE.eq(euint8, euint8)`: Encrypted equality comparison
- `FHE.allow(euint8, address)`: Grant decryption permission to user

**Frontend Side:**
- `createEncryptedInput()`: Create encrypted input builder
- `add8(number)`: Add 8-bit number to encrypted input
- `encrypt()`: Generate encrypted handles and proof
- `userDecryptHandleBytes32()`: Decrypt handle for authorized user

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm** or **yarn**: Package manager
- **MetaMask**: Browser wallet extension
- **Hardhat**: For local development

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
   npx hardhat vars set INFURA_API_KEY  # Optional, for Sepolia
   ```

### Local Development

1. **Start Hardhat node with FHEVM support**
   ```bash
   npx hardhat node
   ```

2. **Deploy contracts to localhost**
   ```bash
   npx hardhat deploy --network localhost
   ```

3. **Start frontend development server**
   ```bash
   cd ui
   npm run dev
   ```

4. **Connect MetaMask**
   - Network: Localhost 8545
   - Chain ID: 31337
   - Import one of the test accounts from Hardhat node output

### Deploy to Sepolia Testnet

1. **Set private key**
   ```bash
   # Windows PowerShell
   $env:PRIVATE_KEY="your_private_key"
   
   # Linux/Mac
   export PRIVATE_KEY="your_private_key"
   ```

2. **Deploy**
   ```bash
   npx hardhat deploy --network sepolia
   ```

3. **Update frontend addresses**
   - Update `ui/src/abi/SimpleLotteryAddresses.ts` with deployed contract address

4. **Verify contract** (optional)
   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

## 📁 Project Structure

```
neon-crypt-reveal/
├── contracts/              # Smart contracts
│   ├── LuckyNumberLottery.sol  # FHE-enabled lottery contract
│   ├── SimpleLottery.sol      # Non-FHE version for testing
│   └── FHECounter.sol         # Example FHE contract
├── deploy/                 # Deployment scripts
│   ├── 01_deploy_lucky_number_lottery.ts
│   └── 02_deploy_simple_lottery.ts
├── test/                  # Test files
│   ├── LuckyNumberLottery.ts
│   └── SimpleLottery.ts
├── tasks/                 # Hardhat custom tasks
├── ui/                    # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks (useFhevm)
│   │   ├── lib/          # Utilities (fhevm.ts)
│   │   └── abi/          # Contract ABIs and addresses
│   └── package.json
├── hardhat.config.ts     # Hardhat configuration
└── package.json
```

## 🔧 Available Scripts

### Root Directory

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile all contracts |
| `npm run test` | Run all tests |
| `npm run test:sepolia` | Run tests on Sepolia |
| `npm run coverage` | Generate coverage report |
| `npm run lint` | Run linting checks |
| `npm run clean` | Clean build artifacts |

### UI Directory

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🔐 Security & Privacy

### FHE Encryption Flow

1. **User Input**: User enters a number (1-99) in the frontend
2. **Client-Side Encryption**: Number is encrypted using FHEVM before submission
3. **Zero-Knowledge Proof**: Input proof is generated to verify the number is in valid range
4. **On-Chain Storage**: Only encrypted data is stored on-chain
5. **Encrypted Computation**: Comparisons are performed on encrypted data
6. **Selective Decryption**: Only authorized users can decrypt their own results

### Key Security Features

- **Input Validation**: ZK proofs ensure numbers are within valid range (1-99)
- **Access Control**: `FHE.allow()` controls who can decrypt which data
- **No Plaintext Storage**: Winning numbers and user submissions remain encrypted
- **Provably Fair**: Random number generation uses block data (timestamp, block number)

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [Zama Discord](https://discord.gg/zama)

## 🛠️ Technology Stack

### Smart Contracts
- **Solidity**: ^0.8.24
- **Hardhat**: Development framework
- **FHEVM**: Zama's Fully Homomorphic Encryption for Solidity
- **@fhevm/solidity**: FHE types and operations

### Frontend
- **React**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Wagmi**: Ethereum React hooks
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components
- **fhevmjs**: FHE operations in JavaScript
- **@fhevm/mock-utils**: Mock FHEVM for localhost

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/SandyGraham23/neon-crypt-reveal/issues)
- **FHEVM Documentation**: [https://docs.zama.ai](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

**Built with ❤️ using Zama's FHEVM technology**
