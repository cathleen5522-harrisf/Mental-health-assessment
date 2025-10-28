// Zama Relayer SDK UMD 类型声明

declare global {
  interface Window {
    // Relayer SDK 全局对象
    initSDK?: () => Promise<void>;
    createInstance?: (config: FhevmConfig) => Promise<FhevmInstance>;
    SepoliaConfig?: SepoliaConfigType;
    zamaRelayerSDK?: any;
    relayerSDK?: any;
  }
}

export interface SepoliaConfigType {
  kmsContractAddress: string;
  aclContractAddress: string;
  inputVerifierContractAddress: string;
  gatewayChainId: number;
}

export interface FhevmConfig extends SepoliaConfigType {
  network: any; // EIP-1193 provider (e.g., window.ethereum)
  chainId: number;
}

export interface FhevmInstance {
  createEncryptedInput: (contractAddress: string, userAddress: string) => EncryptedInput;
  generateKeypair: () => NaClKeypair;
  createEIP712: (
    publicKey: Uint8Array,
    contractAddresses: string[],
    startTimeStamp: string,
    durationDays: string
  ) => EIP712Message;
  userDecrypt: (
    handleContractPairs: HandleContractPair[],
    privateKey: Uint8Array,
    publicKey: Uint8Array,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimeStamp: string,
    durationDays: string
  ) => Promise<Record<string, string | bigint | boolean>>;
}

export interface EncryptedInput {
  add32: (value: number) => EncryptedInput;
  encrypt: () => Promise<EncryptedData>;
}

export interface EncryptedData {
  handles: string[];
  inputProof: string;
}

export interface NaClKeypair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface EIP712Message {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: {
    UserDecryptRequestVerification: Array<{ name: string; type: string }>;
  };
  message: any;
}

export interface HandleContractPair {
  handle: string;
  contractAddress: string;
}

export {};

