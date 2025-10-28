// 合约地址（Sepolia 测试网）
export const CONTRACT_ADDRESS = "0xf61bF69c08B3A319a15f6216604319850D5d7184";

// 合约 ABI
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

// Sepolia 配置 (使用 checksum 地址格式)
export const SEPOLIA_CONFIG = {
  kmsContractAddress: "0x4fDFE9E0CE1f89b5D73e73d50c876e64Cb7e0644",
  aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
  inputVerifierContractAddress: "0x25efbb3AE3AC9209dD4c29bD5AeE3E0e7d9604E0",
  gatewayChainId: 8009,
};

