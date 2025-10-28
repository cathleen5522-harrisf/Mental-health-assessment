// Contract address (Sepolia testnet)
export const CONTRACT_ADDRESS = "0xC5033f18aA20Cd11F1faAea27B8ddfb129881E6c";

// FHEVM configuration for Sepolia
export const SEPOLIA_CONFIG = {
  kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
  aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
  inputVerifierContractAddress: "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
  verifyingContractAddressDecryption: "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
  verifyingContractAddressInputVerification: "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
  chainId: 11155111,
  gatewayChainId: 55815,
  relayerUrl: "https://relayer.testnet.zama.cloud"
};

// Contract ABI
export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum FHEMentalHealthChecker.MentalHealthMetric",
        "name": "metric",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "MetricUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ProfileCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ProfileUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "allowUserDecryption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "assessmentCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "externalEuint32",
        "name": "_anxietyLevel",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_anxietyProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint32",
        "name": "_depressionScore",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_depressionProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint32",
        "name": "_stressIndex",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_stressProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint32",
        "name": "_sleepQuality",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_sleepProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint32",
        "name": "_resilienceScore",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_resilienceProof",
        "type": "bytes"
      }
    ],
    "name": "createProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAnxietyLevel",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAssessmentCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDepressionScore",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFullProfile",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getOverallStatus",
    "outputs": [
      {
        "internalType": "euint8",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getResilienceScore",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSleepQuality",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStressIndex",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hasProfile",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum FHEMentalHealthChecker.MentalHealthMetric",
        "name": "metric",
        "type": "uint8"
      },
      {
        "internalType": "externalEuint32",
        "name": "value",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "updateMetric",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "externalEuint32",
        "name": "_anxietyLevel",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_anxietyProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint32",
        "name": "_depressionScore",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_depressionProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint32",
        "name": "_stressIndex",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_stressProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint32",
        "name": "_sleepQuality",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_sleepProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint32",
        "name": "_resilienceScore",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_resilienceProof",
        "type": "bytes"
      }
    ],
    "name": "updateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
