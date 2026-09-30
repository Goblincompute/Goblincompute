/**
 * Holder-Gated Access Configuration for GOBLIN COMPUTE V1.
 * Supports TEST MODE (allowlist) and REAL TOKEN MODE (ERC-20 contract verification).
 */

export const HOLDER_TEST_MODE = true;

/**
 * Testers allowlist for TEST MODE.
 * Add wallet addresses (lowercase or checksummed) to grant tester authorization.
 */
export const TEST_HOLDER_WALLETS: string[] = [
  '0x1234567890123456789012345678901234567890',
  '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  // Allow all connected addresses in dev test mode if empty or wildcard mode enabled
];

/**
 * Enable wildcard test mode during dev testing so any connected wallet can be tested via allowlist toggle.
 */
export const TEST_ALLOW_ALL_IN_DEV = false;

export const TOKEN_CA = '0x32cC99E041785f833F72fd5Bca1376fB94959169';

/**
 * ERC-20 Token contract configuration for REAL TOKEN MODE (HOLDER_TEST_MODE = false).
 */
export const TOKEN_CONFIG = {
  contractAddress: '0x32cC99E041785f833F72fd5Bca1376fB94959169' as `0x${string}`,
  chainId: 4663, // Robinhood Chain Mainnet ID
  decimals: 18,
  minRequiredBalance: 1000n * 10n ** 18n, // 1000 Tokens required for holder access
};

export interface HolderTierInfo {
  name: string;
  minBalance: bigint;
  allowance: number; // Compute Credits
}

/**
 * Tier Architecture Structure for future multi-tier compute allowances.
 * V1 Default: BASIC HOLDER = 100 CR.
 */
export const HOLDER_TIERS: Record<string, HolderTierInfo> = {
  BASIC: { name: 'BASIC HOLDER', minBalance: 1n, allowance: 100 },
  TIER_2: { name: 'TIER 2 HOLDER', minBalance: 10000n * 10n ** 18n, allowance: 500 },
  TIER_3: { name: 'TIER 3 HOLDER', minBalance: 50000n * 10n ** 18n, allowance: 1500 },
};
