import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, arbitrum, base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient } from '@tanstack/react-query';
import { robinhoodChain } from '../config/chains';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const wagmiConfig = createConfig({
  chains: [robinhoodChain, mainnet, sepolia, arbitrum, base],
  connectors: [
    injected(),
  ],
  transports: {
    [robinhoodChain.id]: http('https://rpc.robinhoodchain.com', {
      timeout: 5000,
    }),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});
