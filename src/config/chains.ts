import { defineChain } from 'viem';

/**
 * Robinhood Chain Mainnet Centralized Config
 * Target Chain ID: 4663
 */
export const ROBINHOOD_CHAIN_ID = 4663;

export const robinhoodChain = defineChain({
  id: ROBINHOOD_CHAIN_ID,
  name: 'Robinhood Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [
        'https://robinhood.drpc.org',
        'https://rpc.robinhoodchain.com',
        'https://mainnet-rpc.robinhoodchain.com',
      ],
    },
    public: {
      http: [
        'https://robinhood.drpc.org',
        'https://rpc.robinhoodchain.com',
        'https://mainnet-rpc.robinhoodchain.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Robinhood Explorer',
      url: 'https://explorer.robinhoodchain.com',
    },
  },
  contracts: {},
});

export const CHAIN_CONFIG = {
  chainId: ROBINHOOD_CHAIN_ID,
  chainName: 'Robinhood Chain Mainnet',
  nativeCurrency: 'ETH',
  rpcUrl: 'https://robinhood.drpc.org',
  explorerUrl: 'https://explorer.robinhoodchain.com',
  isFallbackEnabled: true,
};

export function isRobinhoodChain(chainId?: number): boolean {
  return chainId === ROBINHOOD_CHAIN_ID;
}
