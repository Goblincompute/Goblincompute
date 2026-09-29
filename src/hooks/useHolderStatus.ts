import { useAccount, useReadContract } from 'wagmi';
import { parseAbi } from 'viem';
import {
  HOLDER_TEST_MODE,
  TEST_HOLDER_WALLETS,
  TEST_ALLOW_ALL_IN_DEV,
  TOKEN_CONFIG,
  HOLDER_TIERS,
} from '../config/holderAccess';

export interface HolderStatusResult {
  isHolder: boolean;
  tokenBalance: bigint | null;
  tier: string;
  allowance: number;
  loading: boolean;
  error: string | null;
  isTestMode: boolean;
}

const erc20Abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
]);

export function useHolderStatus(): HolderStatusResult {
  const { address, isConnected } = useAccount();

  // REAL TOKEN MODE: Contract balance check
  const isRealMode = !HOLDER_TEST_MODE;
  const isContractConfigured = Boolean(TOKEN_CONFIG.contractAddress && TOKEN_CONFIG.contractAddress.trim() !== '');

  const { data: contractBalance, isLoading: isContractLoading, isError: isContractError } = useReadContract({
    address: isContractConfigured ? TOKEN_CONFIG.contractAddress : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isRealMode && isContractConfigured && Boolean(address),
    },
  });

  if (!isConnected || !address) {
    return {
      isHolder: false,
      tokenBalance: null,
      tier: 'NONE',
      allowance: 0,
      loading: false,
      error: null,
      isTestMode: HOLDER_TEST_MODE,
    };
  }

  // TEST MODE logic
  if (HOLDER_TEST_MODE) {
    const normAddr = address.toLowerCase();
    const isAllowlisted =
      TEST_ALLOW_ALL_IN_DEV ||
      TEST_HOLDER_WALLETS.some((w) => w.toLowerCase() === normAddr);

    if (isAllowlisted) {
      return {
        isHolder: true,
        tokenBalance: null, // Do NOT fake token balance in test mode
        tier: 'BASIC',
        allowance: HOLDER_TIERS.BASIC.allowance,
        loading: false,
        error: null,
        isTestMode: true,
      };
    }

    return {
      isHolder: false,
      tokenBalance: null,
      tier: 'NONE',
      allowance: 0,
      loading: false,
      error: null,
      isTestMode: true,
    };
  }

  // REAL TOKEN MODE logic
  if (!isContractConfigured) {
    return {
      isHolder: false,
      tokenBalance: null,
      tier: 'NONE',
      allowance: 0,
      loading: false,
      error: 'TOKEN CONTRACT NOT CONFIGURED',
      isTestMode: false,
    };
  }

  if (isContractLoading) {
    return {
      isHolder: false,
      tokenBalance: null,
      tier: 'NONE',
      allowance: 0,
      loading: true,
      error: null,
      isTestMode: false,
    };
  }

  if (isContractError || contractBalance === undefined) {
    return {
      isHolder: false,
      tokenBalance: null,
      tier: 'NONE',
      allowance: 0,
      loading: false,
      error: 'FAILED TO VERIFY TOKEN BALANCE',
      isTestMode: false,
    };
  }

  const balance = contractBalance;
  const isHolder = balance >= TOKEN_CONFIG.minRequiredBalance;
  const tier = isHolder ? 'BASIC' : 'NONE';
  const allowance = isHolder ? HOLDER_TIERS.BASIC.allowance : 0;

  return {
    isHolder,
    tokenBalance: balance,
    tier,
    allowance,
    loading: false,
    error: null,
    isTestMode: false,
  };
}
