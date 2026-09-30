import React, { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ROBINHOOD_CHAIN_ID } from '../config/chains';
import { TOKEN_CA } from '../config/holderAccess';
import { TerminalButton } from './TerminalButton';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenWalletModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenWalletModal,
}) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = chainId === ROBINHOOD_CHAIN_ID;
  const [copiedCa, setCopiedCa] = useState(false);

  const handleCopyCa = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(TOKEN_CA);
    setCopiedCa(true);
    setTimeout(() => setCopiedCa(false), 2000);
  };

  const navItems = [
    { label: '[ HOME ]', route: '/' },
    { label: '[ CAVE ]', route: '/cave' },
    { label: '[ COMPUTE ]', route: '/compute' },
    { label: '[ NPCS ]', route: '/npcs' },
    { label: '[ DOCS ]', route: '/docs' },
  ];

  return (
    <nav className="w-full flex flex-col md:flex-row items-center justify-between py-3 px-4 md:px-8 border-b border-[#60FF70]/30 gap-3 bg-[#050805]/90 select-none">
      {/* Left Logo & Header Token CA */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div
          className="flex items-center gap-1.5 font-mono text-base font-bold text-[#60FF70] cursor-pointer tracking-wider"
          onClick={() => onNavigate('/')}
        >
          <span>&gt; GOBLIN</span>
          <span className="w-2.5 h-4 bg-[#60FF70] inline-block animate-blink"></span>
        </div>

        {/* Compact Header Token CA Badge */}
        <div className="flex items-center gap-1.5 border border-[#60FF70]/50 bg-[#123B17]/40 px-2 py-0.5 text-[10px] sm:text-xs font-mono">
          <span className="text-[#688D6C] font-bold">CA:</span>
          <span className="text-[#60FF70] font-bold font-mono">0x32cC...9169</span>
          <button
            onClick={handleCopyCa}
            className="text-[9px] sm:text-[10px] bg-[#60FF70] text-black px-1.5 py-0.2 font-bold hover:bg-[#80FF8E] transition-colors cursor-pointer ml-0.5"
            title="Copy Token Contract Address"
          >
            {copiedCa ? '[ COPIED ]' : '[ COPY ]'}
          </button>
        </div>
      </div>

      {/* Center Nav Links */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-3 text-xs font-mono">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`px-2 py-1 transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#60FF70] font-bold underline decoration-[#60FF70] underline-offset-4 bg-[#60FF70]/10'
                  : 'text-[#60FF70]/70 hover:text-[#60FF70] hover:bg-[#60FF70]/5'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Right Wallet Action */}
      <div className="flex items-center gap-2">
        {isConnected && !isCorrectNetwork && (
          <TerminalButton
            variant="danger"
            onClick={onOpenWalletModal}
            className="text-[11px] py-1"
          >
            ! WRONG NETWORK
          </TerminalButton>
        )}

        <TerminalButton
          variant="bracket"
          onClick={onOpenWalletModal}
          className="text-xs"
        >
          {isConnected && address ? (
            <span>[ {address.substring(0, 6)}...{address.substring(address.length - 4)} ]</span>
          ) : (
            <span>[ CONNECT ]</span>
          )}
        </TerminalButton>
      </div>
    </nav>
  );
};
