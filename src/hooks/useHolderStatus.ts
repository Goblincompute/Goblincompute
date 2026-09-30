import { useAccount, useReadContract } from 'wagmi';
import { parseAbi, formatUnits } from 'viem';
import { ROBINHOOD_CHAIN_ID } from '../config/chains';
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
  formattedTokenBalance: string;
  decimals: number;
  tier: string;
  allowance: number;
  loading: boolean;
  error: string | null;
  isTestMode: boolean;
  refetch: () => void;
}

const erc20Abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
]);

export function useHolderStatus(): HolderStatusResult {
  const { address, isConnected } = useAccount();

  // REAL TOKEN MODE: Contract balance check
  const isRealMode = !HOLDER_TEST_MODE;
  const isContractConfigured = Boolean(TOKEN_CONFIG.contractAddress && TOKEN_CONFIG.contractAddress.trim() !== '');

  // Read ERC-20 decimals
  const { data: decimalsData } = useReadContract({
    address: isContractConfigured ? TOKEN_CONFIG.contractAddress : undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: ROBINHOOD_CHAIN_ID,
    query: {
      enabled: isRealMode && isContractConfigured,
    },
  });

  // Read ERC-20 balanceOf(connectedWallet) on Robinhood Chain Mainnet (4663)
  const {
    data: contractBalance,
    isLoading: isContractLoading,
    isError: isContractError,
    refetch,
  } = useReadContract({
    address: isContractConfigured ? TOKEN_CONFIG.contractAddress : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ROBINHOOD_CHAIN_ID,
    query: {
      enabled: isRealMode && isContractConfigured && Boolean(address) && isConnected,
      refetchInterval: 10000, // Auto recheck every 10s
    },
  });

  if (!isConnected || !address) {
    return {
      isHolder: false,
      tokenBalance: null,
      formattedTokenBalance: '0 GBLC',
      decimals: TOKEN_CONFIG.decimals,
      tier: 'NONE',
      allowance: 0,
      loading: false,
      error: null,
      isTestMode: HOLDER_TEST_MODE,
      refetch: () => {},
    };
  }

  // TEST MODE logic (only active if HOLDER_TEST_MODE = true)
  if (HOLDER_TEST_MODE) {
    const normAddr = address.toLowerCase();
    const isAllowlisted =
      TEST_ALLOW_ALL_IN_DEV ||
      TEST_HOLDER_WALLETS.some((w) => w.toLowerCase() === normAddr);

    if (isAllowlisted) {
      return {
        isHolder: true,
        tokenBalance: null, // Do NOT fake token balance in test mode
        formattedTokenBalance: 'TESTER AUTHORIZED',
        decimals: TOKEN_CONFIG.decimals,
        tier: 'BASIC',
        allowance: HOLDER_TIERS.BASIC.allowance,
        loading: false,
        error: null,
        isTestMode: true,
        refetch: () => {},
      };
    }

    return {
      isHolder: false,
      tokenBalance: null,
      formattedTokenBalance: '0 GBLC',
      decimals: TOKEN_CONFIG.decimals,
      tier: 'NONE',
      allowance: 0,
      loading: false,
      error: null,
      isTestMode: true,
      refetch: () => {},
    };
  }

  // REAL TOKEN MODE logic (Production Access)
  const decimals = typeof decimalsData === 'number' ? decimalsData : TOKEN_CONFIG.decimals;

  if (!isContractConfigured) {
    return {
      isHolder: false,
      tokenBalance: null,
      formattedTokenBalance: '0 GBLC',
      decimals,
      tier: 'NONE',
      allowance: 0,
      loading: false,
      error: 'TOKEN CONTRACT NOT CONFIGURED',
      isTestMode: false,
      refetch,
    };
  }

  if (isContractLoading) {
    return {
      isHolder: false,
      tokenBalance: null,
      formattedTokenBalance: 'READING ONCHAIN...',
      decimals,
      tier: 'NONE',
      allowance: 0,
      loading: true,
      error: null,
      isTestMode: false,
      refetch,
    };
  }

  if (isContractError || contractBalance === undefined) {
    return {
      isHolder: false,
      tokenBalance: 0n,
      formattedTokenBalance: '0 GBLC',
      decimals,
      tier: 'NONE',
      allowance: 0,
      loading: false,
      error: 'UNABLE TO READ ONCHAIN BALANCE',
      isTestMode: false,
      refetch,
    };
  }

  const balance = contractBalance;
  // LAUNCH ACCESS RULE: tokenBalance > 0 grants holder access (100 CR)
  const isHolder = balance > 0n;
  const tier = isHolder ? 'BASIC' : 'NONE';
  const allowance = isHolder ? HOLDER_TIERS.BASIC.allowance : 0;
  const formattedTokenBalance = `${parseFloat(formatUnits(balance, decimals)).toLocaleString('en-US', { maximumFractionDigits: 4 })} GBLC`;

  return {
    isHolder,
    tokenBalance: balance,
    formattedTokenBalance,
    decimals,
    tier,
    allowance,
    loading: false,
    error: null,
    isTestMode: false,
    refetch,
  };
}
