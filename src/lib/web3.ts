import { createConfig, http } from 'wagmi';
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
  chains: [robinhoodChain],
  connectors: [
    injected({
      target: 'metaMask',
    }),
    injected(),
  ],
  transports: {
    [robinhoodChain.id]: http('https://rpc.robinhoodchain.com', {
      timeout: 5000,
    }),
  },
});
