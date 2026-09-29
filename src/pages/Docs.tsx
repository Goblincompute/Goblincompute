import React from 'react';
import { TerminalWindow } from '../components/TerminalWindow';
import { TerminalButton } from '../components/TerminalButton';

interface DocsProps {
  onNavigate: (route: string) => void;
}

export const Docs: React.FC<DocsProps> = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-[calc(100vh-65px)] p-4 md:p-8 font-mono select-none space-y-6 max-w-5xl mx-auto">
      {/* Title Bar */}
      <div className="border border-[#60FF70]/50 p-3 bg-[#050805] flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#60FF70] uppercase">
          <span>&gt; TERMINAL DOCUMENTATION</span>
          <span className="text-[#688D6C]">// SYSTEM SPEC & BETA ARCHITECTURE</span>
        </div>
        <TerminalButton variant="outline" className="py-0.5 px-2 text-[10px]" onClick={() => onNavigate('/')}>
          [ BACK TO HERO ]
        </TerminalButton>
      </div>

      {/* SECTION 1: WHAT WORKS TODAY */}
      <TerminalWindow title="WHAT WORKS TODAY">
        <div className="space-y-3 pt-2 text-xs text-[#A3FFB2]">
          <p className="text-[#60FF70] font-bold">
            Goblin Compute currently demonstrates real Web3 wallet identity and signature session activation.
          </p>
          <div className="space-y-1.5 pl-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-[#60FF70]">1.</span>
              <span>Connect a real Web3 wallet (MetaMask / Injected).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#60FF70]">2.</span>
              <span>Detect Robinhood Chain Mainnet (Chain ID: 4663).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#60FF70]">3.</span>
              <span>Read native wallet balance via Viem/Wagmi RPC queries.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#60FF70]">4.</span>
              <span>Cryptographically verify wallet ownership by signing a message ("Goblin Compute Activation").</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#60FF70]">5.</span>
              <span>Activate a Goblin session (e.g. GC-XXXXXXXX).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#60FF70]">6.</span>
              <span>Receive Compute Credits (+100 CR) inside the application.</span>
            </div>
          </div>
        </div>
      </TerminalWindow>

      {/* SECTION 2: HOLDER-GATED COMPUTE & CREDITS SPECIFICATION */}
      <TerminalWindow title="HOLDER-GATED COMPUTE SPECIFICATION">
        <div className="space-y-3 pt-2 text-xs text-[#A3FFB2]">
          <p className="text-[#60FF70] font-bold">
            Goblin Compute turns token ownership into access to AI compute.
          </p>
          <p className="text-xs text-[#A3FFB2]">
            Verified holders receive a Compute Allowance that can be used to run AI inference and future AI tools.
          </p>
          <div className="space-y-1 pl-2 text-xs text-[#A3FFB2]">
            <div>• Compute Credits are internal application access units</div>
            <div>• Are stored as local session application state</div>
            <div>• Are non-transferable</div>
            <div>• Are not a token</div>
            <div>• Are not a financial asset</div>
          </div>
          <p className="text-[#688D6C] text-[11px] pt-1">
            Credits represent application compute access units inside Goblin Compute. They do not represent transferable tokens or financial instruments.
          </p>
        </div>
      </TerminalWindow>

      {/* SECTION 3: SYSTEM FLOW PIPELINES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Current Real Product Flow */}
        <TerminalWindow title="// HOLDER-GATED ACCESS FLOW">
          <div className="p-3 bg-[#123B17]/20 border border-[#60FF70]/30 font-mono text-xs space-y-2 text-[#60FF70]">
            <div className="p-1.5 border border-[#60FF70]/40 bg-[#050805]">01. HOLD / AUTHORIZED WALLET</div>
            <div className="text-center text-[#688D6C]">↓</div>
            <div className="p-1.5 border border-[#60FF70]/40 bg-[#050805]">02. VERIFY ACCESS</div>
            <div className="text-center text-[#688D6C]">↓</div>
            <div className="p-1.5 border border-[#60FF70]/40 bg-[#050805]">03. COMPUTE ALLOWANCE (100 CR)</div>
            <div className="text-center text-[#688D6C]">↓</div>
            <div className="p-1.5 border border-[#60FF70]/40 bg-[#050805]">04. RUN INFERENCE</div>
            <div className="text-center text-[#688D6C]">↓</div>
            <div className="p-1.5 border border-[#60FF70]/60 bg-[#60FF70]/10 text-white font-bold">05. SPEND COMPUTE CREDITS (2 CR)</div>
          </div>
        </TerminalWindow>

        {/* Future Architecture Roadmap */}
        <TerminalWindow title="// NETWORK ROADMAP">
          <div className="p-3 bg-neutral-900/60 border border-neutral-700 font-mono text-xs space-y-2 text-[#688D6C]">
            <div className="p-1.5 border border-neutral-700 bg-black">01. ONCHAIN ACTIVITY</div>
            <div className="text-center">↓</div>
            <div className="p-1.5 border border-neutral-700 bg-black">02. PROTOCOL TREASURY</div>
            <div className="text-center">↓</div>
            <div className="p-1.5 border border-neutral-700 bg-black">03. COMPUTE INFRASTRUCTURE</div>
            <div className="text-center">↓</div>
            <div className="p-1.5 border border-neutral-700 bg-black">04. AI AGENTS</div>
          </div>
        </TerminalWindow>

      </div>

      {/* Network Specs */}
      <TerminalWindow title="ROBINHOOD CHAIN SPECIFICATION">
        <div className="space-y-2 pt-2 text-xs">
          <div className="flex justify-between border-b border-[#60FF70]/20 pb-1">
            <span className="text-[#688D6C]">TARGET NETWORK</span>
            <span className="text-[#60FF70] font-bold">ROBINHOOD CHAIN MAINNET</span>
          </div>
          <div className="flex justify-between border-b border-[#60FF70]/20 pb-1">
            <span className="text-[#688D6C]">CHAIN ID</span>
            <span className="text-[#60FF70]">4663</span>
          </div>
          <div className="flex justify-between border-b border-[#60FF70]/20 pb-1">
            <span className="text-[#688D6C]">NATIVE SYMBOL</span>
            <span className="text-[#60FF70]">ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#688D6C]">VERIFICATION</span>
            <span className="text-[#60FF70]">EIP-191 CRYPTOGRAPHIC SIGNATURES</span>
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
};
