import { useState, useEffect } from 'react';
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

  // Stable confirmed balance state to prevent 0-balance refetch flicker
  const [confirmedBalance, setConfirmedBalance] = useState<bigint | null>(null);
  const [confirmedHolder, setConfirmedHolder] = useState<boolean | null>(null);

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
      staleTime: 60000,
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
      refetchInterval: 15000, // Stable auto-check every 15s
      refetchOnWindowFocus: false, // Prevent redundant refetch loops on tab focus
    },
  });

  // Retain confirmed balance state upon successful onchain response
  useEffect(() => {
    if (typeof contractBalance === 'bigint') {
      setConfirmedBalance(contractBalance);
      setConfirmedHolder(contractBalance > 0n);
    }
  }, [contractBalance]);

  // Reset confirmed balance when wallet address changes or disconnects
  useEffect(() => {
    setConfirmedBalance(null);
    setConfirmedHolder(null);
  }, [address]);

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
        tokenBalance: null,
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

  // Initial Load state (before first confirmed balance is stored)
  if (confirmedBalance === null) {
    if (isContractLoading) {
      return {
        isHolder: false,
        tokenBalance: null,
        formattedTokenBalance: 'CHECKING HOLDER STATUS...',
        decimals,
        tier: 'NONE',
        allowance: 0,
        loading: true,
        error: null,
        isTestMode: false,
        refetch,
      };
    }

    if (isContractError) {
      return {
        isHolder: false,
        tokenBalance: null,
        formattedTokenBalance: '0 GBLC',
        decimals,
        tier: 'NONE',
        allowance: 0,
        loading: false,
        error: 'NETWORK CHECK FAILED / RETRYING',
        isTestMode: false,
        refetch,
      };
    }

    return {
      isHolder: false,
      tokenBalance: null,
      formattedTokenBalance: 'CHECKING HOLDER STATUS...',
      decimals,
      tier: 'NONE',
      allowance: 0,
      loading: true,
      error: null,
      isTestMode: false,
      refetch,
    };
  }

  // Confirmed balance exists: retain last valid balance across background refetches and RPC glitches
  const balance = confirmedBalance;
  const isHolder = confirmedHolder ?? (balance > 0n);
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
    error: isContractError ? 'NETWORK CHECK FAILED / RETRYING' : null,
    isTestMode: false,
    refetch,
  };
}
