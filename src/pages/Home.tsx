import React, { useState } from 'react';
import { GoblinMascot } from '../components/GoblinMascot';
import { CaveStatus } from '../components/CaveStatus';
import { ActivityLog } from '../components/ActivityLog';
import { TerminalButton } from '../components/TerminalButton';
import type { ActivityItem } from '../hooks/useGoblinSession';

interface HomeProps {
  onNavigate: (route: string) => void;
  computeCredits: number;
  formattedBalance: string;
  isCorrectNetwork: boolean;
  activityLogs: ActivityItem[];
}

export const Home: React.FC<HomeProps> = ({
  onNavigate,
  computeCredits,
  formattedBalance,
  isCorrectNetwork,
  activityLogs,
}) => {
  const [copiedCa, setCopiedCa] = useState(false);
  return (
    <div className="w-full flex flex-col justify-between min-h-[calc(100vh-65px)] p-4 md:p-8 lg:p-10 font-mono select-none">
      {/* Top Banner alert if wrong network */}
      {!isCorrectNetwork && (
        <div className="mb-4 p-3 border border-amber-500 bg-amber-950/40 text-amber-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold">&gt; WRONG NETWORK DETECTED</span> — Please switch to Robinhood Chain (ID: 4663)
          </div>
          <button
            onClick={() => onNavigate('/cave')}
            className="text-xs bg-amber-500 text-black px-3 py-1 font-bold hover:bg-amber-400 cursor-pointer"
          >
            SWITCH TO ROBINHOOD
          </button>
        </div>
      )}

      {/* Main Hero & Right Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

        {/* Left Hero & Center Mascot Section (Cols 1-8) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">

          {/* Hero Left Content & Goblin Mascot in responsive flex/grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

            {/* Left Headline & CTAs (7 cols on md) */}
            <div className="md:col-span-7 space-y-5">
              {/* Chain Tag */}
              <div className="text-xs text-[#688D6C] font-mono tracking-widest flex items-center gap-2">
                <span>// NOW ON ROBINHOOD CHAIN</span>
                <span className="text-[10px] text-[#60FF70] border border-[#60FF70]/40 px-1 py-0.2">[EARLY ACCESS]</span>
              </div>

              {/* Main Headline in chunky pixel font - EXACT HERO UNCHANGED */}
              <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl lg:text-[42px] leading-[1.25] text-[#60FF70] crt-glow tracking-tight uppercase">
                GOBLIN<br />
                COMPUTE<br />
                FOR AI
              </h1>

              {/* Subheadline */}
              <p className="text-xs sm:text-sm text-[#A3FFB2] leading-relaxed max-w-md font-mono">
                Market activity funds compute.<br />
                The goblins turn it into AI infrastructure<br />
                for agents, models, and onchain applications.
              </p>

              {/* Requirement #1: Small Terminal Onboarding Flow */}
              <div className="pt-1 pb-1 space-y-1.5 border-l-2 border-[#60FF70]/40 pl-3">
                <div className="text-[11px] text-[#60FF70] font-bold tracking-wider uppercase flex items-center gap-2">
                  <span>CONNECT</span>
                  <span className="text-[#688D6C]">&rarr;</span>
                  <span>ACTIVATE</span>
                  <span className="text-[#688D6C]">&rarr;</span>
                  <span>COMPUTE</span>
                </div>
                <div className="text-[11px] text-[#688D6C] leading-snug">
                  Connect your wallet, activate your Goblin, and use Compute Credits to run AI tasks.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <TerminalButton
                  variant="primary"
                  iconArrow={true}
                  onClick={() => onNavigate('/cave')}
                >
                  [ ENTER THE CAVE ]
                </TerminalButton>

                <TerminalButton
                  variant="outline"
                  onClick={() => onNavigate('/docs')}
                >
                  [ READ DOCS ]
                </TerminalButton>
              </div>

              {/* TOKEN CA SECTION */}
              <div className="p-3.5 border border-[#60FF70]/60 bg-[#123B17]/25 box-glow space-y-2 font-mono mt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#60FF70] font-bold tracking-widest">&gt; TOKEN CA</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('0x32cC99E041785f833F72fd5Bca1376fB94959169');
                      setCopiedCa(true);
                      setTimeout(() => setCopiedCa(false), 2000);
                    }}
                    className="text-xs bg-[#60FF70] text-black px-2.5 py-1 font-bold hover:bg-[#80FF8E] transition-colors cursor-pointer"
                  >
                    {copiedCa ? '[ COPIED ]' : '[ COPY CA ]'}
                  </button>
                </div>
                <div className="text-xs text-[#60FF70] font-bold break-all select-all font-mono tracking-wide">
                  0x32cC99E041785f833F72fd5Bca1376fB94959169
                </div>
              </div>
            </div>

            {/* Center Mascot (5 cols on md) */}
            <div className="md:col-span-5 flex items-center justify-center pt-2 md:pt-0">
              <GoblinMascot />
            </div>

          </div>

        </div>

        {/* Right Column Information Panels (Cols 9-12) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <CaveStatus
            computeCredits={computeCredits}
            formattedBalance={formattedBalance}
            isCorrectNetwork={isCorrectNetwork}
          />

          <ActivityLog logs={activityLogs} />
        </div>

      </div>

      {/* Bottom Information Row matching exact visual layout of reference image */}
      <div className="mt-8 lg:mt-12 pt-6 border-t border-[#60FF70]/30 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-[#60FF70]">

        {/* Current Real Product Flow */}
        <div className="space-y-1.5 font-mono">
          <div className="text-[10px] text-[#688D6C] font-bold tracking-widest mb-1">// CURRENT PRODUCT FLOW</div>
          <div className="flex items-center gap-3">
            <span className="text-[#60FF70] text-[10px]">▶</span>
            <span className="text-[#688D6C] w-6">01</span>
            <span className="w-36 text-[#60FF70]">CONNECT WALLET</span>
            <span className="text-[#688D6C]">→</span>
            <span className="text-[#688D6C]">VERIFY OWNERSHIP</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-transparent text-[10px]">▶</span>
            <span className="text-[#688D6C] w-6">02</span>
            <span className="w-36 text-[#60FF70]">ACTIVATE GOBLIN</span>
            <span className="text-[#688D6C]">→</span>
            <span className="text-[#688D6C]">CREATE SESSION</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-transparent text-[10px]">▶</span>
            <span className="text-[#688D6C] w-6">03</span>
            <span className="w-36 text-[#60FF70]">RECEIVE CREDITS</span>
            <span className="text-[#688D6C]">→</span>
            <span className="text-[#688D6C]">RUN AI TASKS</span>
          </div>
        </div>

        {/* Bottom Right Comments Footer */}
        <div className="font-mono text-right text-[11px] text-[#688D6C] space-y-0.5">
          <div>// GOBLIN COMPUTE</div>
          <div>// ROBINHOOD CHAIN (4663)</div>
          <div>// EARLY ACCESS // BUILD 0.2.0</div>
        </div>

      </div>
    </div>
  );
};
