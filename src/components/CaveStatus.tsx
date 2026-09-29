import React from 'react';
import { TerminalWindow } from './TerminalWindow';
import { useAccount } from 'wagmi';

interface CaveStatusProps {
  computeCredits?: number;
  formattedBalance?: string;
  isCorrectNetwork?: boolean;
}

export const CaveStatus: React.FC<CaveStatusProps> = ({
  computeCredits = 0,
  isCorrectNetwork = true,
}) => {
  const { isConnected } = useAccount();

  // Pixel Equalizer Graphic
  const EqualizerGraphic = (
    <div className="flex items-end gap-[3px] h-6 px-1 py-0.5">
      <div className="w-[3px] h-3 bg-[#60FF70] animate-pulse"></div>
      <div className="w-[3px] h-5 bg-[#60FF70]"></div>
      <div className="w-[3px] h-2 bg-[#60FF70]"></div>
      <div className="w-[3px] h-6 bg-[#60FF70] animate-pulse"></div>
      <div className="w-[3px] h-4 bg-[#60FF70]"></div>
      <div className="w-[3px] h-2 bg-[#60FF70]"></div>
      <div className="w-[3px] h-5 bg-[#60FF70]"></div>
    </div>
  );

  return (
    <TerminalWindow title="CAVE STATUS" footerGraphic={EqualizerGraphic}>
      <div className="space-y-2.5 pt-1">
        <div className="flex justify-between items-center">
          <span className="text-[#688D6C]">COMPUTE POOL</span>
          <span className="text-[#60FF70] font-bold">ACTIVE</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#688D6C]">NETWORK</span>
          <span className={isConnected ? (isCorrectNetwork ? "text-[#60FF70]" : "text-amber-400 font-bold") : "text-[#688D6C]"}>
            {isConnected ? (isCorrectNetwork ? 'ROBINHOOD (4663)' : 'WRONG NETWORK') : 'DISCONNECTED'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#688D6C]">GOBLINS</span>
          <span className="text-[#60FF70]">01</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#688D6C]">COMPUTE CREDITS</span>
          <span className="text-[#60FF70] font-bold">
            {computeCredits.toLocaleString()} CR
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#688D6C]">TREASURY</span>
          <span className="text-[#688D6C] font-mono text-[11px]">
            COMING SOON
          </span>
        </div>
      </div>
    </TerminalWindow>
  );
};
