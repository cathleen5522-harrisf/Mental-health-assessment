import { useEffect, useState } from 'react';
import { useAccount, useChainId, useSwitchChain, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contracts/contract';
import { SEPOLIA_CHAIN_ID } from './config/wagmi';
import { initFhevm, getFhevmInstance, resetFhevmInstance } from './utils/fhevm';
import type { FhevmInstance } from './utils/fhevm.d';

function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const [fhevmInstance, setFhevmInstance] = useState<FhevmInstance | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [assessmentCount, setAssessmentCount] = useState<number>(0);
  const [loading, setLoading] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Health data form
  const [formData, setFormData] = useState({
    anxietyLevel: 12,
    depressionScore: 15,
    stressIndex: 20,
    sleepQuality: 8,
    resilienceScore: 65,
  });

  // Decrypted data and modal control
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  // Update cooldown state
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const [canUpdate, setCanUpdate] = useState(true);

  // Check network
  useEffect(() => {
    if (isConnected && chainId !== SEPOLIA_CHAIN_ID) {
      alert('⚠️ Please switch to Sepolia testnet!');
    }
  }, [isConnected, chainId]);

  // Initialize FHEVM
  useEffect(() => {
    const init = async () => {
      if (!isConnected || !walletClient) return;
      
      if (chainId !== SEPOLIA_CHAIN_ID) {
        setError('Please switch to Sepolia network first');
        return;
      }

      const existingInstance = getFhevmInstance();
      if (existingInstance) {
        setFhevmInstance(existingInstance);
        return;
      }

      setIsInitializing(true);
      setError('');
      
      try {
        if (!window.ethereum) {
          throw new Error('MetaMask or other wallet extension not detected!');
        }
        
        const instance = await initFhevm(window.ethereum, chainId);
        setFhevmInstance(instance);
        
        await loadProfileStatus();
      } catch (err: any) {
        setError(`Initialization failed: ${err.message}`);
        console.error(err);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [isConnected, walletClient, chainId]);

  // Modal countdown and auto-close
  useEffect(() => {
    if (showModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showModal && countdown === 0) {
      setShowModal(false);
      setCountdown(5);
    }
  }, [showModal, countdown]);

  // Check update cooldown (24 hours)
  useEffect(() => {
    const checkCooldown = () => {
      const storedTime = localStorage.getItem(`lastUpdate_${address}`);
      if (storedTime) {
        const lastTime = parseInt(storedTime);
        setLastUpdateTime(lastTime);
        const now = Date.now();
        const hoursPassed = (now - lastTime) / (1000 * 60 * 60);
        setCanUpdate(hoursPassed >= 24);
      } else {
        setCanUpdate(true);
      }
    };

    if (address) {
      checkCooldown();
      // Check every minute
      const interval = setInterval(checkCooldown, 60000);
      return () => clearInterval(interval);
    }
  }, [address]);

  // Load user profile status
  const loadProfileStatus = async () => {
    if (!walletClient || !address) return;

    try {
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const profile = await contract.hasProfile();
      const count = await contract.getAssessmentCount();
      
      setHasProfile(profile);
      setAssessmentCount(Number(count));
    } catch (err: any) {
      console.error('Failed to load profile status:', err);
    }
  };

  // Switch to Sepolia
  const handleSwitchToSepolia = () => {
    switchChain({ chainId: SEPOLIA_CHAIN_ID });
    resetFhevmInstance();
  };

  // Create profile
  const handleCreateProfile = async () => {
    if (!fhevmInstance || !walletClient || !address) {
      setError('Please initialize FHEVM first');
      return;
    }

    setLoading('Creating profile...');
    setError('');
    setSuccess('');

    try {
      console.log('\n📝 === Creating Mental Health Profile ===');
      
      console.log('\n🔐 Step 1/3: Encrypting health data...');
      
      const anxietyInput = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      anxietyInput.add32(formData.anxietyLevel);
      const anxietyEncrypted = await anxietyInput.encrypt();
      console.log('✅ Anxiety level encrypted');

      const depressionInput = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      depressionInput.add32(formData.depressionScore);
      const depressionEncrypted = await depressionInput.encrypt();
      console.log('✅ Depression score encrypted');

      const stressInput = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      stressInput.add32(formData.stressIndex);
      const stressEncrypted = await stressInput.encrypt();
      console.log('✅ Stress index encrypted');

      const sleepInput = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      sleepInput.add32(formData.sleepQuality);
      const sleepEncrypted = await sleepInput.encrypt();
      console.log('✅ Sleep quality encrypted');

      const resilienceInput = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      resilienceInput.add32(formData.resilienceScore);
      const resilienceEncrypted = await resilienceInput.encrypt();
      console.log('✅ Resilience score encrypted');

      console.log('\n⏳ Step 2/3: Submitting to blockchain...');
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.createProfile(
        anxietyEncrypted.handles[0],
        anxietyEncrypted.inputProof,
        depressionEncrypted.handles[0],
        depressionEncrypted.inputProof,
        stressEncrypted.handles[0],
        stressEncrypted.inputProof,
        sleepEncrypted.handles[0],
        sleepEncrypted.inputProof,
        resilienceEncrypted.handles[0],
        resilienceEncrypted.inputProof
      );

      console.log(`   Transaction hash: ${tx.hash}`);
      setLoading('Waiting for confirmation...');

      console.log('\n⏳ Step 3/3: Waiting for confirmation...');
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed! Block: ${receipt.blockNumber}`);

      // Save creation timestamp
      const now = Date.now();
      localStorage.setItem(`lastUpdate_${address}`, now.toString());
      setLastUpdateTime(now);
      setCanUpdate(false);

      setSuccess(`Profile created successfully! Tx: ${tx.hash}`);
      await loadProfileStatus();
      
    } catch (err: any) {
      console.error('Failed to create profile:', err);
      setError(`Creation failed: ${err.message}`);
    } finally {
      setLoading('');
    }
  };

  // Update profile
  const handleUpdateProfile = async () => {
    if (!fhevmInstance || !walletClient || !address) {
      setError('Please initialize FHEVM first');
      return;
    }

    setLoading('Updating profile...');
    setError('');
    setSuccess('');

    try {
      console.log('\n🔄 === Updating Mental Health Profile ===');
      
      console.log('\n🔐 Encrypting update data...');
      
      const anxietyInput = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      anxietyInput.add32(formData.anxietyLevel);
      const anxietyEncrypted = await anxietyInput.encrypt();

      const depressionInput = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      depressionInput.add32(formData.depressionScore);
      const depressionEncrypted = await depressionInput.encrypt();

      const stressInput = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      stressInput.add32(formData.stressIndex);
      const stressEncrypted = await stressInput.encrypt();

      const sleepInput = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      sleepInput.add32(formData.sleepQuality);
      const sleepEncrypted = await sleepInput.encrypt();

      const resilienceInput = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      resilienceInput.add32(formData.resilienceScore);
      const resilienceEncrypted = await resilienceInput.encrypt();

      console.log('✅ All data encrypted');

      console.log('\n⏳ Submitting update...');
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.updateProfile(
        anxietyEncrypted.handles[0],
        anxietyEncrypted.inputProof,
        depressionEncrypted.handles[0],
        depressionEncrypted.inputProof,
        stressEncrypted.handles[0],
        stressEncrypted.inputProof,
        sleepEncrypted.handles[0],
        sleepEncrypted.inputProof,
        resilienceEncrypted.handles[0],
        resilienceEncrypted.inputProof
      );

      console.log(`   Transaction hash: ${tx.hash}`);
      setLoading('Waiting for confirmation...');

      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed! Block: ${receipt.blockNumber}`);

      // Save update timestamp
      const now = Date.now();
      localStorage.setItem(`lastUpdate_${address}`, now.toString());
      setLastUpdateTime(now);
      setCanUpdate(false);

      setSuccess(`Profile updated successfully! Tx: ${tx.hash}`);
      await loadProfileStatus();
      
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(`Update failed: ${err.message}`);
    } finally {
      setLoading('');
    }
  };

  // User decryption
  const handleDecrypt = async () => {
    if (!fhevmInstance || !walletClient || !address) {
      setError('Please initialize FHEVM first');
      return;
    }

    setLoading('Decrypting data...');
    setError('');
    setSuccess('');

    try {
      console.log('\n🔓 === User Decryption Process ===');
      
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      console.log('\n⏳ Step 1/6: Getting encrypted data handles...');
      const anxietyHandle = await contract.getAnxietyLevel();
      const depressionHandle = await contract.getDepressionScore();
      const stressHandle = await contract.getStressIndex();
      const sleepHandle = await contract.getSleepQuality();
      const resilienceHandle = await contract.getResilienceScore();
      console.log('✅ All handles retrieved');

      console.log('\n⏳ Step 2/6: Calculating overall health status...');
      const overallTx = await contract.getOverallStatus();
      await overallTx.wait();
      console.log('✅ Overall status calculated');

      console.log('\n⏳ Step 3/6: Generating user keypair...');
      const keypair = fhevmInstance.generateKeypair();
      console.log('✅ Keypair generated');

      console.log('\n⏳ Step 4/6: Preparing decryption request...');
      const handleContractPairs = [
        { handle: anxietyHandle, contractAddress: CONTRACT_ADDRESS },
        { handle: depressionHandle, contractAddress: CONTRACT_ADDRESS },
        { handle: stressHandle, contractAddress: CONTRACT_ADDRESS },
        { handle: sleepHandle, contractAddress: CONTRACT_ADDRESS },
        { handle: resilienceHandle, contractAddress: CONTRACT_ADDRESS },
      ];
      
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];
      console.log('✅ Decryption request prepared');

      console.log('\n⏳ Step 5/6: Creating EIP712 signature...');
      const eip712 = fhevmInstance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays,
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message,
      );
      console.log('✅ Signature completed');

      console.log('\n⏳ Step 6/6: Decrypting via Gateway...');
      const result = await fhevmInstance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays,
      );

      console.log('✅ Decryption successful!');

      const decrypted = {
        anxiety: Number(result[anxietyHandle]),
        depression: Number(result[depressionHandle]),
        stress: Number(result[stressHandle]),
        sleep: Number(result[sleepHandle]),
        resilience: Number(result[resilienceHandle]),
      };

      console.log('\n📊 Decrypted data:');
      console.log('   Anxiety:', decrypted.anxiety);
      console.log('   Depression:', decrypted.depression);
      console.log('   Stress:', decrypted.stress);
      console.log('   Sleep:', decrypted.sleep);
      console.log('   Resilience:', decrypted.resilience);

      setDecryptedData(decrypted);
      setShowModal(true);
      setCountdown(5);
      
    } catch (err: any) {
      console.error('Decryption failed:', err);
      setError(`Decryption failed: ${err.message}`);
    } finally {
      setLoading('');
    }
  };

  // Get assessment level and style
  const getAssessment = (metric: string, value: number) => {
    let level = '';
    let className = '';
    
    switch (metric) {
      case 'anxiety':
        if (value <= 4) { level = 'Normal'; className = 'assessment-normal'; }
        else if (value <= 9) { level = 'Mild'; className = 'assessment-mild'; }
        else if (value <= 14) { level = 'Moderate'; className = 'assessment-moderate'; }
        else { level = 'Severe'; className = 'assessment-severe'; }
        break;
      case 'depression':
        if (value <= 4) { level = 'Normal'; className = 'assessment-normal'; }
        else if (value <= 9) { level = 'Mild'; className = 'assessment-mild'; }
        else if (value <= 14) { level = 'Moderate'; className = 'assessment-moderate'; }
        else { level = 'Severe'; className = 'assessment-severe'; }
        break;
      case 'stress':
        if (value <= 13) { level = 'Low'; className = 'assessment-normal'; }
        else if (value <= 26) { level = 'Moderate'; className = 'assessment-moderate'; }
        else { level = 'High'; className = 'assessment-severe'; }
        break;
      case 'sleep':
        if (value <= 5) { level = 'Good'; className = 'assessment-normal'; }
        else if (value <= 10) { level = 'Mild'; className = 'assessment-mild'; }
        else if (value <= 15) { level = 'Moderate'; className = 'assessment-moderate'; }
        else { level = 'Severe'; className = 'assessment-severe'; }
        break;
      case 'resilience':
        if (value >= 80) { level = 'High'; className = 'assessment-normal'; }
        else if (value >= 60) { level = 'Moderate'; className = 'assessment-mild'; }
        else { level = 'Low'; className = 'assessment-moderate'; }
        break;
    }
    
    return { level, className };
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Network check */}
        {isConnected && chainId !== SEPOLIA_CHAIN_ID && (
          <div className="alert alert-warning">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <div className="alert-title">Network Error</div>
              <div className="alert-message">
                <p>Current network: Chain ID {chainId}</p>
                <p>Please switch to Sepolia testnet</p>
                <button className="btn-primary" onClick={handleSwitchToSepolia}>
                  Switch to Sepolia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== Header: Project name + Connection status ========== */}
        <div className="sidebar-header">
          {/* Page title */}
          <div className="page-header">
            <h1 className="page-title">FHE Mental Health Assessment</h1>
            <p className="page-subtitle">Privacy-Preserving System by Zama FHE</p>
          </div>

          {/* Connection status */}
          <div className="card wallet-status-card">
            <div className="card-header">
              <h3 className="card-title">Connection Status</h3>
            </div>
            <div className="card-body">
              {/* Wallet connect button */}
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <ConnectButton />
              </div>
              
              {/* System status list */}
              {isConnected && chainId === SEPOLIA_CHAIN_ID && (
                <div className="status-list">
                  <div className="status-item">
                    <div className="status-icon-wrapper">
                      <svg className="status-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M20 7L9 18L4 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="status-info">
                      <span className="status-label">Wallet Address</span>
                      <span className="status-value">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </div>
                  </div>
                  
                  <div className="status-item">
                    <div className="status-icon-wrapper">
                      <svg className="status-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M20 7L9 18L4 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="status-info">
                      <span className="status-label">Network</span>
                      <span className="status-value">Sepolia</span>
                    </div>
                  </div>
                  
                  <div className="status-item">
                    <div className={`status-icon-wrapper ${fhevmInstance ? 'success' : isInitializing ? 'loading' : 'error'}`}>
                      {fhevmInstance ? (
                        <svg className="status-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M20 7L9 18L4 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : isInitializing ? (
                        <span className="loading-spinner"></span>
                      ) : (
                        <svg className="status-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="status-info">
                      <span className="status-label">FHEVM</span>
                      <span className="status-value">
                        {fhevmInstance ? 'Initialized' : isInitializing ? 'Initializing...' : 'Not initialized'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="status-item">
                    <div className={`status-icon-wrapper ${hasProfile ? 'success' : 'error'}`}>
                      {hasProfile ? (
                        <svg className="status-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M20 7L9 18L4 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg className="status-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="status-info">
                      <span className="status-label">Profile Status</span>
                      <span className="status-value">
                        {hasProfile ? `Created (${assessmentCount}x)` : 'Not created'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== Middle: Profile information ========== */}
        {isConnected && chainId === SEPOLIA_CHAIN_ID && hasProfile && (
          <div className="card profile-summary-card">
            <div className="card-header">
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="card-title">My Profile</h3>
            </div>
            <div className="card-body">
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-label">Assessments</span>
                  <span className="stat-value">{assessmentCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Data Status</span>
                  <span className="stat-badge">Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Main content area */}
      <div className="main-content">
        {/* Status messages */}
        {loading && (
          <div className="alert alert-info">
            <div className="alert-icon">
              <span className="loading-spinner"></span>
            </div>
            <div className="alert-content">
              <div className="alert-message">{loading}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <div className="alert-icon">❌</div>
            <div className="alert-content">
              <div className="alert-title">Error</div>
              <div className="alert-message">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <div className="alert-icon">✅</div>
            <div className="alert-content">
              <div className="alert-title">Success</div>
              <div className="alert-message">{success}</div>
            </div>
          </div>
        )}

        {isConnected && chainId === SEPOLIA_CHAIN_ID && (
          <>
            {!hasProfile ? (
              /* Create profile interface */
              <div className="card">
                <div className="card-header">
                  <div className="header-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="card-title">Create Health Profile</h3>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <div className="form-field">
                      <div className="slider-label">
                        <label className="form-label">Anxiety Level (GAD-7)</label>
                        <span className="slider-value">{formData.anxietyLevel}</span>
                      </div>
                      <input
                        type="range"
                        className="form-slider"
                        value={formData.anxietyLevel}
                        onChange={(e) => setFormData({ ...formData, anxietyLevel: Number(e.target.value) })}
                        min="0"
                        max="21"
                        style={{ '--slider-progress': `${(formData.anxietyLevel / 21) * 100}%` } as React.CSSProperties}
                      />
                      <div className="slider-range">
                        <span>0</span>
                        <span>21</span>
                      </div>
                    </div>
                    <div className="form-field">
                      <div className="slider-label">
                        <label className="form-label">Depression Score (PHQ-9)</label>
                        <span className="slider-value">{formData.depressionScore}</span>
                      </div>
                      <input
                        type="range"
                        className="form-slider"
                        value={formData.depressionScore}
                        onChange={(e) => setFormData({ ...formData, depressionScore: Number(e.target.value) })}
                        min="0"
                        max="27"
                        style={{ '--slider-progress': `${(formData.depressionScore / 27) * 100}%` } as React.CSSProperties}
                      />
                      <div className="slider-range">
                        <span>0</span>
                        <span>27</span>
                      </div>
                    </div>
                    <div className="form-field">
                      <div className="slider-label">
                        <label className="form-label">Stress Index (PSS)</label>
                        <span className="slider-value">{formData.stressIndex}</span>
                      </div>
                      <input
                        type="range"
                        className="form-slider"
                        value={formData.stressIndex}
                        onChange={(e) => setFormData({ ...formData, stressIndex: Number(e.target.value) })}
                        min="0"
                        max="40"
                        style={{ '--slider-progress': `${(formData.stressIndex / 40) * 100}%` } as React.CSSProperties}
                      />
                      <div className="slider-range">
                        <span>0</span>
                        <span>40</span>
                      </div>
                    </div>
                    <div className="form-field">
                      <div className="slider-label">
                        <label className="form-label">Sleep Quality (PSQI)</label>
                        <span className="slider-value">{formData.sleepQuality}</span>
                      </div>
                      <input
                        type="range"
                        className="form-slider"
                        value={formData.sleepQuality}
                        onChange={(e) => setFormData({ ...formData, sleepQuality: Number(e.target.value) })}
                        min="0"
                        max="21"
                        style={{ '--slider-progress': `${(formData.sleepQuality / 21) * 100}%` } as React.CSSProperties}
                      />
                      <div className="slider-range">
                        <span>0</span>
                        <span>21</span>
                      </div>
                    </div>
                    <div className="form-field">
                      <div className="slider-label">
                        <label className="form-label">Resilience Score (CD-RISC)</label>
                        <span className="slider-value">{formData.resilienceScore}</span>
                      </div>
                      <input
                        type="range"
                        className="form-slider"
                        value={formData.resilienceScore}
                        onChange={(e) => setFormData({ ...formData, resilienceScore: Number(e.target.value) })}
                        min="0"
                        max="100"
                        style={{ '--slider-progress': `${(formData.resilienceScore / 100) * 100}%` } as React.CSSProperties}
                      />
                      <div className="slider-range">
                        <span>0</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'var(--spacing-lg)' }}>
                    <button
                      className="btn-create"
                      onClick={handleCreateProfile}
                      disabled={!fhevmInstance || !!loading}
                    >
                      📝 Create Profile
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Profile management interface - Left/Right layout */
              <div className="profile-grid">
                {/* Left: Encrypted Profile */}
                <div className="card">
                  <div className="card-header">
                    <div className="header-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="card-title">Encrypted Profile</h3>
                  </div>
                  <div className="card-body">
                    <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)' }}>
                      Your health data is encrypted and stored on the blockchain. Click the button below to decrypt and view.
                    </p>
                    <div style={{ 
                      background: 'var(--gray-50)', 
                      padding: 'var(--spacing-lg)', 
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--spacing-lg)',
                      border: '2px dashed var(--gray-300)'
                    }}>
                      <div style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing)' }}>🔐</div>
                        <p style={{ fontWeight: 600 }}>Data Encrypted</p>
                        <p style={{ fontSize: '0.9rem' }}>Assessments: {assessmentCount}</p>
                      </div>
                    </div>
                    <button
                      className="btn-decrypt"
                      onClick={handleDecrypt}
                      disabled={!fhevmInstance || !!loading}
                    >
                      🔓 Decrypt & View
                    </button>
                  </div>
                </div>

                {/* Right: Update Profile */}
                <div className="card" style={{ position: 'relative' }}>
                  <div className="card-header">
                    <div className="header-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M11 5H6C4.89543 5 4 5.89543 4 7V18C4 19.1046 4.89543 20 6 20H17C18.1046 20 19 19.1046 19 18V13M17.5858 3.58579C18.3668 2.80474 19.6332 2.80474 20.4142 3.58579C21.1953 4.36683 21.1953 5.63316 20.4142 6.41421L11.8284 15H9L9 12.1716L17.5858 3.58579Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="card-title">Update Profile</h3>
                  </div>
                  <div className="card-body" style={{ filter: !canUpdate ? 'blur(3px)' : 'none', pointerEvents: !canUpdate ? 'none' : 'auto' }}>
                    <div className="form-grid">
                      <div className="form-field">
                        <div className="slider-label">
                          <label className="form-label">Anxiety Level</label>
                          <span className="slider-value">{formData.anxietyLevel}</span>
                        </div>
                        <input
                          type="range"
                          className="form-slider"
                          value={formData.anxietyLevel}
                          onChange={(e) => setFormData({ ...formData, anxietyLevel: Number(e.target.value) })}
                          min="0"
                          max="21"
                          style={{ '--slider-progress': `${(formData.anxietyLevel / 21) * 100}%` } as React.CSSProperties}
                        />
                        <div className="slider-range">
                          <span>0</span>
                          <span>21</span>
                        </div>
                      </div>
                      <div className="form-field">
                        <div className="slider-label">
                          <label className="form-label">Depression Score</label>
                          <span className="slider-value">{formData.depressionScore}</span>
                        </div>
                        <input
                          type="range"
                          className="form-slider"
                          value={formData.depressionScore}
                          onChange={(e) => setFormData({ ...formData, depressionScore: Number(e.target.value) })}
                          min="0"
                          max="27"
                          style={{ '--slider-progress': `${(formData.depressionScore / 27) * 100}%` } as React.CSSProperties}
                        />
                        <div className="slider-range">
                          <span>0</span>
                          <span>27</span>
                        </div>
                      </div>
                      <div className="form-field">
                        <div className="slider-label">
                          <label className="form-label">Stress Index</label>
                          <span className="slider-value">{formData.stressIndex}</span>
                        </div>
                        <input
                          type="range"
                          className="form-slider"
                          value={formData.stressIndex}
                          onChange={(e) => setFormData({ ...formData, stressIndex: Number(e.target.value) })}
                          min="0"
                          max="40"
                          style={{ '--slider-progress': `${(formData.stressIndex / 40) * 100}%` } as React.CSSProperties}
                        />
                        <div className="slider-range">
                          <span>0</span>
                          <span>40</span>
                        </div>
                      </div>
                      <div className="form-field">
                        <div className="slider-label">
                          <label className="form-label">Sleep Quality</label>
                          <span className="slider-value">{formData.sleepQuality}</span>
                        </div>
                        <input
                          type="range"
                          className="form-slider"
                          value={formData.sleepQuality}
                          onChange={(e) => setFormData({ ...formData, sleepQuality: Number(e.target.value) })}
                          min="0"
                          max="21"
                          style={{ '--slider-progress': `${(formData.sleepQuality / 21) * 100}%` } as React.CSSProperties}
                        />
                        <div className="slider-range">
                          <span>0</span>
                          <span>21</span>
                        </div>
                      </div>
                      <div className="form-field">
                        <div className="slider-label">
                          <label className="form-label">Resilience Score</label>
                          <span className="slider-value">{formData.resilienceScore}</span>
                        </div>
                        <input
                          type="range"
                          className="form-slider"
                          value={formData.resilienceScore}
                          onChange={(e) => setFormData({ ...formData, resilienceScore: Number(e.target.value) })}
                          min="0"
                          max="100"
                          style={{ '--slider-progress': `${(formData.resilienceScore / 100) * 100}%` } as React.CSSProperties}
                        />
                        <div className="slider-range">
                          <span>0</span>
                          <span>100</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 'var(--spacing-lg)' }}>
                      <button
                        className="btn-update"
                        onClick={handleUpdateProfile}
                        disabled={!fhevmInstance || !!loading}
                      >
                        🔄 Update Profile
                      </button>
                    </div>
                  </div>
                  
                  {/* Cooldown overlay */}
                  {!canUpdate && (
                    <div className="cooldown-overlay">
                      <div className="cooldown-content">
                        <svg viewBox="0 0 24 24" fill="none" style={{ width: '48px', height: '48px', marginBottom: '16px' }}>
                          <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h3 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 600 }}>Update Cooldown</h3>
                        <p style={{ color: 'var(--gray-600)', marginBottom: '16px' }}>Please come back tomorrow to update your profile</p>
                        {lastUpdateTime > 0 && (
                          <div style={{ 
                            background: 'rgba(255, 255, 255, 0.9)', 
                            padding: '12px 20px', 
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: 'var(--gray-700)'
                          }}>
                            <p style={{ margin: 0 }}>
                              Next update available: {new Date(lastUpdateTime + 24 * 60 * 60 * 1000).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Decryption result modal */}
      {showModal && decryptedData && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 19V6L20 12L9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                Health Assessment Report
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="result-card">
                <div className="result-row">
                  <span className="result-label">Anxiety Level</span>
                  <div>
                    <span className="result-value">{decryptedData.anxiety} / 21</span>
                    <span className={`result-assessment ${getAssessment('anxiety', decryptedData.anxiety).className}`}>
                      {getAssessment('anxiety', decryptedData.anxiety).level}
                    </span>
                  </div>
                </div>
                <div className="result-row">
                  <span className="result-label">Depression Score</span>
                  <div>
                    <span className="result-value">{decryptedData.depression} / 27</span>
                    <span className={`result-assessment ${getAssessment('depression', decryptedData.depression).className}`}>
                      {getAssessment('depression', decryptedData.depression).level}
                    </span>
                  </div>
                </div>
                <div className="result-row">
                  <span className="result-label">Stress Index</span>
                  <div>
                    <span className="result-value">{decryptedData.stress} / 40</span>
                    <span className={`result-assessment ${getAssessment('stress', decryptedData.stress).className}`}>
                      {getAssessment('stress', decryptedData.stress).level}
                    </span>
                  </div>
                </div>
                <div className="result-row">
                  <span className="result-label">Sleep Quality</span>
                  <div>
                    <span className="result-value">{decryptedData.sleep} / 21</span>
                    <span className={`result-assessment ${getAssessment('sleep', decryptedData.sleep).className}`}>
                      {getAssessment('sleep', decryptedData.sleep).level}
                    </span>
                  </div>
                </div>
                <div className="result-row">
                  <span className="result-label">Resilience Score</span>
                  <div>
                    <span className="result-value">{decryptedData.resilience} / 100</span>
                    <span className={`result-assessment ${getAssessment('resilience', decryptedData.resilience).className}`}>
                      {getAssessment('resilience', decryptedData.resilience).level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="countdown">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Window will close in {countdown} seconds
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
