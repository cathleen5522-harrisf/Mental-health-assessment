// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, inEuint32 } from "@fhevm/lib/TFHE.sol";
import { Permissioned, Permission } from "@fhevm/abstracts/Permissioned.sol";

/**
 * @title FHEMentalHealthChecker

 * @notice Privacy-preserving mental health self-assessment system using Fully Homomorphic Encryption
 * @dev All mental health data remains encrypted on-chain, only users can decrypt their own data
 */
contract FHEMentalHealthChecker is Permissioned {
    
    /**

     * @dev Mental health metric types (based on clinical standard scales)
     */
    enum MentalHealthMetric {

        ANXIETY_LEVEL,      // Anxiety level (GAD-7 scale: 0-21)
        DEPRESSION_SCORE,   // Depression score (PHQ-9 scale: 0-27)
        STRESS_INDEX,       // Stress index (PSS scale: 0-40)
        SLEEP_QUALITY,      // Sleep quality (PSQI scale: 0-21)
        RESILIENCE_SCORE    // Psychological resilience (CD-RISC scale: 0-100)
    }
    
    // =====================================================================

    // Mental Health Metric Ranges (based on clinical standards)
    // =====================================================================
    

    // Anxiety Level (GAD-7: 0-21)
    // 0-7: Minimal anxiety (healthy)
    // 8-14: Moderate anxiety (needs attention)
    // 15-21: Severe anxiety (needs attention)
    uint32 private constant ANXIETY_HEALTHY_MAX = 7;
    uint32 private constant ANXIETY_RANGE_MAX = 21;
    

    // Depression Score (PHQ-9: 0-27)
    // 0-9: Minimal depression (healthy)
    // 10-19: Moderate depression (needs attention)
    // 20-27: Severe depression (needs attention)
    uint32 private constant DEPRESSION_HEALTHY_MAX = 9;
    uint32 private constant DEPRESSION_RANGE_MAX = 27;
    

    // Stress Index (PSS: 0-40)
    // 0-13: Low stress (healthy)
    // 14-26: Moderate stress (needs attention)
    // 27-40: High stress (needs attention)
    uint32 private constant STRESS_HEALTHY_MAX = 13;
    uint32 private constant STRESS_RANGE_MAX = 40;
    

    // Sleep Quality (PSQI: 0-21, note: lower score is better)
    // 0-5: Good sleep (healthy)
    // 6-10: Mild sleep problems (needs attention)
    // 11-21: Severe sleep problems (needs attention)
    uint32 private constant SLEEP_GOOD_MAX = 5;
    uint32 private constant SLEEP_RANGE_MAX = 21;
    

    // Psychological Resilience (CD-RISC: 0-100, note: higher score is better)
    // 80-100: High resilience (healthy)
    // 50-79: Moderate resilience (needs attention)
    // 0-49: Low resilience (needs attention)
    uint32 private constant RESILIENCE_HIGH_MIN = 80;
    uint32 private constant RESILIENCE_RANGE_MAX = 100;
    
    // =====================================================================

    // Data Structures
    // =====================================================================
    
    /**

     * @dev User's mental health profile (all encrypted)
     */
    struct MentalHealthProfile {
        euint32 anxietyLevel;      // Anxiety level (encrypted)
        euint32 depressionScore;   // Depression score (encrypted)
        euint32 stressIndex;       // Stress index (encrypted)
        euint32 sleepQuality;      // Sleep quality (encrypted)
        euint32 resilienceScore;   // Resilience score (encrypted)
        euint32 lastUpdateTime;    // Last update time (encrypted)
        bool exists;               // Whether record exists
    }
    
    /**
     * @dev Mapping of user mental health profiles
     */
    mapping(address => MentalHealthProfile) private userProfiles;
    
    /**
     * @dev User assessment count (for tracking usage)
     */
    mapping(address => uint256) public assessmentCount;
    
    // =====================================================================

    // Events
    // =====================================================================
    

    event ProfileCreated(address indexed user, uint256 timestamp);
    event ProfileUpdated(address indexed user, uint256 timestamp);
    event MetricUpdated(address indexed user, MentalHealthMetric metric, uint256 timestamp);
    
    // =====================================================================

    // Core Functions
    // =====================================================================
    
    /**

     * @notice Create mental health profile
     * @param _anxietyLevel Anxiety level (encrypted input, 0-21)
     * @param _depressionScore Depression score (encrypted input, 0-27)
     * @param _stressIndex Stress index (encrypted input, 0-40)
     * @param _sleepQuality Sleep quality (encrypted input, 0-21)
     * @param _resilienceScore Resilience score (encrypted input, 0-100)
     */
    function createProfile(
        inEuint32 calldata _anxietyLevel,
        inEuint32 calldata _depressionScore,
        inEuint32 calldata _stressIndex,
        inEuint32 calldata _sleepQuality,
        inEuint32 calldata _resilienceScore
    ) external {
        require(!userProfiles[msg.sender].exists, "Profile already exists");
        
        // Convert encrypted inputs
        euint32 anxiety = FHE.asEuint32(_anxietyLevel);
        euint32 depression = FHE.asEuint32(_depressionScore);
        euint32 stress = FHE.asEuint32(_stressIndex);
        euint32 sleep = FHE.asEuint32(_sleepQuality);
        euint32 resilience = FHE.asEuint32(_resilienceScore);
        
        // Create profile
        userProfiles[msg.sender] = MentalHealthProfile({
            anxietyLevel: anxiety,
            depressionScore: depression,
            stressIndex: stress,
            sleepQuality: sleep,
            resilienceScore: resilience,
            lastUpdateTime: FHE.asEuint32(block.timestamp),
            exists: true
        });
        
        assessmentCount[msg.sender] = 1;
        
        // Grant user permission to view their own data
        FHE.allowThis(anxiety);
        FHE.allowThis(depression);
        FHE.allowThis(stress);
        FHE.allowThis(sleep);
        FHE.allowThis(resilience);
        FHE.allow(anxiety, msg.sender);
        FHE.allow(depression, msg.sender);
        FHE.allow(stress, msg.sender);
        FHE.allow(sleep, msg.sender);
        FHE.allow(resilience, msg.sender);
        
        emit ProfileCreated(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Update complete mental health profile
     */
    function updateProfile(
        inEuint32 calldata _anxietyLevel,
        inEuint32 calldata _depressionScore,
        inEuint32 calldata _stressIndex,
        inEuint32 calldata _sleepQuality,
        inEuint32 calldata _resilienceScore
    ) external {

        require(userProfiles[msg.sender].exists, "Profile does not exist");
        
        MentalHealthProfile storage profile = userProfiles[msg.sender];
        
        // Update all metrics
        profile.anxietyLevel = FHE.asEuint32(_anxietyLevel);
        profile.depressionScore = FHE.asEuint32(_depressionScore);
        profile.stressIndex = FHE.asEuint32(_stressIndex);
        profile.sleepQuality = FHE.asEuint32(_sleepQuality);
        profile.resilienceScore = FHE.asEuint32(_resilienceScore);
        profile.lastUpdateTime = FHE.asEuint32(block.timestamp);
        
        assessmentCount[msg.sender]++;
        
        // Grant user permission to view updated data
        FHE.allowThis(profile.anxietyLevel);
        FHE.allowThis(profile.depressionScore);
        FHE.allowThis(profile.stressIndex);
        FHE.allowThis(profile.sleepQuality);
        FHE.allowThis(profile.resilienceScore);
        FHE.allow(profile.anxietyLevel, msg.sender);
        FHE.allow(profile.depressionScore, msg.sender);
        FHE.allow(profile.stressIndex, msg.sender);
        FHE.allow(profile.sleepQuality, msg.sender);
        FHE.allow(profile.resilienceScore, msg.sender);
        
        emit ProfileUpdated(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Update a single mental health metric
     * @param metric The metric type to update
     * @param value New metric value (encrypted)
     */
    function updateMetric(
        MentalHealthMetric metric,
        inEuint32 calldata value
    ) external {

        require(userProfiles[msg.sender].exists, "Profile does not exist");
        
        MentalHealthProfile storage profile = userProfiles[msg.sender];
        euint32 encryptedValue = FHE.asEuint32(value);
        
        if (metric == MentalHealthMetric.ANXIETY_LEVEL) {
            profile.anxietyLevel = encryptedValue;
        } else if (metric == MentalHealthMetric.DEPRESSION_SCORE) {
            profile.depressionScore = encryptedValue;
        } else if (metric == MentalHealthMetric.STRESS_INDEX) {
            profile.stressIndex = encryptedValue;
        } else if (metric == MentalHealthMetric.SLEEP_QUALITY) {
            profile.sleepQuality = encryptedValue;
        } else if (metric == MentalHealthMetric.RESILIENCE_SCORE) {
            profile.resilienceScore = encryptedValue;
        }
        
        profile.lastUpdateTime = FHE.asEuint32(block.timestamp);
        
        // Grant user permission to view
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);
        
        emit MetricUpdated(msg.sender, metric, block.timestamp);
    }
    
    // =====================================================================

    // Query Functions (only the user can view their own data)
    // =====================================================================
    
    /**

     * @notice Get anxiety level (encrypted)
     * @return Encrypted anxiety level
     */
    function getAnxietyLevel() external view returns (euint32) {
        require(userProfiles[msg.sender].exists, "Profile does not exist");
        return userProfiles[msg.sender].anxietyLevel;
    }
    
    /**
     * @notice Get depression score (encrypted)
     * @return Encrypted depression score
     */
    function getDepressionScore() external view returns (euint32) {
        require(userProfiles[msg.sender].exists, "Profile does not exist");
        return userProfiles[msg.sender].depressionScore;
    }
    
    /**
     * @notice Get stress index (encrypted)
     * @return Encrypted stress index
     */
    function getStressIndex() external view returns (euint32) {
        require(userProfiles[msg.sender].exists, "Profile does not exist");
        return userProfiles[msg.sender].stressIndex;
    }
    
    /**
     * @notice Get sleep quality (encrypted)
     * @return Encrypted sleep quality score
     */
    function getSleepQuality() external view returns (euint32) {
        require(userProfiles[msg.sender].exists, "Profile does not exist");
        return userProfiles[msg.sender].sleepQuality;
    }
    
    /**
     * @notice Get resilience score (encrypted)
     * @return Encrypted resilience score
     */
    function getResilienceScore() external view returns (euint32) {
        require(userProfiles[msg.sender].exists, "Profile does not exist");
        return userProfiles[msg.sender].resilienceScore;
    }
    
    /**
     * @notice Get complete mental health profile (all data encrypted)
     * @return Anxiety, depression, stress, sleep, resilience (all encrypted)
     */
    function getFullProfile() external view returns (
        euint32,
        euint32,
        euint32,
        euint32,
        euint32
    ) {
        require(userProfiles[msg.sender].exists, "Profile does not exist");
        
        MentalHealthProfile storage profile = userProfiles[msg.sender];
        return (
            profile.anxietyLevel,
            profile.depressionScore,
            profile.stressIndex,
            profile.sleepQuality,
            profile.resilienceScore
        );
    }
    
    /**
     * @notice Calculate overall mental health status (encrypted computation)
     * @return Overall status score (encrypted, 0=healthy, 1=needs attention, 2=needs help)
     */
    function getOverallStatus() external view returns (euint8) {
        require(userProfiles[msg.sender].exists, "Profile does not exist");
        
        MentalHealthProfile storage profile = userProfiles[msg.sender];
        
        // Check if anxiety is normal (<= 7)
        euint8 anxietyStatus = FHE.asEuint8(
            FHE.select(
                FHE.le(profile.anxietyLevel, FHE.asEuint32(ANXIETY_HEALTHY_MAX)),
                FHE.asEuint32(0),
                FHE.asEuint32(1)
            )
        );
        
        // Check if depression is normal (<= 9)
        euint8 depressionStatus = FHE.asEuint8(
            FHE.select(
                FHE.le(profile.depressionScore, FHE.asEuint32(DEPRESSION_HEALTHY_MAX)),
                FHE.asEuint32(0),
                FHE.asEuint32(1)
            )
        );
        
        // Check if stress is normal (<= 13)
        euint8 stressStatus = FHE.asEuint8(
            FHE.select(
                FHE.le(profile.stressIndex, FHE.asEuint32(STRESS_HEALTHY_MAX)),
                FHE.asEuint32(0),
                FHE.asEuint32(1)
            )
        );
        
        // Check if sleep is good (<= 5)
        euint8 sleepStatus = FHE.asEuint8(
            FHE.select(
                FHE.le(profile.sleepQuality, FHE.asEuint32(SLEEP_GOOD_MAX)),
                FHE.asEuint32(0),
                FHE.asEuint32(1)
            )
        );
        
        // Check if resilience is high (>= 80)
        euint8 resilienceStatus = FHE.asEuint8(
            FHE.select(
                FHE.ge(profile.resilienceScore, FHE.asEuint32(RESILIENCE_HIGH_MIN)),
                FHE.asEuint32(0),
                FHE.asEuint32(1)
            )
        );
        
        // Calculate total score (number of problematic metrics)
        euint8 totalProblems = FHE.add(
            FHE.add(anxietyStatus, depressionStatus),
            FHE.add(stressStatus, FHE.add(sleepStatus, resilienceStatus))
        );
        
        // Overall assessment:
        // 0 problems = healthy (0)
        // 1-2 problems = needs attention (1)
        // 3+ problems = needs help (2)
        euint8 status = FHE.select(
            FHE.eq(totalProblems, FHE.asEuint8(0)),
            FHE.asEuint8(0),
            FHE.select(
                FHE.le(totalProblems, FHE.asEuint8(2)),
                FHE.asEuint8(1),
                FHE.asEuint8(2)
            )
        );
        
        return status;
    }
    
    /**
     * @notice Check if user has a mental health profile
     * @return Whether profile exists
     */
    function hasProfile() external view returns (bool) {
        return userProfiles[msg.sender].exists;
    }
    
    /**
     * @notice Get assessment count
     * @return User's assessment count
     */
    function getAssessmentCount() external view returns (uint256) {
        return assessmentCount[msg.sender];
    }
   