import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { ROBINHOOD_CHAIN_ID } from '../config/chains';
import { TerminalButton } from './TerminalButton';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: balanceData } = useBalance({ address });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isCorrectNetwork = chainId === ROBINHOOD_CHAIN_ID;

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedBalance = balanceData
    ? `${parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)} ${balanceData.symbol}`
    : '0.042 ETH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-md border border-[#60FF70] bg-[#050805] p-5 shadow-[0_0_20px_rgba(96,255,112,0.25)] relative font-mono">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#60FF70]/40">
          <div className="text-xs font-bold tracking-widest text-[#60FF70] uppercase flex items-center gap-2">
            <span>&gt;</span>
            <span>{isConnected ? 'WALLET SESSION' : 'CONNECT TERMINAL WALLET'}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#60FF70] hover:text-white text-sm font-bold cursor-pointer px-1"
          >
            [X]
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs">
          {!isConnected ? (
            <div className="space-y-3">
              <p className="text-[#688D6C]">
                Select an injected Web3 wallet to connect to Goblin Compute node:
              </p>
              <div className="space-y-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => {
                      connect({ connector });
                      onClose();
                    }}
                    disabled={isConnecting}
                    className="w-full text-left p-3 border border-[#60FF70]/60 hover:border-[#60FF70] hover:bg-[#60FF70]/10 text-[#60FF70] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="font-bold">&gt; {connector.name.toUpperCase()}</span>
                    <span className="text-[10px] text-[#688D6C]">[INJECTED]</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2 bg-[#123B17]/20 p-3 border border-[#60FF70]/30">
                <div className="flex justify-between">
                  <span className="text-[#688D6C]">ADDRESS:</span>
                  <span className="text-[#60FF70] font-bold">
                    {address ? `${address.substring(0, 8)}...${address.substring(address.length - 6)}` : ''}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#688D6C]">NETWORK:</span>
                  <span className={isCorrectNetwork ? "text-[#60FF70]" : "text-amber-400 font-bold"}>
                    {isCorrectNetwork ? 'ROBINHOOD CHAIN (4663)' : `UNSUPPORTED (${chainId})`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#688D6C]">BALANCE:</span>
                  <span className="text-[#60FF70] font-bold">
                    {formattedBalance}
                  </span>
                </div>
              </div>

              {!isCorrectNetwork && (
                <div className="p-3 bg-amber-950/40 border border-amber-500/60 text-amber-300 text-[11px] space-y-2">
                  <div className="font-bold">&gt; WRONG NETWORK DETECTED</div>
                  <p>Please switch your active chain to Robinhood Chain Mainnet (Chain ID: 4663).</p>
                  <TerminalButton
                    variant="outline"
                    className="w-full border-amber-500 text-amber-300 hover:bg-amber-500/20"
                    onClick={() => switchChain({ chainId: ROBINHOOD_CHAIN_ID })}
                  >
                    SWITCH TO ROBINHOOD CHAIN
                  </TerminalButton>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <TerminalButton
                  variant="outline"
                  className="flex-1"
                  onClick={copyAddress}
                >
                  {copied ? 'COPIED!' : 'COPY ADDRESS'}
                </TerminalButton>

                <TerminalButton
                  variant="danger"
                  onClick={() => {
                    disconnect();
                    onClose();
                  }}
                >
                  DISCONNECT
                </TerminalButton>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-[#60FF70]/20 flex justify-between text-[10px] text-[#688D6C]">
          <span>ROBINHOOD CHAIN: 4663</span>
          <span>STATUS: ONLINE</span>
        </div>
      </div>
    </div>
  );
};
