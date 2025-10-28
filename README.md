# FHE Mental Health Assessment System

A privacy-preserving mental health assessment platform built on **Zama's Fully Homomorphic Encryption (FHE)** technology and deployed on Ethereum Sepolia testnet.
DEMO:

## 🌟 Overview

This decentralized application (dApp) allows users to securely store and manage their mental health assessment data on the blockchain with **complete privacy**. All sensitive health data is encrypted using FHE technology, ensuring that:

- ✅ Data is encrypted both at rest and during computation
- ✅ Only the user can decrypt their own health data
- ✅ Smart contracts can perform calculations on encrypted data without seeing the actual values
- ✅ Assessment results are generated while maintaining data confidentiality

## 🎯 Key Features

### Privacy-First Design
- **End-to-End Encryption**: All health metrics are encrypted using FHE before being stored on-chain
- **User-Controlled Decryption**: Only the wallet owner can decrypt and view their data
- **On-Chain Privacy**: Even blockchain validators cannot see your health information

### Health Metrics Tracked
- **Anxiety Level (GAD-7)**: 0-21 scale
- **Depression Score (PHQ-9)**: 0-27 scale
- **Stress Index (PSS)**: 0-40 scale
- **Sleep Quality (PSQI)**: 0-21 scale
- **Resilience Score (CD-RISC)**: 0-100 scale

### User-Friendly Interface
- Modern, clean white-themed UI with glassmorphism effects
- Intuitive slider inputs for easy data entry
- Real-time assessment categorization (Normal, Mild, Moderate, Severe)
- Auto-closing modal with detailed decrypted results

## 🏗️ Architecture

### Smart Contract Layer
- **Blockchain**: Ethereum Sepolia Testnet
- **FHE Library**: Zama FHEVM Solidity
- **Contract**: `FHEMentalHealthChecker.sol`
  - Stores encrypted health profiles
  - Manages access control
  - Tracks assessment history

### Frontend Layer
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Web3 Integration**: 
  - Wagmi v2
  - RainbowKit
  - Ethers.js v6
- **FHE SDK**: Zama Relayer SDK

### Encryption Infrastructure
- **KMS Contract**: Key Management Service for FHE operations
- **ACL Contract**: Access Control List for permission management
- **Input Verifier**: Validates encrypted inputs
- **Gateway**: Handles off-chain FHE computations

## 📦 Project Structure

```
fhevm-hardhat-template/
├── contracts/              # Solidity smart contracts
│   └── FHEMentalHealthChecker.sol
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── App.tsx       # Main application component
│   │   ├── index.css     # Global styles
│   │   ├── utils/        # FHE utilities
│   │   └── contracts/    # Contract configurations
│   └── package.json
├── hardhat.config.ts      # Hardhat configuration
└── package.json           # Root dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 20.x
- **npm**: >= 7.0.0
- **MetaMask**: Browser wallet extension
- **Sepolia ETH**: Test tokens for transactions

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd fhevm-hardhat-template
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. **Configure environment variables**
```bash
# Create .env file in root directory
cp .env.example .env

# Add your private key and RPC URLs
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=your_sepolia_rpc_url
```

### Compilation & Deployment

1. **Compile smart contracts**
```bash
npm run compile
```

2. **Deploy to Sepolia**
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

3. **Update contract address**
   - Copy the deployed contract address
   - Update `frontend/src/contracts/contract.ts` with the new address

### Building & Running Frontend

1. **Development mode**
```bash
cd frontend
npm run dev
```

2. **Production build**
```bash
cd frontend
npm run build
```

3. **Preview production build**
```bash
cd frontend
npm run preview
```

### Build Output
- Production build files will be generated in `frontend/dist/`
- Deploy the `dist/` folder to any static hosting service (Vercel, Netlify, etc.)

## 🔧 Configuration

### Network Configuration
The project is pre-configured for **Sepolia Testnet**:
- Chain ID: 11155111
- FHE Gateway Chain ID: 8009
- KMS, ACL, and Input Verifier contracts are pre-deployed

### Contract Addresses
All FHE infrastructure addresses are configured in:
```
frontend/src/contracts/contract.ts
```

## 💡 Usage

### Creating a Profile
1. Connect your MetaMask wallet
2. Ensure you're on Sepolia network
3. Adjust sliders to input your health metrics
4. Click **"Create Health Profile"**
5. Confirm the transaction in MetaMask

### Updating Your Profile
1. View your existing encrypted profile
2. Adjust sliders to new values
3. Click **"Update Profile"**
4. Confirm the transaction

### Decrypting Data
1. Click **"Decrypt & View"** on your encrypted profile
2. Wait for FHE decryption process
3. View detailed assessment report in auto-closing modal
4. See categorized results (Normal, Mild, Moderate, Severe)

## 🛡️ Security Features

- **Fully Homomorphic Encryption (FHE)**: Enables computation on encrypted data
- **On-Chain Access Control**: Only wallet owner can decrypt their data
- **No Plaintext Storage**: Health data never exists in plaintext on-chain
- **Client-Side Encryption**: Data encrypted in browser before submission
- **Decentralized**: No central server can access user data

## 🧪 Testing

### Run Smart Contract Tests
```bash
npm run test
```

### Run Tests on Sepolia
```bash
npm run test:sepolia
```

## 📚 Technologies Used

### Blockchain & Smart Contracts
- [Hardhat](https://hardhat.org/) - Development environment
- [Zama FHEVM](https://docs.zama.ai/fhevm) - Fully Homomorphic Encryption
- [Solidity](https://soliditylang.org/) - Smart contract language
- [Ethers.js](https://docs.ethers.org/) - Ethereum library

### Frontend
- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection UI

### Privacy & Encryption
- [Zama Relayer SDK](https://docs.zama.ai/fhevm/guides/frontend) - Client-side FHE operations
- [FHEVM Solidity](https://github.com/zama-ai/fhevm-solidity) - FHE smart contract library

## 🎨 UI Design

- **Theme**: Clean white design with subtle gradients
- **Layout**: Sidebar navigation with card-based content
- **Interactions**: Smooth animations and transitions
- **Responsiveness**: Mobile-friendly design
- **Accessibility**: Clear visual hierarchy and status indicators

## 📝 License

BSD-3-Clause-Clear

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
- Check [Zama Documentation](https://docs.zama.ai/)
- Review [FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)

## ⚠️ Disclaimer

This is a demonstration project for educational purposes. The mental health assessments provided are simplified versions of clinical tools and should **NOT** replace professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with any questions regarding mental health conditions.

---

**Built with ❤️ using Zama's FHE technology**


