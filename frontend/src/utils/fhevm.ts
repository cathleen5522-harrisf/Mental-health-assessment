import type { FhevmInstance } from './fhevm.d';
import { SEPOLIA_CONFIG } from '../contracts/contract';

// FHEVM instance (global singleton)
let fhevmInstance: FhevmInstance | null = null;
let isInitialized = false;
let isInitializing = false;

/**
 * Smart detection and retrieval of Relayer SDK global object
 */
function getRelayerSDK() {
  // Try different possible global variable names
  const possibleNames = [
    'zamaRelayerSDK',    // Official CDN name
    'relayerSDK',        // Alternative name
    'ZamaRelayerSDK',    // Capitalized version
    'RelayerSDK',        // Capitalized version
    'fhevm'              // Another possibility
  ];
  
  for (const name of possibleNames) {
    if ((window as any)[name]) {
      console.log(`✅ Found SDK global object: window.${name}`);
      return (window as any)[name];
    }
  }
  
  // If not found, print all global variables containing 'sdk' or 'zama'
  const allKeys = Object.keys(window).filter(k => 
    k.toLowerCase().includes('sdk') || 
    k.toLowerCase().includes('zama') ||
    k.toLowerCase().includes('fhe')
  );
  
  console.error('❌ Relayer SDK global object not found');
  console.error('   Attempted names:', possibleNames);
  console.error('   Possibly related globals:', allKeys.length > 0 ? allKeys : 'None');
  
  return null;
}

/**
 * Initialize Relayer SDK
 * Steps:
 * 1. Load WASM (call initSDK)
 * 2. Create FHEVM instance (call createInstance)
 */
export async function initFhevm(provider: any, chainId: number): Promise<FhevmInstance> {
  console.log('\n🔐 === Relayer SDK Initialization Process ===');
  
  // If already initialized, return immediately
  if (isInitialized && fhevmInstance) {
    console.log('✅ FHEVM instance already exists, returning');
    return fhevmInstance;
  }

  // If initializing, wait for completion
  if (isInitializing) {
    console.log('⏳ FHEVM initialization in progress, waiting...');
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (fhevmInstance) {
      return fhevmInstance;
    }
  }

  isInitializing = true;

  try {
    // Step 0: Smart detection of SDK global object
    console.log('\n🔍 Step 0/3: Detecting Relayer SDK...');
    const sdkModule = getRelayerSDK();
    
    if (!sdkModule) {
      throw new Error('Relayer SDK not loaded! Please confirm:\n' +
        '1. UMD script is included in index.html\n' +
        '2. Script loading order is correct (SDK before app code)\n' +
        '3. Network connection is stable and CDN is accessible');
    }
    
    // Step 1: Load WASM
    console.log('\n📦 Step 1/3: Loading Relayer SDK WASM...');
    console.log('   Calling: sdkModule.initSDK()');
    
    if (typeof sdkModule.initSDK !== 'function') {
      throw new Error('initSDK method not found in SDK object! SDK contents: ' + Object.keys(sdkModule).join(', '));
    }
    
    await sdkModule.initSDK();
    console.log('✅ WASM loaded successfully');

    // Step 2: Prepare Sepolia configuration
    console.log('\n⚙️  Step 2/3: Preparing FHEVM configuration...');
    console.log('   Using configuration addresses from contract.ts');
    
    console.log('   Chain ID:', chainId);
    console.log('   KMS Contract:', SEPOLIA_CONFIG.kmsContractAddress);
    console.log('   ACL Contract:', SEPOLIA_CONFIG.aclContractAddress);
    console.log('   Input Verifier:', SEPOLIA_CONFIG.inputVerifierContractAddress);
    console.log('   Gateway Chain ID:', SEPOLIA_CONFIG.gatewayChainId);

    // Step 3: Create instance
    console.log('\n🔨 Step 3/3: Creating FHEVM instance...');
    console.log('   Calling: sdkModule.createInstance(config)');
    console.log('   Provider type:', typeof provider);
    console.log('   Provider value:', provider);
    
    if (typeof sdkModule.createInstance !== 'function') {
      throw new Error('createInstance method not found in SDK object!');
    }

    // Ensure provider is a valid EIP-1193 provider
    const validProvider = provider || window.ethereum;
    
    if (!validProvider) {
      throw new Error('Valid Ethereum Provider not found! Please ensure MetaMask or other wallet extension is installed.');
    }
    
    console.log('   Using Provider:', validProvider === window.ethereum ? 'window.ethereum' : 'wagmi provider');

    // Use SDK's predefined SepoliaConfig (recommended approach)
    // Reference: const config = { ...SepoliaConfig, network: window.ethereum };
    
    // Check if SDK provides SepoliaConfig
    console.log('   Checking SDK exports...');
    console.log('   sdkModule.SepoliaConfig exists?', !!sdkModule.SepoliaConfig);
    
    if (!sdkModule.SepoliaConfig) {
      console.warn('⚠️  SDK does not export SepoliaConfig, available exports:', Object.keys(sdkModule).join(', '));
      throw new Error('SDK does not export SepoliaConfig! Please check SDK version or usage.');
    }
    
    const config = {
      ...sdkModule.SepoliaConfig,
      network: validProvider,
    };

    console.log('📋 Using SepoliaConfig configuration:');
    console.log(JSON.stringify(config, (key, value) => {
      if (key === 'network') return '[EthereumProvider]';
      return value;
    }, 2));

    const instance = await sdkModule.createInstance(config);
    fhevmInstance = instance;
    isInitialized = true;
    
    console.log('✅ FHEVM instance created successfully!');
    console.log('\n🎉 Relayer SDK initialization complete!\n');

    return instance;
  } catch (error: any) {
    console.error('\n❌ FHEVM initialization failed:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Confirm UMD script is loaded in index.html');
    console.error('   2. Confirm network connection is stable');
    console.error('   3. Confirm provider (window.ethereum) is available');
    console.error('   4. Open browser console for detailed errors');
    
    isInitialized = false;
    fhevmInstance = null;
    throw error;
  } finally {
    isInitializing = false;
  }
}

/**
 * Get current FHEVM instance
 */
export function getFhevmInstance(): FhevmInstance | null {
  return fhevmInstance;
}

/**
 * Reset FHEVM instance (for network switching scenarios)
 */
export function resetFhevmInstance(): void {
  console.log('🔄 Resetting FHEVM instance');
  fhevmInstance = null;
  isInitialized = false;
  isInitializing = false;
}

